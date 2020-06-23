import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from '../../serviceWorker';
import CounterApp from './CounterApp';

const rootEl = document.createElement('div');
rootEl.id = 'react-chrome-ext';
document.body.appendChild(rootEl);

ReactDOM.render(
  <React.StrictMode>
    <CounterApp />
  </React.StrictMode>,
  document.getElementById('react-chrome-ext')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
