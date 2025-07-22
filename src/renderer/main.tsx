import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './application/store';
import { App } from './presentation/components/App';
import './styles/index.css';

/**
 * Main entry point for the renderer process
 */
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
