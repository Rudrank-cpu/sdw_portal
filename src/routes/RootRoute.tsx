import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { HomePage } from "@/pages/HomePage";

export function RootRoute() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // Wait for Zustand to rehydrate from localStorage before deciding where to send the user.
  if (!_hasHydrated) {
    return null;
  }

  return isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />;
}
