import type { Endpoint } from "./types.ts";

// ---- shared types ----

export interface LastFMImage {
  "#text": string;
  size: "small" | "medium" | "large" | "extralarge" | "mega" | "";
}

export interface LastFMTag {
  name: string;
  url: string;
}

export interface LastFMTagWithCount extends LastFMTag {
  count: number;
}

export interface LastFMWiki {
  published: string;
  summary: string;
  content: string;
}

export interface LastFMPaginationAttr {
  page: string;
  perPage: string;
  totalPages: string;
  total: string;
}

export interface LastFMSearchAttr {
  "opensearch:Query": {
    "#text": string;
    role: string;
    startPage: string;
  };
  "opensearch:totalResults": string;
  "opensearch:startIndex": string;
  "opensearch:itemsPerPage": string;
}

export interface LastFMArtistSummary {
  name: string;
  mbid: string;
  url: string;
}

export interface LastFMTrackSummary {
  name: string;
  mbid: string;
  url: string;
  artist: LastFMArtistSummary;
}

// shared param patterns
type PaginationParams = { limit?: number; page?: number };
type AutocorrectParam = { autocorrect?: 0 | 1 };
type PeriodParam = {
  period?: "overall" | "7day" | "1month" | "3month" | "6month" | "12month";
};

// ---- album ----

export interface AlbumInfo {
  album: {
    name: string;
    artist: string;
    mbid: string;
    url: string;
    image: LastFMImage[];
    listeners: string;
    playcount: string;
    tracks: {
      track: {
        name: string;
        url: string;
        duration: string;
        "@attr": { rank: string };
        artist: LastFMArtistSummary;
      }[];
    };
    tags: { tag: LastFMTag[] };
    wiki?: LastFMWiki;
  };
}

export interface AlbumSearchResult {
  results: LastFMSearchAttr & {
    albummatches: {
      album: {
        name: string;
        artist: string;
        url: string;
        image: LastFMImage[];
        streamable: string;
        mbid: string;
      }[];
    };
  };
}

export interface AlbumTagsResult {
  tags: { tag: LastFMTag[] };
}

export interface AlbumTopTagsResult {
  toptags: {
    tag: LastFMTagWithCount[];
    "@attr": { artist: string; album: string };
  };
}

type AlbumEndpoints =
  | Endpoint<"album.addTags", { artist: string; album: string; tags: string }>
  | Endpoint<
      "album.getInfo",
      {
        artist?: string;
        album?: string;
        mbid?: string;
        username?: string;
        lang?: string;
      } & AutocorrectParam,
      AlbumInfo
    >
  | Endpoint<
      "album.getTags",
      {
        artist?: string;
        album?: string;
        mbid?: string;
        user?: string;
      } & AutocorrectParam,
      AlbumTagsResult
    >
  | Endpoint<
      "album.getTopTags",
      { artist?: string; album?: string; mbid?: string } & AutocorrectParam,
      AlbumTopTagsResult
    >
  | Endpoint<"album.removeTag", { artist: string; album: string; tag: string }>
  | Endpoint<
      "album.search",
      { album: string } & PaginationParams,
      AlbumSearchResult
    >;

// ---- artist ----

export interface ArtistInfo {
  artist: {
    name: string;
    mbid: string;
    url: string;
    image: LastFMImage[];
    streamable: string;
    stats: { listeners: string; playcount: string };
    similar: {
      artist: {
        name: string;
        url: string;
        image: LastFMImage[];
      }[];
    };
    tags: { tag: LastFMTag[] };
    bio?: LastFMWiki;
  };
}

export interface ArtistCorrectionResult {
  corrections: {
    correction: {
      artist: { name: string; mbid: string; url: string };
      "@attr": { index: string };
    };
  };
}

export interface ArtistSimilarResult {
  similarartists: {
    artist: {
      name: string;
      mbid: string;
      match: string;
      url: string;
      image: LastFMImage[];
    }[];
    "@attr": { artist: string };
  };
}

export interface ArtistTagsResult {
  tags: { tag: LastFMTag[] };
}

export interface ArtistTopAlbumsResult {
  topalbums: {
    album: {
      name: string;
      mbid: string;
      url: string;
      playcount: number;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
    }[];
    "@attr": LastFMPaginationAttr & { artist: string };
  };
}

