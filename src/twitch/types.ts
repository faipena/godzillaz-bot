export interface TwitchCredentials {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface TwitchRequestStreams {
  user_id?: string;
  user_login?: string;
  game_id?: string;
  type?: string;
  language?: string;
  first?: number;
  before?: string;
  after?: string;
}

export interface TwitchResponsePaginated {
  data: object[];
  pagination: {
    cursor: string;
  };
}

export interface TwitchResponseStreams {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  tags: string[];
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  // Deprecated
  tag_ids?: string[];
  is_mature: boolean;
}
