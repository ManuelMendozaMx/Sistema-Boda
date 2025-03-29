const express = require('express');
const router = express.Router();
const inspiracionController = require('../controllers/inspiracion.controller');

router.get('/', inspiracionController.getInspiraciones);
router.post('/', inspiracionController.createInspiracion);
router.put('/:id', inspiracionController.updateInspiracion);
router.delete('/:id', inspiracionController.deleteInspiracion);

module.exports = router;
