import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Checkbox,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  ListItemIcon
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Task } from '../models/Task';
import { getTasks, deleteTask, toggleTaskCompletion, subscribeToTasks, unsubscribeFromTasks } from '../services/taskService';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TaskListProps {
  onEditTask: (task: Task) => void;
  refreshTrigger: number;
}

export default function TaskList({ onEditTask, refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'warning' | 'error'} | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    loadTasks();
    
    // Configurar la suscripción en tiempo real
    const setupRealtimeSubscription = async () => {
      try {
        channelRef.current = await subscribeToTasks((payload) => {
          console.log('Callback received payload:', payload);
          // Manejar eventos en tiempo real
          if (payload.eventType === 'INSERT') {
            if (payload.new) {
              // Verificar si la tarea ya existe antes de añadirla
              setTasks(currentTasks => {
                // Si la tarea ya existe en el array, no la añadimos de nuevo
                const taskExists = currentTasks.some(task => task.id === payload.new!.id);
                if (taskExists) {
                  console.log(`Task ${payload.new!.id} already exists, skipping insert`);
                  return currentTasks;
                }
                console.log(`Adding new task ${payload.new!.id} to list`);
                setNotification({
                  message: 'Nueva tarea añadida',
                  type: 'success'
                });
                return [payload.new!, ...currentTasks];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new) {
              setTasks(currentTasks => 
                currentTasks.map(task => task.id === payload.new!.id ? payload.new! : task)
              );
              setNotification({
                message: 'Tarea actualizada',
                type: 'info'
              });
            }
          } else if (payload.eventType === 'DELETE') {
            if (payload.old) {
              setTasks(currentTasks => 
                currentTasks.filter(task => task.id !== payload.old!.id)
              );
              setNotification({
                message: 'Tarea eliminada',
                type: 'info'
              });
            }
          }
        });
        console.log('Realtime subscription setup complete');
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
      }
    };
    
    setupRealtimeSubscription();
    
    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      if (channelRef.current) {
        console.log('Unsubscribing from realtime channel');
        unsubscribeFromTasks(channelRef.current);
      }
    };
  }, []);
  
  // Efecto para recargar tareas cuando cambie el refreshTrigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      // En lugar de recargar todas las tareas, solo actualizamos el estado local
      // ya que la suscripción realtime se encargará de mantener sincronizado el estado
      console.log('Refresh trigger activated - skipping full reload to avoid duplicates');
      // No llamamos a loadTasks() para evitar duplicados
    }
  }, [refreshTrigger]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (err) {
      console.error('Error al cargar las tareas:', err);
      setError('Error al cargar las tareas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      await toggleTaskCompletion(taskId, !currentStatus);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_completed: !currentStatus } : task
      ));
    } catch (err) {
      console.error('Error al cambiar estado de la tarea:', err);
      setError('No se pudo actualizar el estado de la tarea.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error al eliminar la tarea:', err);
      setError('No se pudo eliminar la tarea.');
    }
  };

  // Cerrar la notificación
  const handleCloseNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Mis Tareas
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {tasks.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
          No hay tareas disponibles. ¡Crea una nueva tarea!
        </Typography>
      ) : (
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              sx={{
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={task.is_completed}
                  onChange={() => task.id && handleToggleComplete(task.id, !task.is_completed)}
                  sx={{ mr: 2 }}
                />
              </ListItemIcon>
              
              <ListItemText
                primary={task.title}
                secondary={task.description}
                sx={{
                  '& .MuiListItemText-primary': {
                    textDecoration: task.is_completed ? 'line-through' : 'none',
                    color: task.is_completed ? 'text.disabled' : 'text.primary',
                  },
                }}
              />
              
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="edit" 
                  onClick={() => onEditTask(task)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => task.id && handleDeleteTask(task.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
      
      {/* Notificación para cambios en tiempo real */}
      <Snackbar 
        open={notification !== null} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification?.type || 'info'} 
          sx={{ width: '100%' }}
        >
          {notification?.message || ''}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
