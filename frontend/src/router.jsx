import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const BusinessesPage = lazy(() => import("./pages/BusinessesPage"));
const SprintsPage = lazy(() => import("./pages/SprintsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const suspense = (element) => <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [{ index: true, element: suspense(<LandingPage />) }]
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: suspense(<LoginPage />) },
      { path: "register", element: suspense(<RegisterPage />) }
    ]
  },
  {
    path: "/workspace",
    element: <ProtectedRoute>{<DashboardLayout />}</ProtectedRoute>,
    children: [
      { index: true, element: suspense(<DashboardPage />) },
      { path: "tasks", element: suspense(<TasksPage />) },
      { path: "businesses", element: suspense(<BusinessesPage />) },
      { path: "sprints", element: suspense(<SprintsPage />) },
      { path: "users", element: suspense(<UsersPage />) },
      { path: "profile", element: suspense(<ProfilePage />) },
      { path: "settings", element: suspense(<SettingsPage />) }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);

export default router;
