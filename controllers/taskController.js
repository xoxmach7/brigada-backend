import pool from '../db.js';

// 1. ПОЛУЧЕНИЕ ВСЕХ ЗАДАЧ (с информацией о сотруднике)
export const getTasks = async (req, res) => {
    const { search } = req.query;
    try {
        // Делаем LEFT JOIN, чтобы сразу видеть имя назначенного рабочего
        let query = `
            SELECT t.*, w.name as worker_name 
            FROM tasks t 
            LEFT JOIN workers w ON t.worker_id = w.id 
            ORDER BY t.id ASC
        `;
        let values = [];

        if (search) {
            query = `
                SELECT t.*, w.name as worker_name 
                FROM tasks t 
                LEFT JOIN workers w ON t.worker_id = w.id 
                WHERE t.title ILIKE $1 OR t.description ILIKE $1 
                ORDER BY t.id ASC
            `;
            values = [`%${search}%`];
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("💥 Ошибка при получении задач:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 2. СОЗДАНИЕ ЗАДАЧИ
export const createTask = async (req, res) => {
    const { title, description, subtasks, priority, status, deadline, worker_id, extra_data } = req.body;
    
    try {
        const query = `
            INSERT INTO tasks (title, description, subtasks, priority, status, deadline, worker_id, extra_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        
        const values = [
            title, 
            description || '', 
            JSON.stringify(subtasks || []), 
            priority || 'medium', 
            status || 'todo', 
            deadline || null,
            worker_id || null,
            JSON.stringify(extra_data || {})
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("💥 Ошибка при создании задачи:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 3. ОБНОВЛЕНИЕ ЗАДАЧИ
export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, is_completed, subtasks, priority, status, deadline, worker_id, extra_data } = req.body;

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
                deadline = COALESCE($7, deadline),
                worker_id = COALESCE($8, worker_id),
                extra_data = COALESCE($9, extra_data)
            WHERE id = $10
            RETURNING *;
        `;

        const values = [
            title, description, is_completed, 
            subtasks ? JSON.stringify(subtasks) : null,
            priority, status, deadline, worker_id, 
            extra_data ? JSON.stringify(extra_data) : null,
            id
        ];

        const result = await pool.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ message: "Не найдено" });

        res.json(result.rows[0]);
    } catch (error) {
        console.error("💥 Ошибка при обновлении:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 4. УДАЛЕНИЕ ЗАДАЧИ
export const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Не найдено" });
        res.json({ message: "Удалено", task: result.rows[0] });
    } catch (error) {
        console.error("💥 Ошибка при удалении:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};