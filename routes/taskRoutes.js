const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getTasks);      // Read (Все)
router.post('/', taskController.createTask);    // Create
router.patch('/:id', taskController.updateTask); // Update (частично)
router.delete('/:id', taskController.deleteTask); // Delete

module.exports = router;

// Улучшенный Middleware
const validateId = (req, res, next) => {
    const id = parseInt(req.params.id, 10); // Явно указываем десятичную систему

    // Проверка: не NaN, целое число и больше нуля
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            error: "Некорректный формат ID. Ожидается положительное целое число."
        });
    }

    // Лайфхак: сохраняем уже числовой ID, чтобы контроллер не мучился
    req.params.convertedId = id;
    next();
};

// Роуты остаются такими же — это удобно
router.patch('/:id', validateId, taskController.updateTask);
router.delete('/:id', validateId, taskController.deleteTask);