import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// To enable Sentry error tracking in the frontend:
// 1. Install: npm install @sentry/react
// 2. Add VITE_SENTRY_DSN to your .env file
// 3. Uncomment the import and init block below:
//
// import * as Sentry from "@sentry/react";
// Sentry.init({
//   dsn: import.meta.env.VITE_SENTRY_DSN,
//   environment: import.meta.env.MODE,
//   tracesSampleRate: 0.1,
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
