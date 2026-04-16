import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';

if (import.meta.env.DEV) {
  const originalInfo = console.info.bind(console);
  console.info = (...args) => {
    const firstArg = args[0];
    if (typeof firstArg === 'string' && firstArg.includes('Download the React DevTools for a better development experience')) {
      return;
    }
    originalInfo(...args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
