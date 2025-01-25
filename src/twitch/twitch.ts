import TwitchAPI from "./api.ts";
import { TwitchCredentials } from "./types.ts";

const TOKEN_REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 Hour
const STREAM_MONITOR_INTERVAL_MS = 30 * 1000; // 30 seconds

export default class Twitch {
  readonly channel: string;
  readonly db: Deno.Kv;
  api: TwitchAPI;
  timerMonitor?: number;
  timerToken?: number;

  constructor(
    channel: string,
    db: Deno.Kv,
    clientId: string,
    clientSecret: string,
  ) {
    this.channel = channel;
    this.db = db;
    this.api = new TwitchAPI(clientId, clientSecret);
    setInterval(async () => {
      await this.scheduleTokenRefresh();
    }, TOKEN_REFRESH_INTERVAL_MS);
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
    savedExpiry = savedExpiry.add({
      milliseconds: -2 * TOKEN_REFRESH_INTERVAL_MS,
    });
    const now = Temporal.Now.instant();
    const timeLeft = savedExpiry.epochMilliseconds - now.epochMilliseconds;
    if (timeLeft <= 0) {
      await this.refreshToken();
    } else {
      console.debug(`twitch token savedExpiry: ${savedExpiry}`);
      console.debug(
        `time left: ${
          Temporal.Duration.from({ milliseconds: timeLeft }).round({
            largestUnit: "days",
          })
        }`,
      );
    }
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

  startMonitoring(interval: number = STREAM_MONITOR_INTERVAL_MS) {
    if (this.timerMonitor) return;
    this.timerMonitor = setInterval(async () => {
      const streams = await this.api.getStreams({ user_login: this.channel });
      const isLive = streams.length > 0;
      const wasLive: boolean =
        (await this.db.get(["twitch", "monitoring", this.channel])).value ===
          true;
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
    if (this.timerMonitor) {
      clearInterval(this.timerMonitor);
      this.timerMonitor = undefined;
    }
  }
}
