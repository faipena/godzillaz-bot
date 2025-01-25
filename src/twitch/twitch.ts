import TwitchAPI from "./api.ts";
import { TwitchCredentials } from "./types.ts";

export default class Twitch {
  readonly channel: string;
  readonly db: Deno.Kv;
  api: TwitchAPI;
  timer?: number;

  constructor(
    channel: string,
    db: Deno.Kv,
    clientId: string,
    clientSecret: string,
  ) {
    this.channel = channel;
    this.db = db;
    this.api = new TwitchAPI(clientId, clientSecret);
  }

  async init() {
    await this.scheduleTokenRefresh();
  }

  async scheduleTokenRefresh() {
    let result = await this.db.get(["twitch", "credentials", "saved"]);
    if (result.value) {
      this.api.credentials = result.value as TwitchCredentials;
    }
    result = await this.db.get(["twitch", "credentials", "expirationDate"]);
    let savedExpiry: Temporal.Instant = result.value
      ? Temporal.Instant.fromEpochMilliseconds(result.value as number)
      : Temporal.Now.instant();
    savedExpiry = savedExpiry.add({ seconds: -10 });
    const now = Temporal.Now.instant();
    const delay = (savedExpiry.epochMilliseconds - now.epochMilliseconds) > 0
      ? (savedExpiry.epochMilliseconds - now.epochMilliseconds) / 1000
      : 0;
    console.info(
      `Twitch token refresh scheduled for ${savedExpiry.toString()}`,
    );
    setTimeout(async () => {
      await this.refreshToken();
    }, delay);
  }

  private async refreshToken() {
    console.info("Refreshing Twitch token");
    let expiration = Temporal.Now.instant();
    try {
      const newCredentials = await this.api.getToken();
      this.api.credentials = newCredentials;
      await this.db.set(["twitch", "credentials", "saved"], newCredentials);
      expiration = Temporal.Now.instant().add({
        seconds: newCredentials.expires_in,
      });
    } finally {
      await this.db.set(
        ["twitch", "credentials", "expirationDate"],
        expiration.epochMilliseconds,
      );
      await this.scheduleTokenRefresh();
    }
  }

  onOnline?: () => void;

  onOffline?: () => void;

  startMonitoring(interval: number = 5000) {
    this.timer = setInterval(async () => {
      const streams = await this.api.getStreams({ user_login: this.channel });
      const isLive = streams.length > 0;
      const wasLive: boolean =
        (await this.db.get(["twitch", this.channel])).value === true;
      if (wasLive && !isLive) {
        await this.db.set(["twitch", "monitoring", this.channel], false);
        if (this.onOffline) this.onOffline();
      } else if (isLive && !wasLive) {
        await this.db.set(["twitch", "monitoring", this.channel], true);
        if (this.onOnline) this.onOnline();
      }
    }, interval);
  }

  stopMonitoring() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