export interface ArtistTopTagsResult {
  toptags: { tag: LastFMTagWithCount[]; "@attr": { artist: string } };
}

export interface ArtistTopTracksResult {
  toptracks: {
    track: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      listeners: string;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
      "@attr": { rank: string };
    }[];
    "@attr": LastFMPaginationAttr & { artist: string };
  };
}

export interface ArtistSearchResult {
  results: LastFMSearchAttr & {
    artistmatches: {
      artist: {
        name: string;
        mbid: string;
        url: string;
        listeners: string;
        image: LastFMImage[];
      }[];
    };
  };
}

type ArtistEndpoints =
  | Endpoint<"artist.addTags", { artist: string; tags: string }>
  | Endpoint<"artist.getCorrection", { artist: string }, ArtistCorrectionResult>
  | Endpoint<
      "artist.getInfo",
      {
        artist?: string;
        mbid?: string;
        username?: string;
        lang?: string;
      } & AutocorrectParam,
      ArtistInfo
    >
  | Endpoint<
      "artist.getSimilar",
      { artist?: string; mbid?: string; limit?: number } & AutocorrectParam,
      ArtistSimilarResult
    >
  | Endpoint<
      "artist.getTags",
      { artist?: string; mbid?: string; user?: string } & AutocorrectParam,
      ArtistTagsResult
    >
  | Endpoint<
      "artist.getTopAlbums",
      { artist?: string; mbid?: string } & AutocorrectParam & PaginationParams,
      ArtistTopAlbumsResult
    >
  | Endpoint<
      "artist.getTopTags",
      { artist?: string; mbid?: string } & AutocorrectParam,
      ArtistTopTagsResult
    >
  | Endpoint<
      "artist.getTopTracks",
      { artist?: string; mbid?: string } & AutocorrectParam & PaginationParams,
      ArtistTopTracksResult
    >
  | Endpoint<"artist.removeTag", { artist: string; tag: string }>
  | Endpoint<
      "artist.search",
      { artist: string } & PaginationParams,
      ArtistSearchResult
    >;

// ---- auth ----

export interface AuthSession {
  session: {
    name: string;
    key: string;
    subscriber: number;
  };
}

export interface AuthToken {
  token: string;
}

type AuthEndpoints =
  | Endpoint<
      "auth.getMobileSession",
      { username: string; password: string },
      AuthSession
    >
  | Endpoint<"auth.getSession", { token: string }, AuthSession>
  | Endpoint<"auth.getToken", {}, AuthToken>;

// ---- chart ----

export interface ChartTopArtistsResult {
  artists: {
    artist: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      listeners: string;
      image: LastFMImage[];
    }[];
    "@attr": LastFMPaginationAttr;
  };
}

export interface ChartTopTagsResult {
  tags: {
    tag: {
      name: string;
      url: string;
      reach: string;
      taggings: string;
      wiki?: LastFMWiki;
    }[];
    "@attr": LastFMPaginationAttr;
  };
}

export interface ChartTopTracksResult {
  tracks: {
    track: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      listeners: string;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
    }[];
    "@attr": LastFMPaginationAttr;
  };
}

type ChartEndpoints =
  | Endpoint<"chart.getTopArtists", PaginationParams, ChartTopArtistsResult>
  | Endpoint<"chart.getTopTags", PaginationParams, ChartTopTagsResult>
  | Endpoint<"chart.getTopTracks", PaginationParams, ChartTopTracksResult>;

// ---- geo ----

export interface GeoTopArtistsResult {
  topartists: {
    artist: {
      name: string;
      mbid: string;
      url: string;
      listeners: string;
      image: LastFMImage[];
    }[];
    "@attr": LastFMPaginationAttr & { country: string };
  };
}

export interface GeoTopTracksResult {
  tracks: {
    track: {
      name: string;
      mbid: string;
      url: string;
      listeners: string;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
      "@attr": { rank: string };
    }[];
    "@attr": LastFMPaginationAttr & { country: string };
  };
}

type GeoEndpoints =
  | Endpoint<
      "geo.getTopArtists",
      { country: string } & PaginationParams,
      GeoTopArtistsResult
    >
  | Endpoint<
      "geo.getTopTracks",
      { country: string; location?: string } & PaginationParams,
      GeoTopTracksResult
    >;

