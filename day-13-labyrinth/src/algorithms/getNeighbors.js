export default function getNeighbors(grid, row, col) {
  const neighbors = [];

  // Top
  if (row - 1 >= 0 && !grid[row - 1][col].visited) {
    neighbors.push(grid[row - 1][col]);
  }
  // Right
  if (col + 1 < grid[0].length && !grid[row][col + 1].visited) {
    neighbors.push(grid[row][col + 1]);
  }
  // Left
  if (col - 1 >= 0 && !grid[row][col - 1].visited) {
    neighbors.push(grid[row][col - 1]);
  }
  // Bottom
  if (row + 1 < grid.length && !grid[row + 1][col].visited) {
    neighbors.push(grid[row + 1][col]);
  }
  neighbors.length.Mat
  return neighbors;
}
