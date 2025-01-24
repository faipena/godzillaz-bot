const API_ID_URL = "https://id.twitch.tv";
const API_HELIX_URL = "";

export default class TwitchAPI {
    readonly id;
    readonly secret;

    constructor(id: string, secret: string) {
        this.id = id;
        this.secret = secret;
    }
}