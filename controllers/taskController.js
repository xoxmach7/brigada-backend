// Поднимаемся на уровень выше и заходим в папку config
import pool from '../config/db.js';

// 1. ПОЛУЧЕНИЕ ЗАДАЧ (Видим кто за что отвечает)
export const getTasks = async (req, res) => {
    const { search, status } = req.query;
    try {
        let query = `
            SELECT t.*, w.name as worker_name, w.role as worker_role
            FROM tasks t 
            LEFT JOIN workers w ON t.worker_id = w.id 
            WHERE 1=1
        `;
        let values = [];

        if (search) {
            query += ` AND (t.title ILIKE $${values.length + 1} OR t.description ILIKE $${values.length + 1})`;
            values.push(`%${search}%`);
        }

        if (status) {
            query += ` AND t.status = $${values.length + 1}`;
            values.push(status);
        }

        query += ` ORDER BY t.id ASC`;

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("💥 Ошибка:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 2. СОЗДАНИЕ ЗАКАЗА (ЗАДАЧИ)
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
            status || 'design', // Первый этап всегда Дизайн
            deadline || null,
            worker_id || null,
            JSON.stringify(extra_data || {}) // Сюда пишем: ткань, замеры и т.д.
        ];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("💥 Ошибка:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 3. ОБНОВЛЕНИЕ (Смена этапа производства)
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
        if (result.rows.length === 0) return res.status(404).json({ message: "Заказ не найден" });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("💥 Ошибка:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 4. УДАЛЕНИЕ ЗАКАЗА
export const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: "Заказ удален" });
    } catch (error) {
        res.status(500).json({ message: "Ошибка удаления" });
    }
};