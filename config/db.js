const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Совет: добавь тайм-ауты, чтобы запросы не висели вечно
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});

// Логируем успешное создание нового клиента в пуле
pool.on('connect', () => {
    console.log('🔗 Новое соединение с manager_db установлено');
});

// КРИТИЧЕСКОЕ: Обработка ошибок простаивающих клиентов
// Если база перезагрузится, этот обработчик не даст приложению упасть
pool.on('error', (err) => {
    console.error('❌ Непредвиденная ошибка в пуле PostgreSQL:', err);
    // В реальном проде здесь может быть process.exit(-1);
});

module.exports = {
    // Оставляем как есть, это удобно
    query: (text, params) => pool.query(text, params),

    // Полезно для закрытия пула при выключении сервера
    end: () => pool.end(),
};