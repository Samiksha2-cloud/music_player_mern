import axios from 'axios';

const baseURL = 'http://localhost:4000/';

export const validateUser = async (token) => {
  try {
    const res = await axios.get(`${baseURL}api/users/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.user ?? res.data;
  } catch (error) {
    console.error('Error validating user:', error?.response?.data || error.message);
    return null;
  }
};

export const fetchSongs = async () => {
  try {
    const res = await axios.get(`${baseURL}api/songs`);
    return res.data;
  } catch (error) {
    console.error('Error fetching songs:', error?.response?.data || error.message);
    return null;
  }
};

export const uploadSong = async (formData) => {
  try {
    const res = await axios.post(`${baseURL}api/songs/upload`, formData, {
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
    const res = await axios.delete(`${baseURL}api/songs/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting song:', error?.response?.data || error.message);
    return null;
  }
};