import pool from '../db.js';

// 1. ПОЛУЧЕНИЕ ВСЕХ ЗАДАЧ (с поиском)
export const getTasks = async (req, res) => {
    const { search } = req.query;
    try {
        let query = 'SELECT * FROM tasks ORDER BY id ASC';
        let values = [];

        if (search) {
            query = 'SELECT * FROM tasks WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY id ASC';
            values = [`%${search}%`];
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("💥 Ошибка при получении задач:", error);
        res.status(500).json({ message: "Ошибка сервера при получении списка задач" });
    }
};

// 2. СОЗДАНИЕ НОВОЙ ЗАДАЧИ
export const createTask = async (req, res) => {
    const { title, description, subtasks, priority, status, deadline } = req.body;
    
    try {
        const query = `
            INSERT INTO tasks (title, description, subtasks, priority, status, deadline)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        
        // Подзадачи сохраняем как JSON строку, остальные поля с дефолтными значениями
        const values = [
            title, 
            description || '', 
            JSON.stringify(subtasks || []), 
            priority || 'medium', 
            status || 'todo', 
            deadline || null
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("💥 Ошибка при создании задачи:", error);
        res.status(500).json({ message: "Ошибка сервера при создании задачи" });
    }
};

// 3. ОБНОВЛЕНИЕ ЗАДАЧИ (Умный патч через COALESCE)
export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, is_completed, subtasks, priority, status, deadline } = req.body;

    try {
        const query = `
            UPDATE tasks 
            SET 
                title = COALESCE($1, title), 
                description = COALESCE($2, description), 
                is_completed = COALESCE($3, is_completed), 
                subtasks = COALESCE($4, subtasks),
                priority = COALESCE($5, priority),
                status = COALESCE($6, status),
                deadline = COALESCE($7, deadline)
            WHERE id = $8
            RETURNING *;
        `;

        const values = [
            title, 
            description, 
            is_completed, 
            subtasks ? JSON.stringify(subtasks) : null,
            priority,
            status,
            deadline,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Задача не найдена" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("💥 Ошибка при обновлении задачи:", error);
        res.status(500).json({ message: "Ошибка сервера при обновлении" });
    }
};

// 4. УДАЛЕНИЕ ЗАДАЧИ
export const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Задача не найдена" });
        }
        
        res.json({ message: "Задача успешно удалена", task: result.rows[0] });
    } catch (error) {
        console.error("💥 Ошибка при удалении задачи:", error);
        res.status(500).json({ message: "Ошибка сервера при удалении" });
    }
};