import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage, UnauthorizedPage } from '@/pages/StatusPages';
import { RootRoute } from '@/routes/RootRoute';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';

import { ClubListPage } from '@/features/clubs/pages/ClubListPage';
import { ClubDetailPage } from '@/features/clubs/pages/ClubDetailPage';

import { EventListPage } from '@/features/events/pages/EventListPage';
import { EventDetailPage } from '@/features/events/pages/EventDetailPage';

import { AchievementsPage } from '@/features/achievements/pages/AchievementsPage';
import { LeaderboardPage } from '@/features/leaderboard/pages/LeaderboardPage';
import { MembersPage } from '@/features/members/pages/MembersPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { AuditLogsPage } from '@/features/audit-logs/pages/AuditLogsPage';
import { AdminPortalPage } from '@/pages/AdminPortalPage';

// -----------------------------------------------------------------------
// NOTE FOR THE TEAM:
// This is the ONLY file where new pages get registered as routes.
// When you build your module's pages, add them here inside a small PR
// hunk — this keeps merge conflicts to a few lines instead of whole files.
// -----------------------------------------------------------------------

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Unauthenticated auth & status routes (no navbar rendered)
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },

      // Root entry point: opens login if not authenticated; opens home if logged in/guest
      { index: true, element: <RootRoute /> },

      // Portal routes accessible after login or in guest mode
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'clubs', element: <ClubListPage /> },
          { path: 'clubs/:clubId', element: <ClubDetailPage /> },
          { path: 'events', element: <EventListPage /> },
          { path: 'events/:eventId', element: <EventDetailPage /> },
          { path: 'leaderboard', element: <LeaderboardPage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'achievements', element: <AchievementsPage /> },
          { path: 'admin', element: <AdminPortalPage /> },
        ],
      },

      // Registered student only routes (guests redirected to login)
      {
        element: <ProtectedRoute disallowGuest />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'members', element: <MembersPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },

      // CESA-admin-only routes (permission-gated)
      {
        element: <ProtectedRoute requireCesaAdmin />,
        children: [{ path: 'audit-logs', element: <AuditLogsPage /> }],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
