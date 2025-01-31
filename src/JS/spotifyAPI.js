import axios from "axios";

const apiBaseUrl = "https://api.spotify.com/v1";

const getHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export async function getTopTracks(accessToken) {
  const response = await axios.get(
    `${apiBaseUrl}/me/top/tracks?time_range=long_term&limit=50`,
    {
      headers: getHeaders(accessToken),
    }
  );
  return response.data.items;
}

export async function getTopArtists(accessToken) {
  const response = await axios.get(
    `${apiBaseUrl}/me/top/artists?time_range=long_term&limit=50`,
    {
      headers: getHeaders(accessToken),
    }
  );
  return response.data.items;
}

export async function getRecentlyPlayed(accessToken) {
  const response = await axios.get(`${apiBaseUrl}/me/player/recently-played?limit=50`, {
    headers: getHeaders(accessToken),
  });
  return response.data.items;
}

export async function searchAlbum(accessToken, albumName, artistName) {
    const query = `${albumName} ${artistName}`;
    const response = await axios.get(`${apiBaseUrl}/search`, {
        headers: getHeaders(accessToken),
        params: {
            q: query,
            type: 'album',
            limit: 1,
        },
    });
    return response.data.albums.items[0];
}