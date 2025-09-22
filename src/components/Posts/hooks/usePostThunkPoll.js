import { useCallback } from "react";
import useThunkPoll from "../../../hooks/useThunkPoll";
import { fetchPosts } from "../postSlice";

/**
 * Posts-specific polling hook that uses the generic useThunkPoll
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 5)
 * @param {number} interval - Interval between polls in milliseconds (default: 3000)
 * @returns {Object} All essential polling state and control functions
 */
const usePostThunkPoll = (maxAttempts = 5, interval = 3000) => {
  // Posts validator logic: validates if post count > 10
  const postsValidator = useCallback((payload) => {
    // Check if payload exists and has posts data
    if (!payload || !Array.isArray(payload)) {
      return false;
    }

    // Return true if post count > 10
    return payload.length > 101;
  }, []);

  // Use the generic useThunkPoll hook with Posts-specific parameters
  const pollingState = useThunkPoll(
    fetchPosts, // thunk action
    maxAttempts, // maximum attempts
    interval, // interval between each attempt
    postsValidator // validator function
  );

  // Return all essential params back to component
  return {
    ...pollingState,
    // Additional Posts-specific information could be added here if needed
    postsCount: pollingState.lastResult?.payload?.length || 0,
  };
};

export default usePostThunkPoll;
