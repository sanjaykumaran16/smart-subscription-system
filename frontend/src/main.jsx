import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1a2235',
          color: '#e2e8f0',
          border: '1px solid #243047',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#22d3ee', secondary: '#0a0f1e' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#0a0f1e' },
        },
      }}
    />
  </React.StrictMode>
);
