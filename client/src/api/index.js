import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/';

export const validateUser = async (token) => {
  try {
    const res = await axios.get(`${baseURL}/api/users/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.user ?? res.data;
  } catch (error) {
    console.error('Error validating user:', error?.response?.data || error.message);
    return null;
  }
};

export const fetchSongs = async (params = {}) => {
  try {
    const res = await axios.get(`${baseURL}/api/songs`, { params });
    return res.data;
  } catch (error) {
    console.error('Error fetching songs:', error?.response?.data || error.message);
    return [];
  }
};

export const fetchMoodSongs = async () => {
  try {
    const res = await axios.get(`${baseURL}/api/songs/moods`);
    return res.data;
  } catch (error) {
    console.error('Error fetching mood songs:', error?.response?.data || error.message);
    return {};
  }
};

export const uploadSong = async (formData) => {
  try {
    const res = await axios.post(`${baseURL}/api/songs/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    console.error('Error uploading song:', error?.response?.data || error.message);
    return null;
  }
};

export const deleteSong = async (id) => {
  try {
    const res = await axios.delete(`${baseURL}/api/songs/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting song:', error?.response?.data || error.message);
    return null;
  }
};

export const fetchPlaylists = async (userId) => {
  try {
    const res = await axios.get(`${baseURL}/api/playlists`, {
      headers: { 'x-user-id': userId },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching playlists:', error?.response?.data || error.message);
    return [];
  }
};

export const createPlaylist = async (name, userId, isPremium = false) => {
  try {
    const res = await axios.post(
      `${baseURL}/api/playlists`,
      { name, userId, isPremium },
      { headers: { 'x-user-id': userId } }
    );
    return res.data;
  } catch (error) {
    // Return the error response so we can show limit message
    return { error: error?.response?.data?.message, limitReached: error?.response?.data?.limitReached };
  }
};

export const addSongToPlaylist = async (playlistId, songId) => {
  const points = parseInt(localStorage.getItem('riff_points') || '0');
  const isPremium = localStorage.getItem('riff_premium') === 'true';
  try {
    const res = await axios.post(`${baseURL}/api/playlists/${playlistId}/songs`, {
      songId,
      points,
      isPremium,
    });
    return res.data;
  } catch (error) {
    return { error: error?.response?.data?.message, limitReached: error?.response?.data?.limitReached };
  }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const res = await axios.delete(`${baseURL}/api/playlists/${playlistId}/songs/${songId}`);
    return res.data;
  } catch (error) {
    console.error('Error removing song:', error?.response?.data || error.message);
    return null;
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const res = await axios.delete(`${baseURL}/api/playlists/${playlistId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting playlist:', error?.response?.data || error.message);
    return null;
  }
};