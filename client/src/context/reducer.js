export const actionType = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_SONGS: 'SET_SONGS',
  SET_CURRENT_SONG: 'SET_CURRENT_SONG',
  SET_IS_PLAYING: 'SET_IS_PLAYING',
  SET_MOOD_SONGS: 'SET_MOOD_SONGS',
  SET_PLAYLISTS: 'SET_PLAYLISTS',
  ADD_PLAYLIST: 'ADD_PLAYLIST',
  ADD_TO_PLAYLIST: 'ADD_TO_PLAYLIST',
  REMOVE_FROM_PLAYLIST: 'REMOVE_FROM_PLAYLIST',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionType.SET_USER:
      return { ...state, user: action.user };
    case actionType.SET_LOADING:
      return { ...state, loading: action.loading };
    case actionType.SET_SONGS:
      return { ...state, allSongs: action.songs };
    case actionType.SET_CURRENT_SONG:
      return { ...state, currentSong: action.song };
    case actionType.SET_IS_PLAYING:
      return { ...state, isPlaying: action.isPlaying };
    case actionType.SET_MOOD_SONGS:
      return { ...state, moodSongs: action.moodSongs };
    case actionType.SET_PLAYLISTS:
      return { ...state, playlists: action.playlists };
    case actionType.ADD_PLAYLIST:
      return { ...state, playlists: [...state.playlists, action.playlist] };
    case actionType.ADD_TO_PLAYLIST:
      return {
        ...state,
        playlists: state.playlists.map((p) =>
          p._id === action.playlistId
            ? { ...p, songs: [...(p.songs || []), action.song] }
            : p
        ),
      };
    case actionType.REMOVE_FROM_PLAYLIST:
      return {
        ...state,
        playlist: state.playlist.filter(
          (s) => (s._id || s.id) !== (action.songId || action.song?._id)
        ),
      };
    default:
      return state;
  }
};

export default reducer;