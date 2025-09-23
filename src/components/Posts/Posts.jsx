import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import usePostThunkPoll from "./hooks/usePostThunkPoll";

const Posts = () => {
  const posts = useSelector((state) => state.posts?.items ?? []);
  const status = useSelector((state) => state.posts?.status ?? "idle");
  const error = useSelector((state) => state.posts?.error ?? null);

  // Use the polling hook
  const {
    startPolling,
    stopPolling,
    isPollingJobActive,
    isPolling,
    attemptCount,
    validationStatus,
  } = usePostThunkPoll(); // 5 attempts, 3-second interval

  // Start polling on component mount and stop on unmount
  useEffect(() => {
    startPolling();

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  // Render loading, error, or posts based on the current state
  if (status === "loading" && posts.length === 0) {
    return <div>Loading...</div>;
  }

  if (status === "failed" && posts.length === 0) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>
        Posts {isPollingJobActive ? "Polling JOB Active" : "Polling JOB Done"}
      </h2>
      <h3>Polling count {attemptCount}</h3>
      {validationStatus && (
        <div
          style={{
            marginBottom: "1rem",
            color: validationStatus === "success" ? "green" : "red",
          }}
        >
          Polling finished: {validationStatus.replace("_", " ")}
        </div>
      )}
      <div>
        <strong>Post Details</strong>
      </div>
      <ul>
        {posts.length === 0 ? (
          <li>No posts found</li>
        ) : (
          posts.map((post) => (
            <li key={post.id} style={{ marginBottom: "1rem" }}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <small>User ID: {post.userId}</small>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Posts;
