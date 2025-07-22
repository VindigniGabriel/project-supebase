import { supabase } from '../supabaseClient';
import type { Task, TaskFormData } from '../models/Task';
import { RealtimeChannel } from '@supabase/supabase-js';

const TASKS_TABLE = 'tasks';

// Tipo para el callback de eventos en tiempo real
type TaskRealtimeCallback = (payload: { new: Task | null, old: Task | null, eventType: 'INSERT' | 'UPDATE' | 'DELETE' }) => void;

// Obtener todas las tareas del usuario actual
export async function getTasks(): Promise<Task[]> {
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

// Suscribirse a cambios en tiempo real de las tareas
export async function subscribeToTasks(callback: TaskRealtimeCallback): Promise<RealtimeChannel> {
  // Crear y configurar el canal con un nombre único basado en timestamp
  const channelName = `tasks-changes-${Date.now()}`;
  console.log(`Creating realtime channel: ${channelName}`);
  
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', 
      { 
        event: '*', // Escuchar todos los eventos
        schema: 'public',
        table: TASKS_TABLE
        // No usamos filtro por ahora para simplificar
      }, 
      (payload) => {
        console.log('Realtime event received:', payload);
        const eventData = {
          new: payload.new as Task | null,
          old: payload.old as Task | null,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
        };
        callback(eventData);
      }
    );

  // Iniciar la suscripción y devolver el canal
  console.log('Subscribing to tasks changes...');
  const status = await channel.subscribe();
  console.log('Subscription status:', status);

  return channel;
}

// Cancelar suscripción a cambios en tiempo real
export function unsubscribeFromTasks(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
