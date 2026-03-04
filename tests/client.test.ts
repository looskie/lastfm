import { createHash } from "node:crypto";
import { test, expect, mock, beforeEach, afterEach } from "bun:test";
import { LastFM, LastFMError } from "../src/index.ts";
import type { UserInfo, AuthToken } from "../src/index.ts";

const MOCK_API_KEY = "test-api-key";
const MOCK_API_SECRET = "test-api-secret";
const MOCK_SESSION_KEY = "test-session-key";

let capturedUrl: string = "";
let capturedInit: RequestInit | undefined;

const setupMockFetch = (body: unknown) => {
  const mockFn = mock((_url: string, _init?: RequestInit) => {
    return Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  // @ts-expect-error -- overriding fetch for tests
  globalThis.fetch = (...args: unknown[]) => {
    capturedUrl = String(args[0]);
    capturedInit = args[1] as RequestInit | undefined;
    return mockFn(capturedUrl, capturedInit);
  };

  return mockFn;
};

let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  capturedUrl = "";
  capturedInit = undefined;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ---- GET requests ----

test("GET request sends params as query string", async () => {
  setupMockFetch({
    results: {
      artistmatches: { artist: [] },
      "opensearch:totalResults": "0",
      "opensearch:startIndex": "0",
      "opensearch:itemsPerPage": "30",
    },
  });

  const client = new LastFM({ apiKey: MOCK_API_KEY });
  await client.request("artist.search", { artist: "Radiohead", limit: 10 });

  expect(capturedUrl).toContain("method=artist.search");
  expect(capturedUrl).toContain("api_key=test-api-key");
  expect(capturedUrl).toContain("format=json");
  expect(capturedUrl).toContain("artist=Radiohead");
  expect(capturedUrl).toContain("limit=10");
});

test("GET request with no required params works without args", async () => {
  setupMockFetch({ toptags: { tag: [] } });
  const client = new LastFM({ apiKey: MOCK_API_KEY });

  await client.request("tag.getTopTags");
  expect(capturedUrl).toContain("method=tag.getTopTags");
});

test("GET request with optional params can omit them", async () => {
  setupMockFetch({ user: { name: "rj" } });
  const client = new LastFM({ apiKey: MOCK_API_KEY });

  await client.request("user.getInfo");
  expect(capturedUrl).toContain("method=user.getInfo");
});

// ---- POST requests ----

test("POST request sends params as form-urlencoded body", async () => {
  setupMockFetch({});
  const client = new LastFM({
    apiKey: MOCK_API_KEY,
    apiSecret: MOCK_API_SECRET,
    sessionKey: MOCK_SESSION_KEY,
  });

  await client.request("track.love", { track: "Creep", artist: "Radiohead" });

  expect(capturedUrl).toBe("https://ws.audioscrobbler.com/2.0");
  expect(capturedInit?.method).toBe("POST");

  const headers = capturedInit?.headers as Record<string, string>;
  expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");

  const body = new URLSearchParams(capturedInit?.body as string);
  expect(body.get("method")).toBe("track.love");
  expect(body.get("track")).toBe("Creep");
  expect(body.get("artist")).toBe("Radiohead");
  expect(body.get("api_key")).toBe(MOCK_API_KEY);
  expect(body.get("sk")).toBe(MOCK_SESSION_KEY);
  expect(body.get("api_sig")).toBeTruthy();
  expect(body.get("format")).toBe("json");
});

test("POST request includes api_sig computed from sorted params", async () => {
  setupMockFetch({});
  const client = new LastFM({
    apiKey: MOCK_API_KEY,
    apiSecret: MOCK_API_SECRET,
    sessionKey: MOCK_SESSION_KEY,
  });

  await client.request("track.love", { track: "Creep", artist: "Radiohead" });

  const body = new URLSearchParams(capturedInit?.body as string);
  const apiSig = body.get("api_sig")!;

  // recompute expected sig: sorted params (without format) + secret
  const params: Record<string, string> = {
    method: "track.love",
    api_key: MOCK_API_KEY,
    track: "Creep",
    artist: "Radiohead",
    sk: MOCK_SESSION_KEY,
  };
  const sorted = Object.keys(params).sort();
  const str = sorted.map((k) => `${k}${params[k]}`).join("") + MOCK_API_SECRET;
  const expected = createHash("md5").update(str).digest("hex");

  expect(apiSig).toBe(expected);
});

// ---- error handling ----

test("throws LastFMError when response contains error field", async () => {
  setupMockFetch({ error: 6, message: "Invalid parameters" });
  const client = new LastFM({ apiKey: MOCK_API_KEY });

  try {
    await client.request("artist.search", { artist: "" });
    expect(true).toBe(false);
  } catch (err) {
    expect(err).toBeInstanceOf(LastFMError);
    const lastfmErr = err as LastFMError;
    expect(lastfmErr.code).toBe(6);
    expect(lastfmErr.message).toBe("Invalid parameters");
  }
});

test("throws LastFMError with correct code for invalid api key", async () => {
  setupMockFetch({ error: 10, message: "Invalid API key" });
  const client = new LastFM({ apiKey: "bad-key" });

  try {
    await client.request("user.getInfo", { user: "rj" });
    expect(true).toBe(false);
  } catch (err) {
    expect(err).toBeInstanceOf(LastFMError);
    expect((err as LastFMError).code).toBe(10);
  }
});

// ---- response types ----

test("returns parsed response data", async () => {
  setupMockFetch({
    user: {
      name: "rj",
      realname: "Richard Jones",
      url: "https://www.last.fm/user/rj",
      image: [],
      country: "UK",
      age: "0",
      gender: "n",
      subscriber: "0",
      playcount: "100",
      playlists: "0",
      registered: { unixtime: "1000", "#text": 1000 },
      type: "user",
    },
  });

  const client = new LastFM({ apiKey: MOCK_API_KEY });
  const result = await client.request("user.getInfo", { user: "rj" });

  expect(result.user.name).toBe("rj");
  expect(result.user.realname).toBe("Richard Jones");
});

// ---- type-level tests (these just need to compile) ----

test("type-level: no required params endpoint accepts no args", () => {
  const client = new LastFM({ apiKey: "key" });

  // tag.getTopTags has no params — second arg optional
  const _noArgs: Promise<unknown> = client.request("tag.getTopTags");

  // user.getInfo has all optional params — second arg optional
  const _optional: Promise<UserInfo> = client.request("user.getInfo");
  const _withOptional: Promise<UserInfo> = client.request("user.getInfo", {
    user: "rj",
  });
});

test("type-level: required params must be provided", () => {
  const client = new LastFM({ apiKey: "key" });

  // artist.search requires { artist: string }
  const _search: Promise<unknown> = client.request("artist.search", {
    artist: "Radiohead",
  });

  // auth.getToken has no params
  const _token: Promise<AuthToken> = client.request("auth.getToken");
});

// ---- auth method handling ----

test("auth.getMobileSession is sent as POST", async () => {
  setupMockFetch({
    session: { name: "user", key: "session-key", subscriber: 0 },
  });

  const client = new LastFM({
    apiKey: MOCK_API_KEY,
    apiSecret: MOCK_API_SECRET,
  });

  await client.request("auth.getMobileSession", {
    username: "user",
    password: "pass",
  });

  expect(capturedInit?.method).toBe("POST");
});

test("auth.getToken is sent as GET", async () => {
  setupMockFetch({ token: "abc123" });
  const client = new LastFM({
    apiKey: MOCK_API_KEY,
    apiSecret: MOCK_API_SECRET,
  });

  await client.request("auth.getToken");

  // GET requests don't have a method in init
  expect(capturedInit).toBeUndefined();
  expect(capturedUrl).toContain("method=auth.getToken");
});
