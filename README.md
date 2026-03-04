# lastfm-ts

A type-safe [Last.fm API](https://www.last.fm/api) client. Every method name, parameter, and response is fully typed — you get autocomplete and compile-time checks out of the box.

## Install

```bash
npm install lastfm-ts
```

## Usage

```ts
import { LastFM } from "lastfm-ts";

const client = new LastFM({ apiKey: "your-api-key" });
```

### Search for an artist

```ts
const result = await client.request("artist.search", {
  artist: "Radiohead",
  limit: 5,
});

console.log(result.results.artistmatches.artist);
```

### Get user info

```ts
// `user` is optional — second arg can be omitted entirely
const me = await client.request("user.getInfo");

// or pass a specific user
const user = await client.request("user.getInfo", { user: "rj" });
console.log(user.user.playcount);
```

### Get recent tracks

```ts
const recent = await client.request("user.getRecentTracks", {
  user: "rj",
  limit: 10,
});

for (const track of recent.recenttracks.track) {
  console.log(`${track.artist["#text"]} - ${track.name}`);
}
```

### Scrobble a track

Write methods require authentication. Pass `apiSecret` and `sessionKey` to the constructor — the client handles `api_sig` computation and session key injection automatically.

```ts
const client = new LastFM({
  apiKey: "your-api-key",
  apiSecret: "your-api-secret",
  sessionKey: "user-session-key",
});

await client.request("track.scrobble", {
  artist: "Radiohead",
  track: "Karma Police",
  timestamp: Math.floor(Date.now() / 1000),
});
```

### Love a track

```ts
await client.request("track.love", {
  artist: "Radiohead",
  track: "Everything In Its Right Place",
});
```

## Authentication

To get a session key, use the [Last.fm auth flow](https://www.last.fm/api/authentication):

```ts
const client = new LastFM({
  apiKey: "your-api-key",
  apiSecret: "your-api-secret",
});

// option 1: mobile auth (username + password)
const session = await client.request("auth.getMobileSession", {
  username: "your-username",
  password: "your-password",
});
console.log(session.session.key); // use this as sessionKey

// option 2: desktop/web auth flow
const token = await client.request("auth.getToken");
// redirect user to: https://www.last.fm/api/auth/?api_key=YOUR_KEY&token=TOKEN
// after user authorizes:
const session = await client.request("auth.getSession", {
  token: token.token,
});
```

## Error Handling

API errors throw a `LastFMError` with the error code and message from Last.fm:

```ts
import { LastFM, LastFMError } from "lastfm-ts";

try {
  await client.request("user.getInfo", { user: "nonexistent-user-abc123" });
} catch (err) {
  if (err instanceof LastFMError) {
    console.log(err.code);    // 6
    console.log(err.message); // "User not found"
  }
}
```

## Type Safety

Everything is inferred from the method name. No generics needed.

```ts
// params are type-checked — typos and wrong types are caught at compile time
await client.request("artist.search", { artist: "Radiohead" }); // ok
await client.request("artist.search", { query: "Radiohead" });  // type error: 'query' does not exist
await client.request("artist.search");                          // type error: 'artist' is required

// response types are inferred
const result = await client.request("user.getTopArtists", {
  user: "rj",
  period: "7day",
});
result.topartists.artist[0].name; // string — fully typed
```

## Supported Methods

All 49 [Last.fm API methods](https://www.last.fm/api) are supported:

| Namespace | Methods |
|-----------|---------|
| `album` | `addTags` `getInfo` `getTags` `getTopTags` `removeTag` `search` |
| `artist` | `addTags` `getCorrection` `getInfo` `getSimilar` `getTags` `getTopAlbums` `getTopTags` `getTopTracks` `removeTag` `search` |
| `auth` | `getMobileSession` `getSession` `getToken` |
| `chart` | `getTopArtists` `getTopTags` `getTopTracks` |
| `geo` | `getTopArtists` `getTopTracks` |
| `library` | `getArtists` |
| `tag` | `getInfo` `getSimilar` `getTopAlbums` `getTopArtists` `getTopTags` `getTopTracks` `getWeeklyChartList` |
| `track` | `addTags` `getCorrection` `getInfo` `getSimilar` `getTags` `getTopTags` `love` `removeTag` `scrobble` `search` `unlove` `updateNowPlaying` |
| `user` | `getFriends` `getInfo` `getLovedTracks` `getPersonalTags` `getRecentTracks` `getTopAlbums` `getTopArtists` `getTopTags` `getTopTracks` `getWeeklyAlbumChart` `getWeeklyArtistChart` `getWeeklyChartList` `getWeeklyTrackChart` |

## License

MIT
