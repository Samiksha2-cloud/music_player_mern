import React, { createContext, useContext, useReducer } from 'react';
import reducer from './reducer';
import { initialState } from './initialState';

export const StateContext = createContext();

export const useStateValue = () => useContext(StateContext);

export const StateProvider = ({ children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);