const TWITCH_URL = "http://twitch.tv"
export default class Twitch {
    readonly channel: string;
    readonly url : string;
    readonly db: Deno.Kv;
    readonly clientId: string;
    readonly clientSecret: string;
    timer?: number;

    constructor(channel: string, db: Deno.Kv, clientId: string, clientSecret: string) {
        this.channel = channel;
        this.url = `${TWITCH_URL}/${channel}`;
        this.db = db;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    private getToken() {
        
    }

    onOnline?: () => void

    onOffline?: () => void

    startMonitoring(interval: number = 5000) {
        this.timer = setInterval(async () => {
            try {
                const response = await fetch(this.url);
                if (!response.ok) return;
                const isLive = (await response.text()).includes('isLiveBroadcast":true');
                const wasLive : boolean = (await this.db.get(["twitch", this.channel])).value === true;
                if (wasLive && !isLive) {
                    await this.db.set(["twitch", "streamStatus", this.channel], false);
                    if (this.onOffline) this.onOffline();
                } else if (isLive && !wasLive) {
                    await this.db.set(["twitch", "streamStatus", this.channel], true);
                    if (this.onOnline) this.onOnline();
                }
            }
            catch (error) {
                console.warn(`Twitch.monitor(): ${error}`)
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