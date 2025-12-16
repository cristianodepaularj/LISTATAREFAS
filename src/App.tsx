import React, { useState } from 'react';
import './App.css';
import { MenuIcon, MoreIcon, PlusIcon, TrashIcon, BookIcon, WalkIcon, DropIcon, MailIcon, CheckIcon } from './icons';

interface Task {
  id: number;
  title: string;
  time?: string;
  completed: boolean;
  actionIcon: 'trash' | 'book' | 'walk' | 'drop' | 'mail';
  actionColor: 'blue' | 'orange' | 'green' | 'cyan' | 'gray';
}

const initialTasks: Task[] = [
  { id: 1, title: 'Tomar remédio', time: '08:00 AM', completed: false, actionIcon: 'trash', actionColor: 'blue' },
  { id: 2, title: 'Ler 10 páginas', completed: false, actionIcon: 'book', actionColor: 'orange' },
  { id: 3, title: 'Caminhar 30 min', completed: false, actionIcon: 'walk', actionColor: 'green' },
  { id: 4, title: 'Beber água', completed: false, actionIcon: 'drop', actionColor: 'cyan' },
  { id: 5, title: 'Responder e-mails', completed: true, actionIcon: 'mail', actionColor: 'gray' },
];

const formatTaskDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Fallback if regular text

  const today = new Date();
  const isToday = date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr;
  } else {
    const dayStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${dayStr} às ${timeStr}`;
  }
};

const Header = ({ count }: { count: number }) => {
  const today = new Date();
  const dateString = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(today);

  // Capitalize first letter of month
  const formattedDate = dateString.replace(/^\w| \w/g, (c) => c.toUpperCase());

  return (
    <div className="header">
      <div className="header-top">
        <button><MenuIcon /></button>
        <span className="header-title">Minhas Tarefas</span>
        <button><MoreIcon /></button>
      </div>
      <div className="date-display">
        Hoje, {formattedDate}
      </div>
      <div className="pending-count">
        {count} tarefas pendentes
      </div>
    </div>
  );
};

const TaskItem = ({ task, onToggle, onDelete }: { task: Task, onToggle: (id: number) => void, onDelete: (id: number) => void }) => {
  const getIcon = () => {
    switch (task.actionIcon) {
      case 'trash': return <TrashIcon />;
      case 'book': return <BookIcon />;
      case 'walk': return <WalkIcon />;
      case 'drop': return <DropIcon />;
      case 'mail': return <MailIcon />;
      default: return <TrashIcon />;
    }
  };

  return (
    <div className="task-item">
      <div className="task-checkbox-container" onClick={() => onToggle(task.id)}>
        <div className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
          {task.completed && <CheckIcon />}
        </div>
      </div>
      <div className="task-content" onClick={() => onToggle(task.id)}>
        <div className={`task-title ${task.completed ? 'checked' : ''}`}>
          {task.title}
        </div>
        {task.time && <div className="task-time">{task.time}</div>}
      </div>
      <div
        className={`task-action action-${task.actionColor}`}
        onClick={() => onDelete(task.id)}
      >
        {getIcon()}
      </div>
    </div>
  );
};

const AddTaskModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (title: string, time: string) => void }) => {
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, dateTime);
      setTitle('');
      setDateTime('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Agendar Tarefa</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>O que vamos fazer?</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Ex: Ler um livro"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              style={{ marginBottom: '0' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Quando?</label>
            <input
              type="datetime-local"
              className="modal-input"
              value={dateTime}
              onChange={e => setDateTime(e.target.value)}
              style={{ marginBottom: '0' }}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Agendar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = (title: string, time: string) => {
    const newTask: Task = {
      id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      title,
      time: time ? formatTaskDate(time) : undefined,
      completed: false,
      actionIcon: 'trash', // Default icon for new items
      actionColor: 'blue'
    };
    setTasks([...tasks, newTask]);
  };

  const pendingCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="app-container">
      <Header count={pendingCount} />

      <div className="task-list">
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
        ))}
      </div>

      <button className="fab" onClick={() => setIsModalOpen(true)}>
        <PlusIcon />
      </button>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTask}
      />
    </div>
  );
}

export default App;
