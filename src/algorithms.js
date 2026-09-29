// ---------- Pathfinding ----------
// grid[r][c] = { wall: boolean, weight: number >= 1 }
// Returns { visited: [[r,c],...] in visit order, path: [[r,c],...] start -> end (empty if none) }
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

export const PATH_ALGOS = {
  astar: 'A*',
  dijkstra: "Dijkstra's",
  bfs: 'Breadth-first search',
  dfs: 'Depth-first search',
};

export function pathfind(grid, start, end, algo) {
  const R = grid.length, C = grid[0].length;
  const key = (r, c) => r * C + c;
  const h = (r, c) => Math.abs(r - end[0]) + Math.abs(c - end[1]); // admissible: min weight is 1
  const dist = new Map([[key(...start), 0]]);
  const prev = new Map();
  const closed = new Set();
  const found = new Set([key(...start)]); // BFS/DFS discovery set
  const visited = [];
  const open = [start];
  const weighted = algo === 'astar' || algo === 'dijkstra';
  const f = ([r, c]) => dist.get(key(r, c)) + (algo === 'astar' ? h(r, c) : 0);

  const rebuild = () => {
    const path = [];
    for (let k = key(...end); k !== undefined; k = prev.get(k)) path.push([Math.floor(k / C), k % C]);
    return path.reverse();
  };

  while (open.length) {
    let i = 0;
    if (algo === 'dfs') i = open.length - 1;                    // stack
    else if (weighted) for (let j = 1; j < open.length; j++) if (f(open[j]) < f(open[i])) i = j;
    const [r, c] = open.splice(i, 1)[0];                        // bfs: i = 0 (queue)
    const k = key(r, c);
    if (closed.has(k)) continue;
    closed.add(k);
    visited.push([r, c]);
    if (r === end[0] && c === end[1]) return { visited, path: rebuild() };

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || grid[nr][nc].wall) continue;
      const nk = key(nr, nc);
      if (weighted) {
        const nd = dist.get(k) + grid[nr][nc].weight;
        if (nd < (dist.get(nk) ?? Infinity)) { dist.set(nk, nd); prev.set(nk, k); open.push([nr, nc]); }
      } else if (!found.has(nk)) {
        found.add(nk); prev.set(nk, k); open.push([nr, nc]);
      }
    }
  }
  return { visited, path: [] };
}

// ---------- Sorting ----------
// Each sort is a generator that mutates the array in place and yields the indices it is touching.
export function* bubble(a) {
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a.length - i - 1; j++) {
      yield [j, j + 1];
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; yield [j, j + 1]; }
    }
}

export function* selection(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) { yield [m, j]; if (a[j] < a[m]) m = j; }
    if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; yield [i, m]; }
  }
}

export function* insertion(a) {
  for (let i = 1; i < a.length; i++)
    for (let j = i; j > 0 && a[j - 1] > a[j]; j--) {
      yield [j - 1, j];
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      yield [j - 1, j];
    }
}

function* mergeRec(a, l, r) {
  if (r <= l) return;
  const m = (l + r) >> 1;
  yield* mergeRec(a, l, m);
  yield* mergeRec(a, m + 1, r);
  const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;
  while (i < L.length && j < R.length) { a[k] = L[i] <= R[j] ? L[i++] : R[j++]; yield [k++]; }
  while (i < L.length) { a[k] = L[i++]; yield [k++]; }
  while (j < R.length) { a[k] = R[j++]; yield [k++]; }
}
export const merge = (a) => mergeRec(a, 0, a.length - 1);

function* quickRec(a, lo, hi) {
  if (lo >= hi) return;
  const p = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    yield [j, hi];
    if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; yield [i, j]; i++; }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  yield [i, hi];
  yield* quickRec(a, lo, i - 1);
  yield* quickRec(a, i + 1, hi);
}
export const quick = (a) => quickRec(a, 0, a.length - 1);

export const SORT_ALGOS = {
  quick: { name: 'Quick sort', fn: quick },
  merge: { name: 'Merge sort', fn: merge },
  insertion: { name: 'Insertion sort', fn: insertion },
  selection: { name: 'Selection sort', fn: selection },
  bubble: { name: 'Bubble sort', fn: bubble },
};
