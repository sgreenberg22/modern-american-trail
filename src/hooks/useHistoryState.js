import { useState, useCallback } from 'react';

export function useHistoryState(initialState) {
  const [history, setHistory] = useState(() => {
    const firstState = typeof initialState === 'function' ? initialState() : initialState;
    return [firstState];
  });
  const [index, setIndex] = useState(0);

  // Creates a new state in history. If you've gone back, this truncates the "future" history.
  const pushState = useCallback((updater) => {
    setHistory(prevHistory => {
      const currentState = prevHistory[index];
      const newState = typeof updater === 'function' ? updater(currentState) : updater;
      const newHistory = prevHistory.slice(0, index + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setIndex(prevIndex => prevIndex + 1);
  }, [index]);

  // Replaces the current state without adding to history. For UI changes.
  const updateCurrentState = useCallback((updater) => {
    setHistory(prevHistory => {
        const currentState = prevHistory[index];
        const newState = typeof updater === 'function' ? updater(currentState) : updater;
        const newHistory = [...prevHistory];
        newHistory[index] = newState;
        return newHistory;
    });
  }, [index]);


  // Resets the entire history to a new initial state.
  const resetState = useCallback((newState) => {
    setHistory([newState]);
    setIndex(0);
  }, []);

  const goBack = useCallback(() => {
    if (index > 0) {
      setIndex(prevIndex => prevIndex - 1);
    }
  }, [index]);

  const goForward = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(prevIndex => prevIndex + 1);
    }
  }, [index, history.length]);

  return {
    state: history[index],
    pushState,
    updateCurrentState,
    resetState,
    goBack,
    goForward,
    canGoBack: index > 0,
    canGoForward: index < history.length - 1,
    historyLength: history.length,
    currentIndex: index,
  };
}