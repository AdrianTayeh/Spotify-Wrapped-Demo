import { searchAlbum } from "./spotifyAPI";
export async function findFavoriteAlbums(topTracks, accessToken) {
  const albumCounts = {};

  for (const track of topTracks) {
    if (track.album.album_type == "album") {
      const albumName = track.album.name;
      const artistName = track.artists[0].name;
      const key = `${albumName} - ${artistName}`;

      if (!albumCounts[key]) {
        albumCounts[key] = { count: 0, album: null };
      }
      albumCounts[key].count++;

      if (!albumCounts[key].album) {
        const album = await searchAlbum(accessToken, albumName, artistName);
        albumCounts[key].album = album;
      }
    }
  }

  return Object.entries(albumCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, value]) => ({
      name: key.split(" - ")[0],
      artist: key.split(" - ")[1],
      image: value.album.images[0].url,
    }));
}
