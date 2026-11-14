import React, { Fragment, useMemo } from "react";
import generateMaze from "../algorithms/generateMaze";
import Walls from "./Walls";

function Floor(props) {
  const { row, col, size } = props;
  console.log(col - (size - 1) / 2, row - (size - 1) / 2);

  const maze = useMemo(() => {
    return generateMaze(50, 50);
  }, []);
  const cellA = maze[0][0];
  const cellB = maze[0][1];
  console.log(cellA.walls.right);
  console.log(cellB.walls.left);

  return (
    <>
      {maze.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Fragment key={`${rowIndex}-${colIndex}`}>
            {/* Floor */}
            <mesh
              position={[
                colIndex - (size - 1) / 2,
                0,
                rowIndex - (size - 1) / 2,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
              key={`${rowIndex}-${colIndex}`}
            >
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial color="white" />
            </mesh>
            {/* 
                // Cells Rendering
                // Right 
            */}
            {cell.walls.right && (
              <Walls
                position={[
                  colIndex - (size - 1) / 2 + 0.5,
                  0.5,
                  rowIndex - (size - 1) / 2,
                ]}
                args={[0.03, 1, 1]}
              />
            )}
            {/* Left */}
            {cell.walls.left && colIndex === 0 && (
              <Walls
                position={[
                  colIndex - (size - 1) / 2 - 0.5,
                  0.5,
                  rowIndex - (size - 1) / 2,
                ]}
                args={[0.03, 1, 1]}
              />
            )}
            {/* Top */}
            {cell.walls.top && rowIndex === 0 && (
              <Walls
                position={[
                  colIndex - (size - 1) / 2,
                  0.5,
                  rowIndex - (size - 1) / 2 - 0.5,
                ]}
                args={[1, 1, 0.03]}
              />
            )}
            {/* Bottom */}
            {cell.walls.bottom && (
              <Walls
                position={[
                  colIndex - (size - 1) / 2,
                  0.5,
                  rowIndex - (size - 1) / 2 + 0.5,
                ]}
                args={[1, 1, 0.03]}
              />
            )}
          </Fragment>
        ))
      )}
    </>
  );
}

export default Floor;
