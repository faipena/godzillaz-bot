import TwitchAPI from "./api.ts";

const TWITCH_URL = "http://twitch.tv"
export default class Twitch {
    readonly channel: string;
    readonly url : string;
    readonly db: Deno.Kv;
    api : TwitchAPI;
    timer?: number;

    constructor(channel: string, db: Deno.Kv, clientId: string, clientSecret: string) {
        this.channel = channel;
        this.url = `${TWITCH_URL}/${channel}`;
        this.db = db;
        this.api = new TwitchAPI(clientId, clientSecret);
    }

    private getToken() {
        
    }

    onOnline?: () => void

    onOffline?: () => void

    startMonitoring(interval: number = 5000) {
        this.timer = setInterval(async () => {
            await this.api.getToken();
        }, interval);
    }

    stopMonitoring() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
}