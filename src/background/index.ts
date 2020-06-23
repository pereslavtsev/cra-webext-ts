import { wrapStore } from 'webext-redux';
import {
  combineReducers,
  applyMiddleware,
  createStore,
} from '@reduxjs/toolkit';
import logger from 'redux-logger';
import counterReducer from '../popup/features/counter/counterSlice';
import { composeWithDevTools } from 'redux-devtools-extension';

const reducer = combineReducers({
  counter: counterReducer,
});

const middleware = [logger];
const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(...middleware))
);

wrapStore(store);
