export class TelegramResponseError extends Error {
  errorCode: number | undefined;
  description: string;

  constructor(message: string, errorCode?: number, description: string = "") {
    super(message);
    this.name = "TelegramResponseError";
    this.errorCode = errorCode;
    this.description = description;
  }
}

export interface TelegramResponse {
  ok: boolean;
  result?: object;
  description?: string;
  error_code?: number;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
  can_connect_to_business?: boolean;
  has_main_web_app?: boolean;
}

export interface TelegramChat {
  id: number;
  // Either “private”, “group”, “supergroup” or “channel”
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: boolean;
}

export interface TelegramInaccessibleMessage {
  chat: TelegramChat;
  message_id: number;
  // Always 0, can be used to differentiate regular and inaccessible messages
  date: number;
}

export type TelegramMaybeInacessibleMessage =
  | TelegramMessage
  | TelegramInaccessibleMessage;

export interface TelegramMessage {
  message_id: number;
  message_thread_id?: number;
  from?: TelegramUser;
  sender_chat?: TelegramChat;
  sender_boost_count?: number;
  sender_business_bot?: TelegramUser;
  date: number;
  business_connection_id?: string;
  chat: TelegramChat;
  forward_origin?: object;
  is_topic_message?: boolean;
  is_automatic_forward?: boolean;
  reply_to_message?: object;
  external_reply?: object;
  quote?: object;
  reply_to_story?: object;
  via_bot?: TelegramUser;
  edit_date?: number;
  has_protected_content?: boolean;
  is_from_offline?: boolean;
  media_group_id?: string;
  author_signature?: string;
  test?: string;
  entities?: object[];
  link_preview_options?: object;
  effect_id?: string;
  animation?: object;
  audio?: object;
  document?: object;
  piad_media?: object;
  photo?: object[];
  sticker?: object;
  story?: object;
  video?: object;
  video_note?: object;
  voice?: object;
  caption?: string;
  caption_entities?: object[];
  show_caption_above_media?: boolean;
  has_media_spoiler?: boolean;
  contact?: object;
  dice?: object;
  game?: object;
  poll?: object;
  venue?: object;
  location?: object;
  new_chat_members?: TelegramUser[];
  left_chat_member?: TelegramUser;
  new_chat_title?: string;
  new_chat_photo?: object[];
  delete_chat_photo?: boolean;
  group_chat_created?: boolean;
  supergroup_chat_created?: boolean;
  channel_chat_created?: boolean;
  message_auto_delete_timer_changed?: boolean;
  migrate_to_chat_id?: number;
  migrate_from_chat_id?: number;
  pinned_message?: TelegramMaybeInacessibleMessage;
  invoice?: object;
  successful_payment?: object;
  refunded_payment?: object;
  users_shared?: object;
  chat_shared?: object;
  connected_website?: string;
  write_accesss_allowed?: object;
  passport_data?: object;
  proximity_alert_triggered?: object;
  boost_added?: object;
  chat_background_set?: object;
  forum_topic_created?: object;
  forum_topic_edited?: object;
  forumt_topic_closed?: object;
  forum_topic_reopened?: object;
  general_forum_topic_hidden?: object;
  general_forum_topic_unhidden?: object;
  givaway_created?: object;
  giveaway?: object;
  giveaway_winners?: object;
  giveaway_completed?: object;
  video_chat_scheduled?: object;
  video_chat_started?: object;
  video_chat_ended?: object;
  video_chat_participants_invited?: object;
  web_app_data?: object;
  reply_markup?: object;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
  business_connection?: object;
  business_message?: TelegramMessage;
  edited_business_message?: TelegramMessage;
  deleted_business_messages?: object;
  message_reaction?: object;
  message_reaction_count?: object;
  inline_query?: object;
  chosen_inline_result?: object;
  callback_query?: object;
  shipping_query?: object;
  pre_checkout_query?: object;
  purchased_paid_media?: object;
  poll?: object;
  poll_answer?: object;
  mu_chat_member?: object;
  chat_join_request?: object;
  chat_boost?: object;
  removed_chat_boost?: object;
}
