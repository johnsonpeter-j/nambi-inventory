import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  loginUser,
  registerUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  validateToken,
  registerWithToken,
  verifyAuthToken,
  clearError,
  setCredentials,
} from "@/store/slices/authSlice";

// Import User type from authSlice to ensure consistency
type User = {
  id: string;
  email: string;
  name: string;
  profilePic?: string;
  role?: string;
  roleDetails?: {
    id: string;
    name: string;
    permissions: any;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, isAuthenticated, error } = useAppSelector(
    (state) => state.auth
  );

  const login = async (email: string, password: string) => {
    return dispatch(loginUser({ email, password }));
  };

  const register = async (email: string, password: string, name: string) => {
    return dispatch(registerUser({ email, password, name }));
  };

  const logout = async () => {
    return dispatch(logoutUser());
  };

  const requestPasswordReset = async (email: string) => {
    return dispatch(forgotPassword(email));
  };

  const resetPasswordWithToken = async (
    token: string,
    password: string,
    confirmPassword: string
  ) => {
    return dispatch(resetPassword({ token, password, confirmPassword }));
  };

  const validateTokenForAuth = async (token: string) => {
    return dispatch(validateToken(token));
  };

  const registerUsingToken = async (
    token: string,
    password: string,
    name: string,
    profilePic?: File
  ) => {
    return dispatch(registerWithToken({ token, password, name, profilePic }));
  };

  const verifyToken = async () => {
    return dispatch(verifyAuthToken());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const updateCredentials = (token: string, user: User) => {
    dispatch(setCredentials({ token, user }));
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPasswordWithToken,
    validateTokenForAuth,
    registerUsingToken,
    verifyToken,
    clearError: clearAuthError,
    updateCredentials,
  };
};

