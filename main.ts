import db from "./src/db.ts";
import Telegram from "./src/telegram/telegram.ts";
import Twitch from "./src/twitch/twitch.ts";

const TELEGRAM_TOKEN = Deno.env.get("TG_T0K3N");
const TELEGRAM_GROUP = Deno.env.get("TG_CH4T_1D");
const TWITCH_CLIENT_ID = Deno.env.get("TW_CL13NT_1D");
const TWITCH_CLIENT_SECRET = Deno.env.get("TW_CL13NT_S3CR3T");
const TWITCH_CHANNEL = "godzillaz_tv";

async function onLiveStart(telegram: Telegram, chat: number) {
  console.info("Live started, lets go!");
  try {
    const messageId = await telegram.sendPinnedMessage(
      chat,
      "I GodzillaZ sono live! Seguili ora su twitch: https://twitch.tv/godzillaz_tv",
    );
    const result = await db.get(["pinnedMessages"]);
    const pinnedMessages: number[] = Array.isArray(result.value)
      ? result.value
      : [];
    const updatedPinnedMessages = [...pinnedMessages, messageId];
    // FIXME: atomic operations
    await db.set(["telegram", "pinnedMessages"], updatedPinnedMessages);
  } catch {
    console.warn("Probably could not pin message");
  }
}

async function onLiveEnd(telegram: Telegram, chat: number) {
  console.info("Live ended, sadge :(");
  const result = await db.get(["telegram", "pinnedMessages"]);
  const pinnedMessages: number[] = Array.isArray(result.value)
    ? result.value
    : [];
  pinnedMessages.forEach(async (messageId) => {
    try {
      await telegram.unpinMessage(chat, messageId);
    } catch {
      console.warn("Probably could not unpin message");
    }
  });
  // FIXME: atomic operations
  await db.delete(["pinnedMessages"]);
}

if (import.meta.main) {
  try {
    if (TELEGRAM_TOKEN === undefined) {
      throw new Error(`Cannot get telegram token`);
    }
    if (TELEGRAM_GROUP === undefined) {
      throw new Error(`Cannot get telegram group id`);
    }
    if (TWITCH_CLIENT_ID === undefined) {
      throw new Error(`Cannot get telegram client id`);
    }
    if (TWITCH_CLIENT_SECRET === undefined) {
      throw new Error(`Cannot get twitch client secret`);
    }

    const TELEGRAM_GROUP_ID: number = +TELEGRAM_GROUP;
    const telegram = new Telegram(TELEGRAM_TOKEN);
    // TODO: use real twitch app (WebHooks)
    const twitch = new Twitch(
      TWITCH_CHANNEL,
      db,
      TWITCH_CLIENT_ID,
      TWITCH_CLIENT_SECRET,
    );
    await twitch.init();
    twitch.startMonitoring();
    twitch.onOnline = async () => {
      await onLiveStart(telegram, TELEGRAM_GROUP_ID);
    };
    twitch.onOffline = async () => {
      await onLiveEnd(telegram, TELEGRAM_GROUP_ID);
    };

    Deno.addSignalListener("SIGINT", () => {
      console.log("Caught SIGINT. Exiting gracefully...");
      Deno.exit(0);
    });

    setInterval(() => {}, 1000);
  } catch (_error) {
    console.error(_error);
  }
}
