import React, { useState } from 'react';
import { uploadSong } from '../api';
import { useStateValue } from '../context/Stateprovider';
import { actionType } from '../context/reducer';
import { fetchSongs } from '../api';

export default function AdminUpload() {
  const [, dispatch] = useStateValue();
  const [form, setForm] = useState({ title: '', artist: '', album: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.artist || !audioFile) {
      setMessage('Title, artist and audio file are required!');
      return;
    }
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('artist', form.artist);
    formData.append('album', form.album);
    formData.append('audio', audioFile);
    if (imageFile) formData.append('image', imageFile);

    const result = await uploadSong(formData);
    if (result?.song) {
      setMessage('Song uploaded successfully!');
      setForm({ title: '', artist: '', album: '' });
      setAudioFile(null);
      setImageFile(null);
      // Refresh songs list
      const songs = await fetchSongs();
      if (songs?.length) dispatch({ type: actionType.SET_SONGS, songs });
    } else {
      setMessage('Upload failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 border border-indigo-900/40">
        <h2 className="text-2xl font-bold mb-6 text-center">Upload Song</h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Song title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-indigo-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            placeholder="Artist name *"
            value={form.artist}
            onChange={(e) => setForm({ ...form, artist: e.target.value })}
            className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-indigo-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            placeholder="Album (optional)"
            value={form.album}
            onChange={(e) => setForm({ ...form, album: e.target.value })}
            className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-indigo-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />

          {/* Audio upload */}
          <div className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-indigo-900/30 cursor-pointer">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-cyan-400">🎵</span>
              <span className="text-gray-400 text-sm">
                {audioFile ? audioFile.name : 'Choose MP3 file *'}
              </span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => setAudioFile(e.target.files[0])}
              />
            </label>
          </div>

          {/* Image upload */}
          <div className="w-full py-3 px-4 bg-gray-800/60 rounded-xl border border-indigo-900/30 cursor-pointer">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-cyan-400">🖼️</span>
              <span className="text-gray-400 text-sm">
                {imageFile ? imageFile.name : 'Choose cover image (optional)'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </label>
          </div>

          {message && (
            <p className={`text-sm text-center ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-200 font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Song'}
          </button>
        </div>
      </div>
    </div>
  );
}