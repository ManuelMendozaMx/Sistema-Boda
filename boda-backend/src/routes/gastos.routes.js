const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastos.controller');

router.get('/', gastosController.getGastos);
router.post('/', gastosController.createGasto);
router.put('/:id', gastosController.updateGasto);
router.delete('/:id', gastosController.deleteGasto);

module.exports = router;
