import { useCallback } from "react";
import { useDispatch } from "react-redux";
import useThunkPoll from "../../../hooks/useThunkPoll";
import { fetchPosts } from "../postSlice";

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 3000;

const usePostThunkPoll = () => {
  const dispatch = useDispatch();

  const thunkAction = useCallback(() => {
    return dispatch(fetchPosts());
  }, [dispatch]);

  const validator = useCallback((posts) => {
    return Array.isArray(posts) && posts.length > 101;
  }, []);

  const { lastResult, ...rest } = useThunkPoll(
    thunkAction,
    MAX_POLL_ATTEMPTS,
    POLL_INTERVAL_MS,
    validator
  );

  const postsCount =
    lastResult && Array.isArray(lastResult.payload)
      ? lastResult.payload.length
      : 0;

  return { ...rest, lastResult, postsCount };
};

export default usePostThunkPoll;
