import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppFeedbackProvider } from './components/ui/AppFeedbackProvider.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppFeedbackProvider>
      <App />
    </AppFeedbackProvider>
  </React.StrictMode>
);
