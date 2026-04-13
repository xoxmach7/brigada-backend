import pool from '../config/db.js';

// 1. ПОЛУЧЕНИЕ ВСЕХ ЗАКАЗОВ
export const getTasks = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("💥 Ошибка получения:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 2. СОЗДАНИЕ ЗАКАЗА + ЛОГИРОВАНИЕ
export const createTask = async (req, res) => {
    const { title, description, subtasks, priority, status } = req.body;
    try {
        // Создаем задачу
        const query = `
            INSERT INTO tasks (title, description, subtasks, priority, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [title, description, JSON.stringify(subtasks || []), priority || 1, status || 'design'];
        const result = await pool.query(query, values);
        const newTask = result.rows[0];

        console.log(`✅ Задача создана с ID: ${newTask.id}. Пытаюсь записать лог...`);

        // Блок записи лога с проверкой ошибок
        try {
            await pool.query(
                'INSERT INTO activity_log (task_id, action_type, new_value) VALUES ($1, $2, $3)',
                [newTask.id, 'created', `Заказ "${newTask.title}" создан`]
            );
            console.log("🚀 ЛОГ УСПЕШНО ЗАПИСАН В БАЗУ");
        } catch (logError) {
            console.error("❌ ОШИБКА ПРИ ЗАПИСИ ЛОГА:", logError.message);
        }

        res.status(201).json(newTask);
    } catch (error) {
        console.error("💥 КРИТИЧЕСКАЯ ОШИБКА СОЗДАНИЯ:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 3. ОБНОВЛЕНИЕ + ЛОГИРОВАНИЕ СМЕНЫ СТАТУСА
export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { status, priority, title, description, subtasks } = req.body;

    try {
        const oldData = await pool.query('SELECT status FROM tasks WHERE id = $1', [id]);
        if (oldData.rows.length === 0) return res.status(404).json({ message: "Заказ не найден" });
        const oldStatus = oldData.rows[0].status;

        const query = `
            UPDATE tasks 
            SET status = COALESCE($1, status), priority = COALESCE($2, priority),
                title = COALESCE($3, title), description = COALESCE($4, description),
                subtasks = COALESCE($5, subtasks)
            WHERE id = $6 RETURNING *;
        `;
        const values = [status, priority, title, description, subtasks ? JSON.stringify(subtasks) : null, id];
        const result = await pool.query(query, values);

        if (status && status !== oldStatus) {
            try {
                await pool.query(
                    'INSERT INTO activity_log (task_id, action_type, old_value, new_value) VALUES ($1, $2, $3, $4)',
                    [id, 'status_change', oldStatus, status]
                );
                console.log(`✅ Статус изменен: ${oldStatus} -> ${status}`);
            } catch (logError) {
                console.error("❌ ОШИБКА ЛОГИРОВАНИЯ СТАТУСА:", logError.message);
            }
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("💥 Ошибка обновления:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 4. УДАЛЕНИЕ
export const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: "Заказ удален" });
    } catch (error) {
        res.status(500).json({ message: "Ошибка удаления" });
    }
};