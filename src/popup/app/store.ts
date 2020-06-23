import {
  ThunkAction,
  Action,
  combineReducers,
  createStore,
  applyMiddleware,
} from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';

const reducer = combineReducers({
  counter: counterReducer,
});

const middleware = [logger];
export const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(...middleware))
);

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
