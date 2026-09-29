# Pathfinding & Sorting Visualizer

An interactive React app that animates how classic pathfinding and sorting algorithms work, step by step.

## Features

**Pathfinding** (grid rendered on an HTML canvas)
- A*, Dijkstra's, breadth-first search, depth-first search
- Draw walls, paint weighted cells (cost 5), generate random walls, and drag the start/end markers
- Reports cells explored, path length, and total path cost after each run

**Sorting**
- Quick, merge, insertion, selection, and bubble sort
- Adjustable array size (10 to 120) with highlighted comparisons and swaps, plus a step counter

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## How it works

Every algorithm lives in `src/algorithms.js` and is separate from the UI.

- **Pathfinding:** `pathfind(grid, start, end, algo)` returns the order cells were visited plus the final path. The UI replays that list as an animation. BFS uses a queue, DFS a stack, and Dijkstra/A* pick the open node with the lowest `dist` (plus a Manhattan-distance heuristic for A*).
- **Sorting:** each sort is a JavaScript generator that mutates the array and `yield`s the indices it touches, so the UI can advance one step per tick.

| Algorithm | Time (typical) | Space | Notes |
|---|---|---|---|
| BFS | O(V + E) | O(V) | Shortest path when all costs are equal |
| DFS | O(V + E) | O(V) | Does not find shortest paths |
| Dijkstra | O(V²) here (linear scan for min) | O(V) | Optimal with non-negative weights |
| A* | O(V²) here | O(V) | Optimal with an admissible heuristic |
| Quick sort | O(n log n) avg | O(log n) | O(n²) worst case |
| Merge sort | O(n log n) | O(n) | Stable |
| Insertion / selection / bubble | O(n²) | O(1) | Simple, slow on large inputs |

The open list is a plain array to keep the code readable. Swapping in a binary heap would bring Dijkstra and A* to O((V + E) log V).

## Deploy to GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

## Ideas for next steps

Maze generation (recursive backtracker), diagonal movement, bidirectional search, heap sort, and a speed slider.

## License

MIT
