import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { HashRouter } from 'react-router';

import './index.css'
import App from './App.tsx'

window.addEventListener("error", (event) => {
  window.kazari?.logger?.error?.(
    "Global error",
    event.error || event.message,
    event
  );
});

window.addEventListener("unhandledrejection", (event) => {
  window.kazari?.logger?.error?.(
    "Unhandled promise rejection",
    event.reason,
    event
  );
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>
)
