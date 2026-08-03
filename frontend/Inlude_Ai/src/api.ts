import apiClient from "./api/client";
import type { Task, Subtask, Reward } from "./types";

// Raw shapes returned by the DRF serializers, before we reshape them for the UI
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