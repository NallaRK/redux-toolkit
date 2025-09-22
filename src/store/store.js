import { configureStore } from "@reduxjs/toolkit";
import postReducer from "../components/Posts/postSlice";
const store = configureStore({
  reducer: {
    posts: postReducer,
  },
});

export default store;
