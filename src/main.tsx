import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {apiUrl} from './lib/api';

// Centralize backend routing so the same React code works in the hosted web
// app and inside the Android WebView. A build can set VITE_API_BASE_URL, and
// Android can override it later with the stored backend URL.
const nativeFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    return nativeFetch(apiUrl(input), init);
  }
  if (input instanceof URL && input.pathname.startsWith('/api/')) {
    return nativeFetch(apiUrl(`${input.pathname}${input.search}`), init);
  }
  if (input instanceof Request && new URL(input.url).pathname.startsWith('/api/')) {
    const url = apiUrl(`${new URL(input.url).pathname}${new URL(input.url).search}`);
    return nativeFetch(url, input);
  }
  return nativeFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
