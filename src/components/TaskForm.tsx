import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Stack,
  Paper,
  Typography,
  Alert
} from '@mui/material';
import type { Task, TaskFormData } from '../models/Task';
import { createTask, updateTask } from '../services/taskService';

interface TaskFormProps {
  task?: Task | null;
  onTaskSaved: () => void;
  onCancel: () => void;
}

export default function TaskForm({ task, onTaskSaved, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si se proporciona una tarea para editar, cargar sus datos
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    } else {
      // Resetear el formulario si no hay tarea para editar
      setTitle('');
      setDescription('');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    const taskData: TaskFormData = {
      title: title.trim(),
      description: description.trim() || undefined
    };

    try {
      setLoading(true);
      setError(null);
      
      if (task?.id) {
        // Actualizar tarea existente
        await updateTask(task.id, taskData);
      } else {
        // Crear nueva tarea
        await createTask(taskData);
      }
      
      onTaskSaved();
      // Limpiar el formulario después de guardar
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error al guardar la tarea:', err);
      setError('No se pudo guardar la tarea. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {task ? 'Editar Tarea' : 'Nueva Tarea'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Título"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          
          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {task ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
