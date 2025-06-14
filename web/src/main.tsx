import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './global.css';
import { ControlPlaneProvider } from './controlPlane';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ControlPlaneProvider>
        <App />
      </ControlPlaneProvider>
    </BrowserRouter>
  </React.StrictMode>
);
