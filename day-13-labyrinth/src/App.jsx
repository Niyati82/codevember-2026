import { useState } from "react";
import "./App.css";
import Experience from "./components/Experience";
import generateMaze from "./algorithms/generateMaze";
import getNeighbors from "./algorithms/getNeighbors";
import ProjectTitle from "./components/ui/ProjectTitle";

function App() {
  return (
    <>
      <Experience />
      <ProjectTitle />
    </>
  );
}

export default App;
