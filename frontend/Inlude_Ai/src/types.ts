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
}

export interface Reward {
  id: number;
  name: string;
  price: number;
}