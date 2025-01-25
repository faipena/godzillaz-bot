import {
  TwitchCredentials,
  TwitchRequestStreams,
  TwitchResponsePaginated,
  TwitchResponseStreams,
} from "./types.ts";

const API_ID_URL = "https://id.twitch.tv";
const API_HELIX_URL = "https://api.twitch.tv/helix";

export default class TwitchAPI {
  readonly #id;
  readonly #secret;
  #credentials?: TwitchCredentials;

  set credentials(value: TwitchCredentials) {
    this.#credentials = value;
  }

  constructor(id: string, secret: string) {
    this.#id = id;
    this.#secret = secret;
  }

  // deno-lint-ignore no-explicit-any
  private async http(url: string, params?: object): Promise<any> {
    const httpMethod = params ? "POST" : "GET";
    const response = await fetch(`${url}`, {
      method: httpMethod,
      headers: params
        ? new Headers({ "content-type": "application/json" })
        : undefined,
      body: params ? JSON.stringify(params) : undefined,
    });
    if (!response.ok) {
      throw Error(
        `Invalid response from twitch server (HTTP ${response.status}): ${await response
          .text()}`,
      );
    }
    return await response.json();
  }

  // deno-lint-ignore no-explicit-any
  private async httpGet(url: string, params?: object): Promise<any> {
    const httpMethod = "GET";
    const httpParams = params
      ? new URLSearchParams(params as {})
      : new URLSearchParams();
    const response = await fetch(`${url}?${httpParams}`, {
      method: httpMethod,
      headers: new Headers({
        "Client-Id": `${this.#id}`,
        "Authorization": `Bearer ${this.#credentials?.access_token}`,
      }),
    });
    if (!response.ok) {
      throw Error(
        `Invalid response from twitch server (HTTP ${response.status}): ${await response
          .text()}`,
      );
    }
    return await response.json();
  }

  async getToken(): Promise<TwitchCredentials> {
    return await this.http(`${API_ID_URL}/oauth2/token`, {
      client_id: this.#id,
      client_secret: this.#secret,
      grant_type: "client_credentials",
    });
  }

  async getStreams(
    params?: TwitchRequestStreams,
  ): Promise<TwitchResponseStreams[]> {
    const response: TwitchResponsePaginated = await this.httpGet(
      `${API_HELIX_URL}/streams`,
      params,
    );
    return response.data as TwitchResponseStreams[];
  }
}
