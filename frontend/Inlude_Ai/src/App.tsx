import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/layout/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import NewTaskPage from "./pages/NewTaskPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import RewardsPage from "./pages/RewardsPage";
import RewardFormPage from "./pages/RewardFormPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <PrivateRoute>
              <NewTaskPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <PrivateRoute>
              <TaskDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <PrivateRoute>
              <RewardsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/rewards/new"
          element={
            <PrivateRoute>
              <RewardFormPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
