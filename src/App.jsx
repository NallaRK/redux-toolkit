import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Posts from "./components/Posts/Posts";
import PostDetails from "./components/Posts/postDetails";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          {/* <Route path="/edit/:id" element={<EditTodo />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
