import "../CSS/style.css";
import { getLoginUrl, getAccessToken, getUserData, getRefreshToken } from "./auth.js";
import { getTopTracks, getTopArtists, getRecentlyPlayed } from "./spotifyAPI.js";
import { findFavoriteAlbums } from './analysis.js';

const imgUrl = new URL("../2024-spotify-logo-icon/Primary_Logo_White_RGB.svg", import.meta.url);
document.querySelector('#app').innerHTML = `
  <div class="navbar">
    <div class="logo">
      <img class="logoImg" src="${imgUrl}" alt="Spotify Logo">
    </div>
    <h1 class="contentHeader"><a href="${window.location.origin}">Spotify Wrapped</a></h1>
    <div class="user-controls">
      <button id="logout" style="display: none;">Logout</button>
      <img class="userImg" id="userImg" style="display: none;" alt="User Image">
    </div>
  </div>
  <div class="container">
    <button id="login">Login with Spotify</button>
    <div id="user-info"></div>
  </div>
  <div id="lists-container" class="hidden">
    <div class="list-container" id="topTracks">
      <h2>Top Tracks</h2>
      <ul></ul>
    </div>
    <div class="list-container" id="topArtists">
      <h2>Top Artists</h2>
      <ul></ul>
    </div>
    <div class="list-container" id="topAlbums">
      <h2>Top Albums</h2>
      <ul></ul>
    </div>
  </div>
`;

document.querySelector('#login').addEventListener('click', async () => {
  const loginUrl = await getLoginUrl();
  window.location.href = loginUrl;
});

document.querySelector('#logout').addEventListener('click', () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  document.querySelector('#user-info').innerHTML = '';
  document.querySelector('#logout').style.display = 'none';
  document.querySelector('#login').style.display = 'block';
  document.querySelector('#userImg').style.display = 'none';
  document.querySelector('#lists-container').classList.add('hidden');
  document.querySelector('.container').classList.remove('hidden');

});

async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (code) {
    try {
      const accessToken = await getAccessToken(code);
      const userData = await getUserData(accessToken);
      document.querySelector('#logout').style.display = 'block';
      document.querySelector('#login').style.display = 'none';
      document.querySelector('#userImg').src = userData.images[0].url;
      document.querySelector('#userImg').style.display = 'block';
      document.querySelector('#lists-container').classList.remove('hidden');
      document.querySelector('.container').classList.add('hidden');


      await displayUserStats(accessToken);
    } catch (error) {
      console.error('Error during callback handling:', error);
      document.querySelector('#user-info').innerHTML = `
        <p>Error logging in. Please try again.</p>
      `;
    }
  }
}

async function refreshAccessToken() {
  try {
    const accessToken = await getRefreshToken();
    const userData = await getUserData(accessToken);
    document.querySelector('#logout').style.display = 'block';
    document.querySelector('#login').style.display = 'none';
    document.querySelector('#userImg').src = userData.images[0].url;
    document.querySelector('#userImg').style.display = 'block';
    document.querySelector('#lists-container').classList.remove('hidden');
  } catch (error) {
    console.error('Error refreshing access token:', error);
    document.querySelector('#user-info').innerHTML = `
      <p>Error refreshing access token. Please log in again.</p>
    `;
  }
}

if (window.location.search.includes('code=')) {
  handleCallback();
} else if (localStorage.getItem('refresh_token')) {
  refreshAccessToken();
}

async function displayUserStats(accessToken) {
  const userData = await getUserData(accessToken);
  const topTracks = await getTopTracks(accessToken);
  const topArtists = await getTopArtists(accessToken);
  const recentlyPlayed = await getRecentlyPlayed(accessToken);

  const favoriteAlbums = await findFavoriteAlbums(topTracks, accessToken);

  console.log('User Data:', userData);
  console.log('Top Tracks:', topTracks);
  console.log('Top Artists:', topArtists);
  console.log('Recently Played:', recentlyPlayed);

  // Log the data to verify structure
  console.log('Top Tracks Items:', topTracks);
  console.log('Top Artists Items:', topArtists);
  console.log('Favorite Albums:', favoriteAlbums);

  displayList('topTracks', topTracks, 'track');
  displayList('topArtists', topArtists, 'artist');
  displayList('topAlbums', favoriteAlbums, 'album');
}

function displayList(containerId, items, type) {
  if (!items) {
    console.error(`Items for ${containerId} are undefined`);
    return;
  }

  const container = document.getElementById(containerId).querySelector('ul');
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  container.innerHTML = '';

  items.slice(0,20).forEach(item => {
    const listItem = document.createElement('li');
    const img = document.createElement('img');
    const text = document.createElement('span');

    if (type === 'track') {
      img.src = item.album.images[0].url;
      text.textContent = item.name;
    } else if (type === 'artist') {
      img.src = item.images[0].url;
      text.textContent = item.name;
    } else if (type === 'album') {
      img.src = item.image;
      text.textContent = `${item.name} by ${item.artist}`;
    }

    listItem.appendChild(img);
    listItem.appendChild(text);
    container.appendChild(listItem);
  });
}

// Call displayUserStats with the access token
const accessToken = await getRefreshToken();
displayUserStats(accessToken);