import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import taskRoutes from './routes/taskRoutes.js'; // Важно: добавляем .js в конце пути

// Настройка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Для работы с JSON в теле запроса
app.use(morgan('dev'));  // Для красивых логов запросов в консоли

// Маршруты (Routes)
app.use('/api/tasks', taskRoutes);

// Базовый маршрут для проверки
app.get('/', (req, res) => {
    res.send('🚀 API "Бригады" (Текстиль) работает в режиме ES Modules!');
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('💥 Произошла ошибка на сервере:', err.stack);
    res.status(500).json({ message: 'Что-то пошло не так на сервере!' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 СЕРВЕР "БРИГАДЫ" ЗАПУЩЕН НА ПОРТУ ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/tasks`);
    console.log(`-------------------------------------------`);
});