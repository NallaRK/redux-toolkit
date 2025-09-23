import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import Posts from "./Posts";
jest.mock("./hooks/usePostThunkPoll", () => () => ({
  startPolling: jest.fn(),
  stopPolling: jest.fn(),
  isPollingJobActive: false,
  isPolling: false,
  attemptCount: 0,
  validationStatus: null,
  postsCount: 0,
}));

const mockStore = configureMockStore();

const defaultState = {
  posts: {
    items: [
      { id: 1, title: "Test Post", body: "This is a test post.", userId: 1 },
      { id: 2, title: "Another Post", body: "Another body.", userId: 2 },
    ],
    status: "succeeded",
    error: null,
  },
};

describe("Posts Component", () => {
  it("renders posts list", () => {
    const store = mockStore(defaultState);
    render(
      <Provider store={store}>
        <Posts />
      </Provider>
    );
    expect(screen.getByText("Posts Polling JOB Done")).toBeInTheDocument();
    expect(screen.getByText("Polling count 0")).toBeInTheDocument();
    expect(screen.getByText("Test Post")).toBeInTheDocument();
    expect(screen.getByText("Another Post")).toBeInTheDocument();
    expect(screen.getByText("Polling count 0")).toBeInTheDocument();
  });

  it("shows loading when status is loading and no posts", () => {
    const store = mockStore({
      posts: { items: [], status: "loading", error: null },
    });
    render(
      <Provider store={store}>
        <Posts />
      </Provider>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error when status is failed and no posts", () => {
    const store = mockStore({
      posts: { items: [], status: "failed", error: "Network error" },
    });
    render(
      <Provider store={store}>
        <Posts />
      </Provider>
    );
    expect(screen.getByText("Error: Network error")).toBeInTheDocument();
  });

  it("shows no posts found when items is empty", () => {
    const store = mockStore({
      posts: { items: [], status: "succeeded", error: null },
    });
    render(
      <Provider store={store}>
        <Posts />
      </Provider>
    );
    expect(screen.getByText("No posts found")).toBeInTheDocument();
  });
});
