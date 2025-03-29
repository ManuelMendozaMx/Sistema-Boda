const express = require('express');
const router = express.Router();
const musicaController = require('../controllers/musica.controller');

router.get('/', musicaController.getMusica);
router.post('/', musicaController.createCancion);
router.put('/:id', musicaController.updateCancion);
router.delete('/:id', musicaController.deleteCancion);

module.exports = router;
