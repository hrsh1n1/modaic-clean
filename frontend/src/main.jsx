import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            border: '3px solid #f9a8d4',
            boxShadow: '4px 4px 0px #ec4899',
            borderRadius: 0,
          },
          success: { iconTheme: { primary: '#ec4899', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
