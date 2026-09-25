import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Redux Provider — makes the store available to every component */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
