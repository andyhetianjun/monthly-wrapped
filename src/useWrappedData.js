import { useEffect, useState } from "react";
import axios from "axios";

export const useWrappedData = (accessToken, timeRange = "short_term") => {
  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albumArt, setAlbumArt] = useState([]);
  const [topSongImg, setTopSongImg] = useState("");
  const [topSongName, setTopSongName] = useState("");
  const [topDecade, setTopDecade] = useState("N/A");
  const [uniqueArtists, setUniqueArtists] = useState("N/A");

  const fetch = async (endpoint) => {
    const result = await axios.get(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return result.data;
  };

  // Most common release decade across the given tracks, e.g. "2020s".
  const computeTopDecade = (tracks) => {
    const decades = new Map();
    let best = null;
    let bestCount = 0;
    tracks.forEach((track) => {
      const date = track.album?.release_date;
      if (!date) return;
      const year = parseInt(date.slice(0, 4), 10);
      if (Number.isNaN(year)) return;
      const decade = Math.floor(year / 10) * 10;
      const count = (decades.get(decade) || 0) + 1;
      decades.set(decade, count);
      if (count > bestCount) {
        best = decade;
        bestCount = count;
      }
    });
    return best === null ? "N/A" : `${best}s`;
  };

  // Number of distinct artists across the given tracks.
  const computeUniqueArtists = (tracks) => {
    const ids = new Set();
    tracks.forEach((track) =>
      (track.artists || []).forEach((artist) => {
        if (artist.id) ids.add(artist.id);
      })
    );
    return ids.size > 0 ? String(ids.size) : "N/A";
  };

  const getTopTracks = async () => {
    const topTracks = (
      await fetch(`v1/me/top/tracks?time_range=${timeRange}&limit=50`)
    ).items;
    setSongs(topTracks.slice(0, 5).map((track) => track.name));
    setAlbumArt([
      ...new Set(
        topTracks
          .map((track) => track.album?.images?.[0]?.url)
          .filter(Boolean)
      ),
    ]);
    setTopSongName(topTracks[0]?.name || "");
    setTopSongImg(topTracks[0]?.album?.images?.[0]?.url || "");
    setTopDecade(computeTopDecade(topTracks));
    setUniqueArtists(computeUniqueArtists(topTracks));
    return topTracks;
  };

  const getTopArtists = async () => {
    const topArtists = (
      await fetch(`v1/me/top/artists?time_range=${timeRange}&limit=50`)
    ).items;
    setArtists(topArtists.slice(0, 5).map((artist) => artist.name));
    return topArtists;
  };

  const wasUnauthorized = (result) =>
    result.status === "rejected" && result.reason?.response?.status === 401;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      // Each stat fetches on its own so one failure can't cascade into another.
      const [tracksResult, artistsResult] = await Promise.allSettled([
        getTopTracks(),
        getTopArtists(),
      ]);

      // The token lives in server memory and lasts ~1h with no refresh flow.
      // Once it expires every call 401s — clear it and return to Login instead
      // of rendering a broken, empty card. Hitting /logout clears the server's
      // stale token too, so the reload lands on Login rather than looping.
      if (wasUnauthorized(tracksResult) || wasUnauthorized(artistsResult)) {
        try {
          await axios.get("http://127.0.0.1:5000/logout");
        } catch (err) {
          // Already logging out; ignore.
        }
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        return;
      }

      if (tracksResult.status === "rejected") {
        console.error("Failed to load top tracks:", tracksResult.reason);
      }
      if (artistsResult.status === "rejected") {
        console.error("Failed to load top artists:", artistsResult.reason);
      }

      setIsLoading(false);
    };
    load();
  }, [timeRange]);

  return {
    isLoading,
    songs,
    artists,
    albumArt,
    topSongImg,
    topSongName,
    topDecade,
    uniqueArtists,
  };
};
