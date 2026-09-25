import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { canPerformInClub, isCesaAdmin } from '@/lib/permissions';

interface ProtectedRouteProps {
  /** If provided, the user must hold this permission, scoped to clubId. */
  requiredPermission?: string;
  /** Required when requiredPermission is club-scoped. */
  clubId?: string;
  /** Use instead of requiredPermission/clubId for routes only CESA admins can see. */
  requireCesaAdmin?: boolean;
  /** If true, guest users cannot access this route. */
  disallowGuest?: boolean;
}

export function ProtectedRoute({
  requiredPermission,
  clubId,
  requireCesaAdmin,
  disallowGuest,
}: ProtectedRouteProps) {
  const { isAuthenticated, isGuest, auth, _hasHydrated } = useAuthStore();
  const location = useLocation();

  // Wait for Zustand to rehydrate from localStorage before making routing decisions.
  // Without this, a page refresh would briefly see isAuthenticated=false and
  // redirect the user to /login even though they are logged in.
  if (!_hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (disallowGuest && isGuest) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireCesaAdmin && (!auth || !isCesaAdmin(auth) || isGuest)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && clubId) {
    const allowed = !isGuest && canPerformInClub(auth, clubId, requiredPermission);
    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}

