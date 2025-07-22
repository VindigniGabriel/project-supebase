export interface Task {
  id?: string;
  title: string;
  description?: string;
  is_completed: boolean;
  user_id: string;
  created_at?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
}
