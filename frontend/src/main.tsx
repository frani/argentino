import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { MCPProvider } from './contexts/MCPContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MCPProvider>
      <App />
    </MCPProvider>
  </React.StrictMode>
);
