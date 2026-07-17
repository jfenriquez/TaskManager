import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TaskTimeState {
  totalMinutes: number;
}

const initialState: TaskTimeState = {
  totalMinutes: 0,
};

const taskTimeSlice = createSlice({
  name: "taskTime",
  initialState,
  reducers: {
    setTotalMinutes(state, action: PayloadAction<number>) {
      state.totalMinutes = action.payload;
    },
  },
});

export const { setTotalMinutes } = taskTimeSlice.actions;
export default taskTimeSlice.reducer;
