
import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  itenaries: ["1", "2", "3"],
};

const ItenaryContext = createContext();

const actions = {
  ADD_ITENARY : 'ADD_ITENARY'
};

const itenaryReducer = (state, action) => {
  switch (action.type) {
    case actions.ADD_ITENARY:
      return {
        ...state,
        itenaries: [...state.itenaries, action.payload],
      };
    default:
      return state;
  }
};

export const useItenaryContext = () => {
  const context = useContext(ItenaryContext);
  if (!context) {
    throw new Error('useItenaryContext must be used within an ItenaryProvider');
  }
  return context;
};

export const ItenaryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(itenaryReducer, initialState);

  const addItenary = (itenary) => {
    dispatch({ type: actions.ADD_ITENARY, payload: itenary });
  };

  return (
    <ItenaryContext.Provider value={{ state, addItenary }}>
      {children}
    </ItenaryContext.Provider>
  );
};

export default ItenaryContext
