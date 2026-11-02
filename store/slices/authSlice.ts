import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, SessionUser } from "@/types/auth";
import { pedirSesion } from "@/lib/sesion/sesion-cliente";

const initialState: AuthState = {
  user:    null,
  loading: false,
  error:   null,
};

export const hydrateSession = createAsyncThunk(
  "auth/hydrateSession",
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const res = await pedirSesion();
      if (!res.ok) {
        throw new Error("No hay sesión activa");
      }
      const data = await res.json();
      if (data.user) {
        dispatch(setUser(data.user));
        return data.user;
      }
      dispatch(setUser(null));
      return null;
    } catch (err: any) {
      dispatch(setUser(null));
      // No seteamos error en UI para no mostrar alert en páginas públicas
      dispatch(setLoading(false));
      return null;
    }
  }
);

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
    /** Cierre de sesión (PLAN 2.14): el reductor raíz (store/index.ts) reinicia todo el store. */
    sesionCerrada() {
      return initialState;
    },
  },
});

export const { setUser, setLoading, setError, clearAuth, sesionCerrada } = authSlice.actions;
export { initialState as estadoInicialAuth };
export default authSlice.reducer;

