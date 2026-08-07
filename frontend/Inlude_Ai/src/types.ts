export interface Subtask {
  id: number;
  description: string;
  points: number;
  completed: boolean;
  expandable: boolean;
}

export interface Task {
  id: number;
  description: string;
  subtasks: Subtask[];
  completedCount?: number;
  totalCount?: number;
  timer_started_at: string | null;
  timer_elapsed_seconds: number;
  timer_stopped: boolean;
}

export interface Reward {
  id: number;
  name: string;
  price: number;
}

export interface TaskMatch {
  task_id: number;
  user_id: number;
  username: string;
  description: string;
  score: number;
}

export interface OtherUser {
  id: number;
  username: string;
}

export interface ChatSession {
  id: number;
  other_user: OtherUser;
  last_activity_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session: number;
  sender: number;
  sender_username: string;
  content: string;
  created_at: string;
}