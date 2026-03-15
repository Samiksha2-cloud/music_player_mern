export const actionType = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_SONGS: 'SET_SONGS',
  ADD_TO_PLAYLIST: 'ADD_TO_PLAYLIST',
  REMOVE_FROM_PLAYLIST: 'REMOVE_FROM_PLAYLIST',
  SET_CURRENT_SONG: 'SET_CURRENT_SONG',
  SET_IS_PLAYING: 'SET_IS_PLAYING',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionType.SET_USER:
      return { ...state, user: action.user };
    case actionType.SET_LOADING:
      return { ...state, loading: action.loading };
    case actionType.SET_SONGS:
      return { ...state, allSongs: action.songs };
    case actionType.ADD_TO_PLAYLIST:
      if (state.playlist.some((s) => (s._id || s.id) === (action.song._id || action.song.id))) {
        return state;
      }
      return { ...state, playlist: [...state.playlist, action.song] };
    case actionType.REMOVE_FROM_PLAYLIST:
      return {
        ...state,
        playlist: state.playlist.filter(
          (s) => (s._id || s.id) !== (action.songId || action.song?._id || action.song?.id)
        ),
      };
    case actionType.SET_CURRENT_SONG:
      return { ...state, currentSong: action.song };
    case actionType.SET_IS_PLAYING:
      return { ...state, isPlaying: action.isPlaying };
    default:
      return state;
  }
};

export default reducer;