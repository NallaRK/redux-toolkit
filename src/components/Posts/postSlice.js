import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Example async thunk for fetching posts
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!response.ok) {
    // If the API call fails, throw an error to trigger the 'rejected' state.
    throw new Error("Failed to fetch posts");
  }
  const data = await response.json();
  return data;
});

export const fetchPostDetails = createAsyncThunk(
  "posts/fetchPostDetails",
  async (payload) => {
    const { postId } = payload;
    console.log("🚀 ~ postId:", postId);
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${postId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch post details");
    }
    const data = await response.json();
    return data;
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    postDetails: {},
  },
  reducers: {
    addPost: (state, action) => {
      state.items.push(action.payload);
    },
    removePost: (state, action) => {
      state.items = state.items.filter((post) => post.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchPostDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPostDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.postDetails = action.payload;
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addPost, removePost } = postSlice.actions;
export default postSlice.reducer;
