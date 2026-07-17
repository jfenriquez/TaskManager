import { configureStore } from "@reduxjs/toolkit";
import taskTimeReducer from "./taskTimeSlice";

export const store = configureStore({
  reducer: {
    taskTime: taskTimeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
