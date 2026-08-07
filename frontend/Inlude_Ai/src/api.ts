import apiClient from "./api/client";
import type { Task, Subtask, Reward, TaskMatch, ChatSession, ChatMessage } from "./types";


interface RawSubtask {
  id: number;
  description: string;
  points: number;
  completed: boolean;
  expandable: boolean;
}

interface RawTask {
  id: number;
  description: string;
  subtask_set: RawSubtask[];
  timer_started_at: string | null;
  timer_elapsed_seconds: number;
  timer_stopped: boolean;
}

interface RawReward {
  id: number;
  name: string;
  price: number;
}

function mapSubtask(s: RawSubtask): Subtask {
  return {
    id: s.id,
    description: s.description,
    points: s.points,
    completed: s.completed,
    expandable: s.expandable,
  };
}

function mapTask(t: RawTask): Task {
  const subtasks = (t.subtask_set || []).map(mapSubtask);
  return {
    id: t.id,
    description: t.description,
    subtasks,
    completedCount: subtasks.filter((s) => s.completed).length,
    totalCount: subtasks.length,
    timer_started_at: t.timer_started_at,
    timer_elapsed_seconds: t.timer_elapsed_seconds,
    timer_stopped: t.timer_stopped,
  };
}

// --- Tasks ---
export async function getTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<RawTask[]>("/tasks/");
  return data.map(mapTask);
}

export async function getTask(id: number | string): Promise<Task> {
  const { data } = await apiClient.get<RawTask>(`/tasks/${id}/`);
  return mapTask(data);
}

export async function createTask(description: string): Promise<Task> {
  const { data } = await apiClient.post<RawTask>("/tasks/", { description });
  return mapTask(data);
}

export async function deleteTask(id: number | string): Promise<void> {
  await apiClient.delete(`/tasks/${id}/`);
}

// --- Timer ---
export async function startTimer(taskId: number): Promise<Task> {
  const { data } = await apiClient.post<RawTask>(`/tasks/${taskId}/timer/start/`);
  return mapTask(data);
}

export async function pauseTimer(taskId: number): Promise<Task> {
  const { data } = await apiClient.post<RawTask>(`/tasks/${taskId}/timer/pause/`);
  return mapTask(data);
}

export async function stopTimer(taskId: number): Promise<Task> {
  const { data } = await apiClient.post<RawTask>(`/tasks/${taskId}/timer/stop/`);
  return mapTask(data);
}

// --- Subtasks ---
interface CompleteSubtaskResponse {
  subtask: RawSubtask;
  points_balance: number;
}

export async function completeSubtask(id: number): Promise<CompleteSubtaskResponse> {
  const { data } = await apiClient.post<CompleteSubtaskResponse>(`/subtasks/${id}/complete/`);
  return data;
}

export async function expandSubtask(id: number): Promise<Task> {
  const { data } = await apiClient.post<RawTask>(`/subtasks/${id}/expand/`);
  return mapTask(data);
}

// --- Rewards ---
export async function getRewards(): Promise<Reward[]> {
  const { data } = await apiClient.get<RawReward[]>("/rewards/");
  return data.map((r) => ({ id: r.id, name: r.name, price: r.price }));
}

export async function createReward(reward: { name: string; price: number }): Promise<Reward> {
  const { data } = await apiClient.post<RawReward>("/rewards/", reward);
  return data;
}

export async function deleteReward(id: number): Promise<void> {
  await apiClient.delete(`/rewards/${id}/`);
}

export async function recommendRewardPoints(name: string): Promise<number> {
  const { data } = await apiClient.post<{ points: number }>("/rewards/recommend-points/", { name });
  return data.points;
}

interface RedeemResponse {
  balance: number;
}

export async function redeemReward(id: number): Promise<RedeemResponse> {
  const { data } = await apiClient.post<RedeemResponse>(`/rewards/${id}/redeem/`);
  return data;
}

// --- Points ---
export async function getPointsBalance(): Promise<number> {
  const { data } = await apiClient.get<{ balance: number }>("/rewards/points/balance/");
  return data.balance;
}

// --- Matching ---
export async function getSimilarTasks(taskId: number): Promise<TaskMatch[]> {
  const { data } = await apiClient.get<TaskMatch[]>(`/matching/tasks/${taskId}/similar/`);
  return data;
}

export async function createChatSession(
  otherUserId: number,
  myTaskId: number,
  otherTaskId: number
): Promise<ChatSession> {
  const { data } = await apiClient.post<ChatSession>("/matching/", {
    other_user_id: otherUserId,
    my_task_id: myTaskId,
    other_task_id: otherTaskId,
  });
  return data;
}

export async function getChatMessages(sessionId: number): Promise<ChatMessage[]> {
  const { data } = await apiClient.get<ChatMessage[]>(`/matching/sessions/${sessionId}/messages/`);
  return data;
}

export async function sendChatMessage(sessionId: number, content: string): Promise<ChatMessage> {
  const { data } = await apiClient.post<ChatMessage>(`/matching/sessions/${sessionId}/messages/`, {
    content,
  });
  return data;
}

export async function getChatSession(sessionId: number): Promise<ChatSession> {
  const { data } = await apiClient.get<ChatSession>(`/matching/sessions/${sessionId}/`);
  return data;
}

// All active (non-expired) chats for the current user — powers the Active Chats page.
export async function getChatSessions(): Promise<ChatSession[]> {
  const { data } = await apiClient.get<ChatSession[]>("/matching/sessions/");
  return data;
}


export async function getChatNotifications(): Promise<ChatSession[]> {
  const { data } = await apiClient.get<ChatSession[]>("/matching/notifications/");
  return data;
}

export async function blockUser(userId: number): Promise<void> {
  await apiClient.post("/matching/block/", { user_id: userId });
}


export async function getMatchingPreference(): Promise<boolean> {
  const { data } = await apiClient.get<{ matching_enabled: boolean }>("/users/matching-preference/");
  return data.matching_enabled;
}

export async function setMatchingPreference(enabled: boolean): Promise<boolean> {
  const { data } = await apiClient.patch<{ matching_enabled: boolean }>(
    "/users/matching-preference/",
    { matching_enabled: enabled }
  );
  return data.matching_enabled;
}