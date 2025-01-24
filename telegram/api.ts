import { TelegramMessage, TelegramResponse, TelegramResponseError, TelegramUpdate, TelegramUser } from "./types.ts";

const API_URL = "https://api.telegram.org/bot";

export default class TelegramAPI {
    url: string;

    constructor(token: string) {
        this.url = `${API_URL}${token}`
    }

    private async httpRaw(method: string, params?:object): Promise<TelegramResponse> {
        try {
            const httpMethod = params ? "POST" : "GET"
            const response = await fetch(`${this.url}/${method}`, {
                method: httpMethod,
                headers: params ? new Headers({"content-type": "application/json"}) : undefined,
                body: params ? JSON.stringify(params) : undefined,
            });
            if (!response.ok) {
                try {
                    const data = await response.json();
                    return {
                        ok: false,
                        error_code: data.error_code,
                        description: `Invalid HTTP response from server: ${response.status}.\nTelegram description: ${data.description}`
                    }
                } catch(_error) {
                    return {
                        ok: false,
                        error_code: response.status,
                        description: `Invalid response from server: ${await response.text()}`,
                    }
                }
            }
            return JSON.parse(await response.text());
        } catch (_error) {
            return {
                ok: false,
                description: `Unexpected error while executing httpRaw: ${_error}`,
            }
        }
    }

    // deno-lint-ignore no-explicit-any
    async http(method: string, params?: object): Promise<any> {
        const response: TelegramResponse = await this.httpRaw(method, params);
        if (!response.ok) { 
            throw new TelegramResponseError(
                `Error from Telegram API`,
                response.error_code,
                response.description,
            )
        }
        if (response.result == undefined) {
            throw new TelegramResponseError(
                `Expected an object in response.result if response.ok`,
            )
        }
        return response.result;
    }

    async getMe(): Promise<TelegramUser> {
        return await this.http("getMe");
    }

    async getUpdates(): Promise<TelegramUpdate[]> {
        return await this.http("getUpdates", {offset: 873329065});
    }

    async sendMessage(chat_id: number | string, text: string): Promise<TelegramMessage> {
        return await this.http("sendMessage", {
            chat_id: chat_id,
            text: text,
            link_preview_options: { show_above_text: true },
        })
    }

    async pinChatMessage(chat_id: number | string, message_id: number): Promise<boolean> {
        return await this.http("pinChatMessage", {
            chat_id: chat_id,
            message_id: message_id,
        })
    }

    async unpinChatMessage(chat_id: number | string, message_id: number): Promise<boolean> {
        return await this.http("unpinChatMessage", {
            chat_id: chat_id,
            message_id: message_id,
        })
    }
}