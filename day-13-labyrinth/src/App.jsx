import { useState } from "react";
import "./App.css";
import Experience from "./components/Experience";
import generateMaze from "./algorithms/generateMaze";
import getNeighbors from "./algorithms/getNeighbors";

function App() {
  const maze = generateMaze(5, 5);
  const b = maze.flat().filter((cell) => cell.walls.bottom).length;
  const t = maze.flat().filter((cell) => cell.walls.top).length;
  const r = maze.flat().filter((cell) => cell.walls.right).length;
  const l = maze.flat().filter((cell) => cell.walls.left).length;

  const remainingWalls = b + t + r + l;

  const removedWalls = 100 - remainingWalls;
  const passages = removedWalls / 2;

  console.log(passages);
  return (
    <>
      <Experience />
    </>
  );
}

export default App;
