export class Grid {
    public static getAllNeighbors<T>(rowId: number, columnId: number, grid: T[][]): T[] {
        const numRows = grid.length;
        const numCols = grid[0].length;
        const neighbors = [];

        // Check above neighbor
        if (rowId - 1 >= 0) {
            neighbors[0] = grid[rowId - 1][columnId]
        }

        // Check right neighbor
        if (columnId + 1 < numCols) {
            neighbors[1] = grid[rowId][columnId + 1]
        }

        // Check bottom neighbor
        if (rowId + 1 < numRows) {
            neighbors[2] = grid[rowId + 1][columnId]
        }

        // Check left neighbor
        if (columnId - 1 >= 0) {
            neighbors[3] = grid[rowId][columnId - 1];
        }

        return neighbors;
    }
}