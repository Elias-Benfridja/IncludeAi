import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/layout/PrivateRoute";
import NotificationCenter from "./components/matching/Notificationcenter";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import NewTaskPage from "./pages/NewTaskPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import RewardsPage from "./pages/RewardsPage";
import RewardFormPage from "./pages/RewardFormPage";
import SimilarTasksPage from "./pages/SimilarTasksPage";
import ChatPage from "./pages/ChatPage";
import ActiveChatsPage from "./pages/Activechatspage";

export default function App() {
  return (
    <BrowserRouter>
      <NotificationCenter />
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
        <Route
          path="/tasks/:id/similar"
          element={
            <PrivateRoute>
              <SimilarTasksPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <PrivateRoute>
              <ActiveChatsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}