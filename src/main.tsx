import React from 'react';
import ReactDOM from 'react-dom/client';
import App, { App as AppComponent } from './App';
import './index.css';

// Try to use the default export, but fall back to the named export if needed
const AppToRender = App || AppComponent;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppToRender />
  </React.StrictMode>,
);
