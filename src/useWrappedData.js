import { useEffect, useState } from "react";
import axios from "axios";

const TIME_RANGE = "long_term";

export const useWrappedData = (accessToken) => {
  const [isLoading, setIsLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState("N/A");
  const [topGenre, setTopGenre] = useState("N/A");
  const [topSongImg, setTopSongImg] = useState("");

  const fetch = async (endpoint) => {
    const result = await axios.get(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return result.data;
  };

  const getArtists = async (idList) => {
    if (!idList) return [];
    return (await fetch(`v1/artists?ids=${encodeURIComponent(idList)}`))
      .artists;
  };

  const getTopTracks = async () => {
    const topTracks = (
      await fetch(`v1/me/top/tracks?time_range=${TIME_RANGE}&limit=50`)
    ).items;
    setSongs(topTracks.slice(0, 5).map((track) => track.name));
    if (topTracks.length > 0 && topTracks[0].album?.images?.[0]?.url) {
      setTopSongImg(topTracks[0].album.images[0].url);
    }
    return topTracks;
  };

  const getTopArtists = async () => {
    const topArtists = (
      await fetch(`v1/me/top/artists?time_range=${TIME_RANGE}&limit=50`)
    ).items;
    setArtists(topArtists.slice(0, 5).map((artist) => artist.name));
    return topArtists;
  };

  const getRecentlyPlayed = async () => {
    const items = (await fetch("v1/me/player/recently-played?limit=1")).items;
    if (items.length > 0) {
      setRecentlyPlayed(items[0].track.name);
    }
  };

  const findMostFrequent = (array) => {
    if (!array || array.length === 0) return "N/A";
    const countMap = new Map();
    let mostFrequent = array[0];
    let maxCount = 0;
    array.forEach((item) => {
      const count = (countMap.get(item) || 0) + 1;
      countMap.set(item, count);
      if (count > maxCount) {
        mostFrequent = item;
        maxCount = count;
      }
    });
    return mostFrequent.charAt(0).toUpperCase() + mostFrequent.slice(1);
  };

  const getIdList = (trackArtistIds) => {
    return trackArtistIds.join(",");
  };

  const getTopGenre = async () => {
    const topTracks = await getTopTracks();
    const topArtists = await getTopArtists();

    const trackArtists = topTracks.map((item) => item.artists).flat();
    const trackArtistIds = trackArtists.map((item) => item.id);

    let trackArtistGenres = [];
    if (trackArtistIds.length > 0) {
      const idsFirstSet = getIdList(trackArtistIds.slice(0, 38));
      const idsSecondSet = getIdList(trackArtistIds.slice(38, 76));
      const firstSet = await getArtists(idsFirstSet);
      const secondSet = await getArtists(idsSecondSet);
      trackArtistGenres = firstSet
        .concat(secondSet)
        .map((item) => item.genres)
        .flat();
    }

    const artistGenres = topArtists.map((item) => item.genres).flat();
    const topGenres = trackArtistGenres.concat(artistGenres);
    setTopGenre(findMostFrequent(topGenres));
    setIsLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await getTopGenre();
        await getRecentlyPlayed();
      } catch (err) {
        console.error("Failed to load wrapped data:", err);
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return { isLoading, songs, artists, recentlyPlayed, topGenre, topSongImg };
};
