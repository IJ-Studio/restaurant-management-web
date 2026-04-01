import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, SessionUser } from "@/types/auth";

const initialState: AuthState = {
  user:    null,
  loading: false,
  error:   null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionUser | null>) {
      state.user    = action.payload;
      state.loading = false;
      state.error   = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error   = action.payload;
      state.loading = false;
    },
    clearAuth(state) {
      state.user    = null;
      state.loading = false;
      state.error   = null;
    },
  },
});

export const { setUser, setLoading, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
