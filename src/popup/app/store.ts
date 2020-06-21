import {
  configureStore,
  getDefaultMiddleware,
  ThunkAction,
  Action,
} from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
const middleware = [...getDefaultMiddleware()];

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  middleware,
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
