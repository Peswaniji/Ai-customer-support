import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, logout, refreshSession, registerBusiness, setError } from "../store/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const login = useCallback((credentials) => dispatch(loginUser(credentials)).unwrap(), [dispatch]);
  const register = useCallback((payload) => dispatch(registerBusiness(payload)).unwrap(), [dispatch]);
  const refresh = useCallback(() => dispatch(refreshSession()).unwrap(), [dispatch]);
  const signOut = useCallback(() => dispatch(logout()).unwrap(), [dispatch]);
  const clearError = useCallback((message) => dispatch(setError(message)), [dispatch]);

  return {
    ...auth,
    login,
    registerBusiness: register,
    refreshSession: refresh,
    logout: signOut,
    setError: clearError,
  };
};