// ---- library ----

export interface LibraryArtistsResult {
  artists: {
    artist: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      tagcount: string;
      image: LastFMImage[];
    }[];
    "@attr": LastFMPaginationAttr & { user: string };
  };
}

type LibraryEndpoints = Endpoint<
  "library.getArtists",
  { user: string } & PaginationParams,
  LibraryArtistsResult
>;

// ---- tag ----

export interface TagInfo {
  tag: {
    name: string;
    url: string;
    reach: number;
    taggings: number;
    wiki?: LastFMWiki;
  };
}

export interface TagSimilarResult {
  similartags: {
    tag: LastFMTag[];
    "@attr": { tag: string };
  };
}

export interface TagTopAlbumsResult {
  albums: {
    album: {
      name: string;
      mbid: string;
      url: string;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
      "@attr": { rank: string };
    }[];
    "@attr": LastFMPaginationAttr & { tag: string };
  };
}

export interface TagTopArtistsResult {
  topartists: {
    artist: {
      name: string;
      mbid: string;
      url: string;
      image: LastFMImage[];
      "@attr": { rank: string };
    }[];
    "@attr": LastFMPaginationAttr & { tag: string };
  };
}

export interface TagTopTagsResult {
  toptags: {
    tag: {
      name: string;
      count: number;
      reach: number;
    }[];
  };
}

export interface TagTopTracksResult {
  tracks: {
    track: {
      name: string;
      mbid: string;
      url: string;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
      "@attr": { rank: string };
    }[];
    "@attr": LastFMPaginationAttr & { tag: string };
  };
}

export interface TagWeeklyChartListResult {
  weeklychartlist: {
    chart: { "#text": string; from: string; to: string }[];
    "@attr": { tag: string };
  };
}

type TagEndpoints =
  | Endpoint<"tag.getInfo", { tag: string; lang?: string }, TagInfo>
  | Endpoint<"tag.getSimilar", { tag: string }, TagSimilarResult>
  | Endpoint<
      "tag.getTopAlbums",
      { tag: string } & PaginationParams,
      TagTopAlbumsResult
    >
  | Endpoint<
      "tag.getTopArtists",
      { tag: string } & PaginationParams,
      TagTopArtistsResult
    >
  | Endpoint<"tag.getTopTags", {}, TagTopTagsResult>
  | Endpoint<
      "tag.getTopTracks",
      { tag: string } & PaginationParams,
      TagTopTracksResult
    >
  | Endpoint<
      "tag.getWeeklyChartList",
      { tag: string },
      TagWeeklyChartListResult
    >;

// ---- track ----

export interface TrackInfo {
  track: {
    name: string;
    mbid: string;
    url: string;
    duration: string;
    listeners: string;
    playcount: string;
    artist: LastFMArtistSummary;
    album?: {
      artist: string;
      title: string;
      mbid: string;
      url: string;
      image: LastFMImage[];
    };
    toptags: { tag: LastFMTag[] };
    wiki?: LastFMWiki;
    userplaycount?: string;
    userloved?: string;
  };
}

export interface TrackCorrectionResult {
  corrections: {
    correction: {
      track: {
        name: string;
        mbid: string;
        url: string;
        artist: LastFMArtistSummary;
      };
      "@attr": {
        index: string;
        artistcorrected: string;
        trackcorrected: string;
      };
    };
  };
}

export interface TrackSimilarResult {
  similartracks: {
    track: {
      name: string;
      mbid: string;
      match: number;
      url: string;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
    }[];
    "@attr": { artist: string };
  };
}

export interface TrackTagsResult {
  tags: { tag: LastFMTag[] };
}

export interface TrackTopTagsResult {
  toptags: {
    tag: LastFMTagWithCount[];
    "@attr": { artist: string; track: string };
  };
}

export interface TrackSearchResult {
  results: LastFMSearchAttr & {
    trackmatches: {
      track: {
        name: string;
        artist: string;
        url: string;
        listeners: string;
        image: LastFMImage[];
        mbid: string;
      }[];
    };
  };
}

