const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler'); // Перенесли импорт вверх

const app = express();

// --- 1. MIDDLEWARES ---
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// --- 2. ROUTES ---
app.use('/api/tasks', taskRoutes);

// --- 3. 404 HANDLER ---
// Сработает, если ни один роут выше не подошел
app.use((req, res, next) => {
    res.status(404).json({ error: "Маршрут не найден в системе Бригады" });
});

// --- 4. ERROR HANDLER (Strictly Last!) ---
// Сюда попадают все ошибки из try/catch ваших контроллеров
app.use(errorHandler);

// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 СЕРВЕР "БРИГАДЫ" ЗАПУЩЕН`);
    console.log(`📡 ПОРТ: ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/tasks`);
    console.log(`-----------------------------------------`);
});