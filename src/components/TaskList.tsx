import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemSecondaryAction, 
  IconButton, 
  Checkbox,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Task } from '../models/Task';
import { getTasks, deleteTask, toggleTaskCompletion } from '../services/taskService';

interface TaskListProps {
  onEditTask: (task: Task) => void;
  refreshTrigger: number;
}

export default function TaskList({ onEditTask, refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      setError('No se pudieron cargar las tareas. Inténtalo de nuevo más tarde.');
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
                  onChange={() => task.id && handleToggleComplete(task.id, task.is_completed)}
                  color="primary"
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
    </Paper>
  );
}
