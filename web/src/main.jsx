import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { getJSCroot } from './services/jscroot';

// Eager load JSCroot on application initialization
getJSCroot().catch(console.warn);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
