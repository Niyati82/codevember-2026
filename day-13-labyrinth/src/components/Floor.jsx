import React from "react";
import generateMaze from "../algorithms/generateMaze";

function Floor(props) {
  const { row, col, size } = props;
  console.log(col - (size - 1) / 2, row - (size - 1) / 2);

  const maze = generateMaze(5, 5);

  return (
    <>
      {maze.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <mesh
            position={[colIndex - (size - 1) / 2, 0, rowIndex - (size - 1) / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            key={`${rowIndex}-${colIndex}`}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color="red" />
          </mesh>
        ))
      )}
    </>
  );
}

export default Floor;
