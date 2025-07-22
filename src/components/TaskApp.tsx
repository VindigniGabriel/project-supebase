import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import type { Task } from '../models/Task';

export default function TaskApp() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNewTask = () => {
    setEditingTask(null);
    setIsFormVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormVisible(true);
  };

  const handleTaskSaved = () => {
    setIsFormVisible(false);
    setEditingTask(null);
    // Incrementar el trigger para que la lista se actualice
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingTask(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Gestor de Tareas
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" paragraph>
          Organiza tus tareas diarias de forma sencilla
        </Typography>
      </Paper>

      {isFormVisible ? (
        <TaskForm 
          task={editingTask} 
          onTaskSaved={handleTaskSaved} 
          onCancel={handleCancelForm} 
        />
      ) : (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Fab 
            color="primary" 
            aria-label="add" 
            onClick={handleAddNewTask}
          >
            <AddIcon />
          </Fab>
        </Box>
      )}

      <TaskList 
        onEditTask={handleEditTask} 
        refreshTrigger={refreshTrigger} 
      />
    </Container>
  );
}
