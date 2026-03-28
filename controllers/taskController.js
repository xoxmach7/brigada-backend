const db = require('../config/db'); // Импортируем наш "пул" из файла конфигурации

// 1. Получение всех задач
exports.getTasks = async (req, res) => {
    const { search } = req.query; // Получаем параметр из URL (?search=...)

    try {
        let queryText = 'SELECT * FROM tasks';
        let values = [];

        if (search) {
            // Используем ILIKE для поиска без учета регистра и % для поиска подстроки
            queryText += ' WHERE title ILIKE $1 OR description ILIKE $1';
            values.push(`%${search}%`);
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await db.query(queryText, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Не удалось загрузить задачи" });
    }
};

// 2. Создание новой задачи
exports.createTask = async (req, res) => {
    const { title, description, subtasks } = req.body; // Добавили subtasks

    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: "Заголовок не может быть пустым" });
    }

    try {
        const result = await db.query(
            'INSERT INTO tasks (title, description, subtasks) VALUES ($1, $2, $3) RETURNING *',
            [title.trim(), description, JSON.stringify(subtasks || [])] // Превращаем массив в строку для БД
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании задачи" });
    }
};
// 1. Обновление статуса задачи (выполнено/не выполнено)
exports.updateTask = async (req, res) => {
    // Используем уже валидированный ID из middleware, если внедрил его
    const id = req.params.convertedId || req.params.id;
    const { is_completed, subtasks, title, description } = req.body;

    try {
        // Проверяем subtasks на undefined, чтобы случайно не отправить null в COALESCE
        const subtasksJson = (subtasks !== undefined) ? JSON.stringify(subtasks) : null;

        const result = await db.query(
            `UPDATE tasks
             SET is_completed = COALESCE($1, is_completed),
                 subtasks = COALESCE($2, subtasks),
                 title = COALESCE($3, title),
                 description = COALESCE($4, description)
             WHERE id = $5 RETURNING *`,
            [is_completed, subtasksJson, title, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Задача для обновления не найдена" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Ошибка UPDATE:", err);
        res.status(500).json({ error: "Ошибка сервера при обновлении" });
    }
};

// 2. Полное удаление задачи
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Задача не найдена" });
        res.json({ message: "Задача успешно удалена из Бригады", task: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении задачи" });
    }
};