import { useCallback } from "react";
import { useDispatch } from "react-redux";
import useThunkPoll from "../../../hooks/useThunkPoll";
import { fetchPostDetails } from "../postSlice";

const MAX_POLL_ATTEMPTS = 5; // Maximum number of polling attempts
const POLL_INTERVAL_MS = 3000; // Interval between each attempt in milliseconds

const usePostDetailsThunkPoll = (requestId = "1") => {
  const dispatch = useDispatch();

  const thunkAction = useCallback(() => {
    if (requestId) {
      return dispatch(fetchPostDetails({ postId: requestId }));
    }
    return Promise.resolve();
  }, [dispatch, requestId]);

  const validator = useCallback((data) => {
    if (!data) return false;
    return data.every((post) => post?.body && post.body.trim() !== "");
  }, []);

  const pollingState = useThunkPoll(
    thunkAction,
    MAX_POLL_ATTEMPTS,
    POLL_INTERVAL_MS,
    validator
  );

  return {
    ...pollingState,
  };
};

export default usePostDetailsThunkPoll;
