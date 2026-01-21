import { useState, useCallback, useEffect } from "react";

const MENU_BROWSE_STATE_KEY = "menu_browse_state";

/**
 * Custom hook to manage menu browse state persistence
 * Saves and restores scroll position, filters, search query, etc.
 */
export const useMenuBrowseState = () => {
  // Get initial state from sessionStorage
  const getInitialState = () => {
    try {
      const savedState = sessionStorage.getItem(MENU_BROWSE_STATE_KEY);
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error("Error reading menu browse state:", error);
      return null;
    }
  };

  const [savedState, setSavedState] = useState(getInitialState());

  // Save current menu state
  const saveMenuState = useCallback((state) => {
    try {
      // Get existing state to preserve scrollPosition if not provided
      const existingState = getInitialState();
      
      const stateToSave = {
        ...existingState, // Preserve existing state (including scrollPosition)
        ...state, // Override with new state
        timestamp: Date.now(),
      };

      sessionStorage.setItem(
        MENU_BROWSE_STATE_KEY,
        JSON.stringify(stateToSave),
      );
      setSavedState(stateToSave);

      console.log("📱 Menu state saved:", stateToSave);
    } catch (error) {
      console.error("Error saving menu browse state:", error);
    }
  }, []);

  // Restore menu state (without automatic scroll - component handles that)
  const restoreMenuState = useCallback(() => {
    const state = getInitialState();

    if (state && Date.now() - state.timestamp < 30 * 60 * 1000) {
      // Valid for 30 minutes
      console.log("📱 Restoring menu state:", state);
      return state;
    }

    return null;
  }, []);

  // Clear saved state
  const clearMenuState = useCallback(() => {
    try {
      sessionStorage.removeItem(MENU_BROWSE_STATE_KEY);
      setSavedState(null);
      console.log("📱 Menu state cleared");
    } catch (error) {
      console.error("Error clearing menu browse state:", error);
    }
  }, []);

  // Check if we have valid saved state
  const hasSavedState = useCallback(() => {
    const state = getInitialState();
    return state && Date.now() - state.timestamp < 30 * 60 * 1000;
  }, []);

  // Clear only the scroll position while keeping other state
  const clearScrollPosition = useCallback(() => {
    const currentState = restoreMenuState();
    if (currentState) {
      const { scrollPosition, ...stateWithoutScroll } = currentState;
      saveMenuState(stateWithoutScroll);
    }
  }, [restoreMenuState, saveMenuState]);

  return {
    savedState,
    saveMenuState,
    restoreMenuState,
    clearMenuState,
    clearScrollPosition,
    hasSavedState,
  };
};

export default useMenuBrowseState;
