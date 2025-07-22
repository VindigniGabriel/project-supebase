import { supabase } from '../supabaseClient';
import { Task, TaskFormData } from '../models/Task';

// Nombre de la tabla en Supabase
const TASKS_TABLE = 'tasks';

// Obtener todas las tareas del usuario actual
export async function getTasks(): Promise<Task[]> {
  const user = supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error al obtener las tareas:', error);
    throw error;
  }
  
  return data || [];
}

// Crear una nueva tarea
export async function createTask(taskData: TaskFormData): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Usuario no autenticado');
  
  const newTask: Task = {
    ...taskData,
    is_completed: false,
    user_id: user.id
  };
  
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .insert(newTask)
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear la tarea:', error);
    throw error;
  }
  
  return data;
}

// Actualizar una tarea existente
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar la tarea:', error);
    throw error;
  }
  
  return data;
}

// Eliminar una tarea
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from(TASKS_TABLE)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar la tarea:', error);
    throw error;
  }
}

// Marcar una tarea como completada o no completada
export async function toggleTaskCompletion(id: string, isCompleted: boolean): Promise<Task> {
  return updateTask(id, { is_completed: isCompleted });
}
