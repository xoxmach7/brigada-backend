import pool from '../config/db.js';

// Получить все ткани на складе
export const getFabrics = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fabrics ORDER BY hanger_number ASC');
        res.json(result.rows);
    } catch (error) {
        console.error("💥 Ошибка получения тканей:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// Поиск ткани по номеру вешалки (для QR-сканера)
export const getFabricByHanger = async (req, res) => {
    const { hanger_number } = req.params;
    try {
        const result = await pool.query('SELECT * FROM fabrics WHERE hanger_number = $1', [hanger_number]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Ткань не найдена" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// Добавление новой ткани (вешалки)
export const addFabric = async (req, res) => {
    const { hanger_number, name, composition, width_cm, stock_meters, price_per_meter } = req.body;
    try {
        const query = `
            INSERT INTO fabrics (hanger_number, name, composition, width_cm, stock_meters, price_per_meter)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await pool.query(query, [hanger_number, name, composition, width_cm, stock_meters, price_per_meter]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Уникальный номер вешалки уже есть
            return res.status(400).json({ message: "Вешалка с таким номером уже существует" });
        }
        res.status(500).json({ message: "Ошибка сервера" });
    }
};