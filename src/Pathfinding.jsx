import { useEffect, useRef, useState } from 'react';
import { pathfind, PATH_ALGOS } from './algorithms.js';

const ROWS = 25, COLS = 50, CELL = 20;
const HINT = 'Drag to draw walls (drag over a wall to erase). Hold Shift to paint weighted cells (cost 5). Drag the green and red markers to move them.';
const blank = () => Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ wall: false, weight: 1 })));

export default function Pathfinding() {
  const canvasRef = useRef(null);
  const s = useRef({ grid: blank(), start: [12, 8], end: [12, 41], visited: new Set(), path: new Set(), drag: null, mode: null, timer: null });
  const [algo, setAlgo] = useState('astar');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState(HINT);

  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    const { grid, start, end, visited, path } = s.current;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c], k = r * COLS + c;
        ctx.fillStyle = cell.wall ? '#1b2a41' : path.has(k) ? '#f4b942' : visited.has(k) ? '#7cc6d9' : cell.weight > 1 ? '#c9b8f0' : '#f6f4ee';
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        ctx.strokeStyle = '#dcd8cc';
        ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL, CELL);
      }
    const marker = ([r, c], color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
    };
    marker(start, '#2a9d5c');
    marker(end, '#d1495b');
  };

  useEffect(() => { draw(); return () => clearTimeout(s.current.timer); }, []);

  const clearPath = () => {
    clearTimeout(s.current.timer);
    s.current.visited = new Set();
    s.current.path = new Set();
    setBusy(false);
    draw();
  };

  const cellAt = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clamp = (v, max) => Math.max(0, Math.min(max - 1, v));
    return [clamp(Math.floor(((e.clientY - rect.top) / rect.height) * ROWS), ROWS), clamp(Math.floor(((e.clientX - rect.left) / rect.width) * COLS), COLS)];
  };

  const apply = (r, c) => {
    const st = s.current, cell = st.grid[r][c];
    const isStart = st.start[0] === r && st.start[1] === c, isEnd = st.end[0] === r && st.end[1] === c;
    if (st.drag === 'start' && !cell.wall && !isEnd) st.start = [r, c];
    else if (st.drag === 'end' && !cell.wall && !isStart) st.end = [r, c];
    else if (st.drag === 'paint' && !isStart && !isEnd) {
      if (st.mode === 'erase') { cell.wall = false; cell.weight = 1; }
      else if (st.mode === 'weight') { cell.wall = false; cell.weight = 5; }
      else { cell.wall = true; cell.weight = 1; }
    }
    draw();
  };

  const onDown = (e) => {
    if (busy) return;
    const [r, c] = cellAt(e), st = s.current, cell = st.grid[r][c];
    clearPath();
    st.drag = st.start[0] === r && st.start[1] === c ? 'start' : st.end[0] === r && st.end[1] === c ? 'end' : 'paint';
    st.mode = e.shiftKey ? 'weight' : cell.wall || cell.weight > 1 ? 'erase' : 'wall';
    apply(r, c);
  };
  const onMove = (e) => { if (s.current.drag) apply(...cellAt(e)); };
  const onUp = () => { s.current.drag = null; };

  const run = () => {
    clearPath();
    const st = s.current;
    const res = pathfind(st.grid, st.start, st.end, algo);
    setBusy(true);
    let i = 0, j = 0;
    const finish = () => {
      setBusy(false);
      if (!res.path.length) return setInfo(`${PATH_ALGOS[algo]}: no path found (explored ${res.visited.length} cells).`);
      const cost = res.path.slice(1).reduce((sum, [r, c]) => sum + st.grid[r][c].weight, 0);
      setInfo(`${PATH_ALGOS[algo]}: explored ${res.visited.length} cells, path length ${res.path.length - 1}, total cost ${cost}.`);
    };
    const animatePath = () => {
      if (j >= res.path.length) return finish();
      const [r, c] = res.path[j++];
      st.path.add(r * COLS + c);
      draw();
      st.timer = setTimeout(animatePath, 25);
    };
    const animateVisited = () => {
      for (let n = 0; n < 3 && i < res.visited.length; n++) { const [r, c] = res.visited[i++]; st.visited.add(r * COLS + c); }
      draw();
      st.timer = setTimeout(i < res.visited.length ? animateVisited : animatePath, 10);
    };
    animateVisited();
  };

  const randomWalls = () => {
    clearPath();
    const st = s.current;
    st.grid = blank();
    st.grid.forEach((row, r) => row.forEach((cell, c) => {
      const special = (r === st.start[0] && c === st.start[1]) || (r === st.end[0] && c === st.end[1]);
      cell.wall = !special && Math.random() < 0.28;
    }));
    draw();
  };
  const reset = () => { clearPath(); s.current.grid = blank(); setInfo(HINT); draw(); };

  return (
    <section>
      <div className="controls">
        <label>Algorithm
          <select value={algo} onChange={(e) => setAlgo(e.target.value)} disabled={busy}>
            {Object.entries(PATH_ALGOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <button className="primary" onClick={run} disabled={busy}>Visualize</button>
        <button onClick={clearPath}>Clear path</button>
        <button onClick={randomWalls} disabled={busy}>Random walls</button>
        <button onClick={reset} disabled={busy}>Reset grid</button>
      </div>
      <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="grid"
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} />
      <p className="info" role="status">{info}</p>
      <p className="note">BFS and DFS ignore weights. Only Dijkstra and A* are guaranteed to find the cheapest path.</p>
    </section>
  );
}
