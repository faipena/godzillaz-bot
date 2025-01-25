import TelegramAPI from "./api.ts";

export default class Telegram {
  private api: TelegramAPI;
  private offset: number = 0;

  constructor(token: string) {
    this.api = new TelegramAPI(token);
  }

  getMe() {
    return this.api.getMe();
  }

  getUpdates() {
    return this.api.getUpdates();
  }

  async sendPinnedMessage(
    chat: number | string,
    text: string,
  ): Promise<number> {
    const message = await this.api.sendMessage(chat, text);
    await this.api.pinChatMessage(chat, message.message_id);
    return message.message_id;
  }

  async unpinMessage(chat: number | string, message: number) {
    await this.api.unpinChatMessage(chat, message);
  }
}
