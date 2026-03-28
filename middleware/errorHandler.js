module.exports = (err, req, res, _next) => {
    // 1. Логируем полную ошибку для разработчика
    console.error('💥 Сбой в системе:', err.stack);

    // 2. Определяем статус ошибки (если он задан в коде, иначе 500)
    const statusCode = err.statusCode || 500;

    // 3. Формируем ответ в зависимости от окружения
    const response = {
        error: 'На сервере Бригады что-то пошло не так',
        message: err.message
    };

    // Если мы в режиме разработки (development), добавляем стек вызовов
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};