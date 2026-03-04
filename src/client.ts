import { createHash } from "node:crypto";
import { pathcat } from "pathcat";
import type {
  LastFMEndpoints,
  UserRecentTracksResult,
  UserRecentTracksExtendedResult,
} from "./endpoints.ts";
import { LastFMError } from "./errors.ts";
import type {
  MethodNames,
  RequestArgs,
  ResponseFor,
} from "./types.ts";

const BASE_URL = "https://ws.audioscrobbler.com/2.0";

const POST_METHODS: ReadonlySet<string> = new Set([
  "album.addTags",
  "album.removeTag",
  "artist.addTags",
  "artist.removeTag",
  "track.addTags",
  "track.removeTag",
  "track.love",
  "track.unlove",
  "track.scrobble",
  "track.updateNowPlaying",
  "auth.getMobileSession",
  "auth.getSession",
]);

export type LastFMClientOptions = {
  apiKey: string;
  apiSecret?: string;
  sessionKey?: string;
};

export class LastFM {
  private readonly options: LastFMClientOptions;

  constructor(options: LastFMClientOptions) {
    this.options = options;
  }

  private computeSignature(params: Record<string, string>): string {
    if (!this.options.apiSecret) {
      throw new Error("apiSecret is required for authenticated requests");
    }

    const sorted = Object.keys(params).sort();
    const str =
      sorted.map((k) => `${k}${params[k]}`).join("") + this.options.apiSecret;

    return createHash("md5").update(str).digest("hex");
  }

  async request(
    method: "user.getRecentTracks",
    params: {
      user: string;
      extended: 1;
      from?: number;
      to?: number;
      limit?: number;
      page?: number;
    },
  ): Promise<UserRecentTracksExtendedResult>;
  async request(
    method: "user.getRecentTracks",
    params: {
      user: string;
      extended?: 0;
      from?: number;
      to?: number;
      limit?: number;
      page?: number;
    },
  ): Promise<UserRecentTracksResult>;
  async request<M extends MethodNames<LastFMEndpoints>>(
    method: M,
    ...[params]: RequestArgs<LastFMEndpoints, M>
  ): Promise<ResponseFor<LastFMEndpoints, M>>;
  async request(
    method: string,
    params?: Record<string, unknown>,
  ): Promise<unknown> {
    const isPost = POST_METHODS.has(method as string);
    const baseParams: Record<string, string> = {
      method: method as string,
      api_key: this.options.apiKey,
      format: "json",
    };

    const userParams = (params ?? {}) as Record<string, unknown>;
    for (const [key, value] of Object.entries(userParams)) {
      if (value !== undefined && value !== null) {
        baseParams[key] = String(value);
      }
    }

    if (isPost && this.options.sessionKey) {
      baseParams.sk = this.options.sessionKey;
    }

    if (isPost && this.options.apiSecret) {
      // api_sig is computed without format param
      const sigParams = { ...baseParams };
      delete sigParams.format;
      baseParams.api_sig = this.computeSignature(sigParams);
    }

    let response: Response;

    if (isPost) {
      response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(baseParams),
      });
    } else {
      const url = pathcat(BASE_URL, "", baseParams);
      response = await fetch(url);
    }

    const json = (await response.json()) as Record<string, unknown>;

    if (json.error) {
      throw new LastFMError(
        response,
        json as unknown as import("./errors.ts").LastFMErrorResponse,
      );
    }

    return json;
  }
}