export interface TrackScrobbleResult {
  scrobbles: {
    scrobble: {
      track: { corrected: string; "#text": string };
      artist: { corrected: string; "#text": string };
      album: { corrected: string };
      albumArtist: { corrected: string };
      timestamp: string;
      ignoredMessage: { code: string; "#text": string };
    };
    "@attr": { accepted: number; ignored: number };
  };
}

export interface TrackNowPlayingResult {
  nowplaying: {
    track: { corrected: string; "#text": string };
    artist: { corrected: string; "#text": string };
    album: { corrected: string };
    albumArtist: { corrected: string };
    ignoredMessage: { code: string; "#text": string };
  };
}

type TrackEndpoints =
  | Endpoint<"track.addTags", { artist: string; track: string; tags: string }>
  | Endpoint<
      "track.getCorrection",
      { artist: string; track: string },
      TrackCorrectionResult
    >
  | Endpoint<
      "track.getInfo",
      {
        artist?: string;
        track?: string;
        mbid?: string;
        username?: string;
      } & AutocorrectParam,
      TrackInfo
    >
  | Endpoint<
      "track.getSimilar",
      {
        track?: string;
        artist?: string;
        mbid?: string;
        limit?: number;
      } & AutocorrectParam,
      TrackSimilarResult
    >
  | Endpoint<
      "track.getTags",
      {
        track?: string;
        artist?: string;
        mbid?: string;
        user?: string;
      } & AutocorrectParam,
      TrackTagsResult
    >
  | Endpoint<
      "track.getTopTags",
      { track?: string; artist?: string; mbid?: string } & AutocorrectParam,
      TrackTopTagsResult
    >
  | Endpoint<"track.love", { track: string; artist: string }>
  | Endpoint<"track.removeTag", { artist: string; track: string; tag: string }>
  | Endpoint<
      "track.scrobble",
      {
        artist: string;
        track: string;
        timestamp: number;
        album?: string;
        albumArtist?: string;
        trackNumber?: number;
        duration?: number;
        mbid?: string;
        chosenByUser?: 0 | 1;
      },
      TrackScrobbleResult
    >
  | Endpoint<
      "track.search",
      { track: string; artist?: string } & PaginationParams,
      TrackSearchResult
    >
  | Endpoint<"track.unlove", { track: string; artist: string }>
  | Endpoint<
      "track.updateNowPlaying",
      {
        artist: string;
        track: string;
        album?: string;
        albumArtist?: string;
        trackNumber?: number;
        duration?: number;
        mbid?: string;
      },
      TrackNowPlayingResult
    >;

// ---- user ----

export interface UserInfo {
  user: {
    name: string;
    realname: string;
    url: string;
    image: LastFMImage[];
    country: string;
    age: string;
    gender: string;
    subscriber: string;
    playcount: string;
    playlists: string;
    registered: { unixtime: string; "#text": number };
    type: string;
  };
}

export interface UserFriendsResult {
  friends: {
    user: {
      name: string;
      realname: string;
      url: string;
      image: LastFMImage[];
      country: string;
      subscriber: string;
      playlists: string;
    }[];
    "@attr": LastFMPaginationAttr & { user: string };
  };
}

export interface UserLovedTracksResult {
  lovedtracks: {
    track: {
      name: string;
      mbid: string;
      url: string;
      date: { uts: string; "#text": string };
      artist: LastFMArtistSummary;
      image: LastFMImage[];
    }[];
    "@attr": LastFMPaginationAttr & { user: string };
  };
}

export interface UserPersonalTagsResult {
  taggings: {
    artists?: {
      artist: {
        name: string;
        mbid: string;
        url: string;
        image: LastFMImage[];
      }[];
    };
    albums?: {
      album: {
        name: string;
        mbid: string;
        url: string;
        artist: LastFMArtistSummary;
        image: LastFMImage[];
      }[];
    };
    tracks?: {
      track: {
        name: string;
        mbid: string;
        url: string;
        artist: LastFMArtistSummary;
        image: LastFMImage[];
      }[];
    };
    "@attr": LastFMPaginationAttr & { user: string; tag: string };
  };
}

