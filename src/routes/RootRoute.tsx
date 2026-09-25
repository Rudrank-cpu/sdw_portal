import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { HomePage } from "@/pages/HomePage";

export function RootRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />;
}
