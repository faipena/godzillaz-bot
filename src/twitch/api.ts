import TwitchCredentials from "./types.ts";

const API_ID_URL = "https://id.twitch.tv";
const API_HELIX_URL = "";

export default class TwitchAPI {
    readonly id;
    readonly secret;
    credentials?: TwitchCredentials;
    // token: string;

    constructor(id: string, secret: string) {
        this.id = id;
        this.secret = secret;
    }

    // deno-lint-ignore no-explicit-any
    private async http(url: string, params?:object): Promise<any> {
        const httpMethod = params ? "POST" : "GET"
        const response = await fetch(`${url}`, {
            method: httpMethod,
            headers: params ? new Headers({"content-type": "application/json"}) : undefined,
            body: params ? JSON.stringify(params) : undefined,
        });
        if(!response.ok) throw Error(`Invalid response from twitch server (HTTP ${response.status}): ${await response.text()}`)
        return await response.json();
    }

    async getToken() {
        this.credentials = await this.http(`${API_ID_URL}/oauth2/token`, {
            client_id: this.id,
            client_secret: this.secret,
            grant_type: "client_credentials",
        });
    }
}