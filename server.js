import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import pool from './config/db.js';

// Импорт роутов
import taskRoutes from './routes/taskRoutes.js';
import fabricRoutes from './routes/fabricRoutes.js'; // Новый роут для склада

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Логирование запросов в терминале

// Маршруты API
app.use('/api/tasks', taskRoutes);     // Управление заказами "Бригады"
app.use('/api/fabrics', fabricRoutes); // Управление складом (вешалки/QR)

// Базовый эндпоинт для проверки
app.get('/', (req, res) => {
    res.send('🚀 Сервер "Бригады" и "Склада" активен!');
});

// Предотвращение автоматического завершения процесса (clean exit)
setInterval(() => {}, 1000 * 60 * 60);

// Запуск сервера с проверкой базы
const startServer = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('🐘 PostgreSQL подключен успешно');
        
        app.listen(PORT, () => {
            console.log(`-------------------------------------------`);
            console.log(`🚀 СЕРВЕР ЗАПУЩЕН НА ПОРТУ ${PORT}`);
            console.log(`🔗 API Ткани: http://localhost:${PORT}/api/fabrics`);
            console.log(`🔗 API Задачи: http://localhost:${PORT}/api/tasks`);
            console.log(`-------------------------------------------`);
        });
    } catch (err) {
        console.error('❌ ОШИБКА ПРИ СТАРТЕ СЕРВЕРА:', err.message);
        process.exit(1);
    }
};

startServer();