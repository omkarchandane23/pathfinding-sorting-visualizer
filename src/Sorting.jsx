import { useEffect, useRef, useState } from 'react';
import { SORT_ALGOS } from './algorithms.js';

const randomArray = (n) => Array.from({ length: n }, () => 5 + Math.floor(Math.random() * 95));

export default function Sorting() {
  const [size, setSize] = useState(60);
  const [arr, setArr] = useState(() => randomArray(60));
  const [hot, setHot] = useState([]);
  const [algo, setAlgo] = useState('quick');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const shuffle = (n = size) => { clearInterval(timer.current); setRunning(false); setHot([]); setSteps(0); setArr(randomArray(n)); };

  const run = () => {
    const a = [...arr];
    const gen = SORT_ALGOS[algo].fn(a);
    let count = 0;
    setRunning(true);
    setSteps(0);
    timer.current = setInterval(() => {
      const next = gen.next();
      if (next.done) { clearInterval(timer.current); setHot([]); setArr([...a]); setRunning(false); return; }
      setHot(next.value);
      setSteps(++count);
      setArr([...a]);
    }, 12);
  };

  return (
    <section>
      <div className="controls">
        <label>Algorithm
          <select value={algo} onChange={(e) => setAlgo(e.target.value)} disabled={running}>
            {Object.entries(SORT_ALGOS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </label>
        <label>Size {size}
          <input type="range" min="10" max="120" value={size} disabled={running}
            onChange={(e) => { setSize(+e.target.value); shuffle(+e.target.value); }} />
        </label>
        <button className="primary" onClick={run} disabled={running}>Sort</button>
        <button onClick={() => shuffle()} disabled={running}>Shuffle</button>
      </div>
      <div className="bars" aria-label="Array being sorted">
        {arr.map((v, i) => <div key={i} className={hot.includes(i) ? 'bar hot' : 'bar'} style={{ height: `${v}%` }} />)}
      </div>
      <p className="info" role="status">{SORT_ALGOS[algo].name}: {steps} steps</p>
    </section>
  );
}
