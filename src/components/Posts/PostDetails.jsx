import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import usePostDetailsThunkPoll from "./hooks/usePostDetailsThunkPoll";

const PostDetails = () => {
  const postDetails = useSelector((state) => state.posts?.postDetails ?? {});

  // Use the polling hook
  const {
    startPolling,
    stopPolling,
    isPollingJobActive,
    isPolling,
    attemptCount,
  } = usePostDetailsThunkPoll();

  // Start polling on component mount and stop on unmount
  useEffect(() => {
    startPolling();

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return (
    <div>
      <h2>
        Post Details{" "}
        {isPollingJobActive ? `IS Polling -  ${isPolling}` : "Polling JOB Done"}
      </h2>
      <h3>Polling count {attemptCount}</h3>
      <div>
        <strong>Post Details</strong>
        <div>Title: {postDetails.title}</div>
        <div>Body: {postDetails.body}</div>
        <div>User ID: {postDetails.userId}</div>
        <div>Post ID: {postDetails.id}</div>
      </div>
    </div>
  );
};

export default PostDetails;
