import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { BrandProvider } from './contexts/BrandContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BrandProvider>
        <App />
      </BrandProvider>
    </BrowserRouter>
  </StrictMode>
);
