import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { useStore } from './store';
import { connectViewRouting } from './lib/viewRouting';
import './index.css';

// Initialize before the first render, outside StrictMode's effect replay.
const disconnectRouting = connectViewRouting(useStore, window);
if (import.meta.hot) import.meta.hot.dispose(disconnectRouting);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
