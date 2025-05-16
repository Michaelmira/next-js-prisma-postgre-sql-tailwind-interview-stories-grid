'use client';

import { createContext, useContext, useState } from 'react';

const SelectedStoryContext = createContext({
  selectedTitle: null,
  setSelectedTitle: () => {},
});

export const useSelectedStory = () => useContext(SelectedStoryContext);

export const SelectedStoryProvider = ({ children }) => {
  const [selectedTitle, setSelectedTitle] = useState(null);

  return (
    <SelectedStoryContext.Provider value={{ selectedTitle, setSelectedTitle }}>
      {children}
    </SelectedStoryContext.Provider>
  );
}; 