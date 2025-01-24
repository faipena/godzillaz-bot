import db from "./db.ts";
import Telegram from "./telegram/telegram.ts";
import Twitch from "./twitch.ts";

const TELEGRAM_TOKEN = Deno.env.get("TG_T0K3N");
const TELEGRAM_GROUP_ID = parseInt(Deno.env.get("TG_CH4T_1D") ?? "0");
const TWITCH_CHANNEL = "godzillaz_tv"

async function onLiveStart(telegram: Telegram) {
  console.info("Live started, lets go!");
  try {
    const messageId = await telegram.sendPinnedMessage(TELEGRAM_GROUP_ID, "I GodzillaZ sono live! Seguili ora su twitch: https://twitch.tv/godzillaz_tv");
    const result = await db.get(["pinnedMessages"]);
    const pinnedMessages : number[] = Array.isArray(result.value) ? result.value : [];
    const updatedPinnedMessages = [...pinnedMessages, messageId];
    // FIXME: atomic operations
    await db.set(["pinnedMessages"], updatedPinnedMessages);
  } catch { console.warn("Probably could not pin message"); }
}

async function onLiveEnd(telegram: Telegram) {
  console.info("Live ended, sadge :(");
  const result = await db.get(["pinnedMessages"]);
  const pinnedMessages: number[] = Array.isArray(result.value) ? result.value : [];
  pinnedMessages.forEach(async (messageId) => {
    try {
      await telegram.unpinMessage(TELEGRAM_GROUP_ID, messageId);
    } catch { console.warn("Probably could not unpin message"); }
  });
  // FIXME: atomic operations
  await db.delete(["pinnedMessages"]);
}


if (import.meta.main) {
  if (TELEGRAM_TOKEN === undefined) throw new Error(`Cannot get telegram token`);

  try {
    const telegram = new Telegram(TELEGRAM_TOKEN);
    // TODO: use real twitch app (WebHooks)
    const twitch = new Twitch(TWITCH_CHANNEL, db);
    twitch.startMonitoring();
    twitch.onOnline = async () => { await onLiveStart(telegram) };
    twitch.onOffline = async () => { await onLiveEnd(telegram) };
    
    Deno.addSignalListener("SIGINT", () => {
      console.log("Caught SIGINT. Exiting gracefully...");
      Deno.exit(0);
    });

    setInterval(() => {}, 1000);
  } catch (_error) {
    console.error(_error)
  }
}