export interface UserRecentTracksResult {
  recenttracks: {
    track: {
      name: string;
      mbid: string;
      url: string;
      artist: { mbid: string; "#text": string };
      album: { mbid: string; "#text": string };
      image: LastFMImage[];
      date?: { uts: string; "#text": string };
      "@attr"?: { nowplaying: string };
    }[];
    "@attr": LastFMPaginationAttr & { user: string };
  };
}

export interface UserTopAlbumsResult {
  topalbums: {
    album: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
      "@attr": { rank: string };
    }[];
    "@attr": LastFMPaginationAttr & { user: string };
  };
}

export interface UserTopArtistsResult {
  topartists: {
    artist: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      image: LastFMImage[];
      "@attr": { rank: string };
    }[];
    "@attr": LastFMPaginationAttr & { user: string };
  };
}

export interface UserTopTagsResult {
  toptags: {
    tag: {
      name: string;
      count: number;
      url: string;
    }[];
    "@attr": { user: string };
  };
}

export interface UserTopTracksResult {
  toptracks: {
    track: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      artist: LastFMArtistSummary;
      image: LastFMImage[];
      "@attr": { rank: string };
    }[];
    "@attr": LastFMPaginationAttr & { user: string };
  };
}

export interface UserWeeklyAlbumChartResult {
  weeklyalbumchart: {
    album: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      artist: { mbid: string; "#text": string };
      "@attr": { rank: string };
    }[];
    "@attr": { user: string; from: string; to: string };
  };
}

export interface UserWeeklyArtistChartResult {
  weeklyartistchart: {
    artist: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      "@attr": { rank: string };
    }[];
    "@attr": { user: string; from: string; to: string };
  };
}

export interface UserWeeklyChartListResult {
  weeklychartlist: {
    chart: { from: string; to: string }[];
    "@attr": { user: string };
  };
}

export interface UserWeeklyTrackChartResult {
  weeklytrackchart: {
    track: {
      name: string;
      mbid: string;
      url: string;
      playcount: string;
      artist: { mbid: string; "#text": string };
      "@attr": { rank: string };
    }[];
    "@attr": { user: string; from: string; to: string };
  };
}

type UserEndpoints =
  | Endpoint<
      "user.getFriends",
      { user: string; recenttracks?: boolean } & PaginationParams,
      UserFriendsResult
    >
  | Endpoint<"user.getInfo", { user?: string }, UserInfo>
  | Endpoint<
      "user.getLovedTracks",
      { user: string } & PaginationParams,
      UserLovedTracksResult
    >
  | Endpoint<
      "user.getPersonalTags",
      {
        user: string;
        tag: string;
        taggingtype: "artist" | "album" | "track";
      } & PaginationParams,
      UserPersonalTagsResult
    >
  | Endpoint<
      "user.getRecentTracks",
      {
        user: string;
        extended?: 0 | 1;
        from?: number;
        to?: number;
      } & PaginationParams,
      UserRecentTracksResult
    >
  | Endpoint<
      "user.getTopAlbums",
      { user: string } & PeriodParam & PaginationParams,
      UserTopAlbumsResult
    >
  | Endpoint<
      "user.getTopArtists",
      { user: string } & PeriodParam & PaginationParams,
      UserTopArtistsResult
    >
  | Endpoint<
      "user.getTopTags",
      { user: string; limit?: number },
      UserTopTagsResult
    >
  | Endpoint<
      "user.getTopTracks",
      { user: string } & PeriodParam & PaginationParams,
      UserTopTracksResult
    >
  | Endpoint<
      "user.getWeeklyAlbumChart",
      { user: string; from?: number; to?: number },
      UserWeeklyAlbumChartResult
    >
  | Endpoint<
      "user.getWeeklyArtistChart",
      { user: string; from?: number; to?: number },
      UserWeeklyArtistChartResult
    >
  | Endpoint<
      "user.getWeeklyChartList",
      { user: string },
      UserWeeklyChartListResult
    >
  | Endpoint<
      "user.getWeeklyTrackChart",
      { user: string; from?: number; to?: number },
      UserWeeklyTrackChartResult
    >;

// ---- combined ----

export type LastFMEndpoints =
  | AlbumEndpoints
  | ArtistEndpoints
  | AuthEndpoints
  | ChartEndpoints
  | GeoEndpoints
  | LibraryEndpoints
  | TagEndpoints
  | TrackEndpoints
  | UserEndpoints;
