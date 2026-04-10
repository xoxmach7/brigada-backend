import express from 'express';
// Обязательно добавляем .js к пути импорта контроллера!
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router; // Вот это исправляет твою ошибку