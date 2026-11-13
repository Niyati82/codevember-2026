import getNeighbors from "./getNeighbors";

export default function generateMaze(rows, cols) {
  const grid = [];

  for (let row = 0; row < rows; row++) {
    let currentRow = [];
    for (let col = 0; col < cols; col++) {
      const cell = {
        row: row,
        col: col,
        visited: false,
        walls: {
          top: true,
          bottom: true,
          left: true,
          right: true,
        },
      };
      currentRow.push(cell);
    }
    grid.push(currentRow);
  }

  carveMaze(grid, 0, 0);

  return grid;
}

function carveMaze(grid, row, col) {
  const currentCell = grid[row][col];
  currentCell.visited = true;

  // Get Unvisited Neighbors of Current Cell
  let neighbors = getNeighbors(grid, row, col);

  // Repeat while unvisited neighbors exist
  while (neighbors.length > 0) {
    // Get the Random Index
    const randomIndex = Math.floor(Math.random() * neighbors.length);

    // Get Random Neightbors from Random Index
    const randomNeighbor = neighbors[randomIndex];

    // Removing Walls on Top, Bottom, Left, Right
    // Top
    if (currentCell.row > randomNeighbor.row) {
      currentCell.walls.top = false;
      randomNeighbor.walls.bottom = false;
    }
    // Right
    if (currentCell.col < randomNeighbor.col) {
      currentCell.walls.right = false;
      randomNeighbor.walls.left = false;
    }
    // Left
    if (currentCell.col > randomNeighbor.col) {
      currentCell.walls.left = false;
      randomNeighbor.walls.right = false;
    }
    // Bottom
    if (currentCell.row < randomNeighbor.row) {
      currentCell.walls.bottom = false;
      randomNeighbor.walls.top = false;
    }

    // Recursive Backtracking Function
    carveMaze(grid, randomNeighbor.row, randomNeighbor.col);

    // Update neighbors
    neighbors = getNeighbors(grid, currentCell.row, currentCell.col);
  }
}
