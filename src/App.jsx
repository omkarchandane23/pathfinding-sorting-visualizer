import { useState } from 'react';
import Pathfinding from './Pathfinding.jsx';
import Sorting from './Sorting.jsx';

export default function App() {
  const [tab, setTab] = useState('path');
  return (
    <main>
      <h1>Pathfinding &amp; Sorting Visualizer</h1>
      <nav role="tablist">
        <button role="tab" aria-selected={tab === 'path'} onClick={() => setTab('path')}>Pathfinding</button>
        <button role="tab" aria-selected={tab === 'sort'} onClick={() => setTab('sort')}>Sorting</button>
      </nav>
      {tab === 'path' ? <Pathfinding /> : <Sorting />}
    </main>
  );
}
