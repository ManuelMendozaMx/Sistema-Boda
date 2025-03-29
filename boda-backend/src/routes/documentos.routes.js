const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentos.controller');

router.get('/', documentosController.getDocumentos);
router.post('/', documentosController.createDocumento);

module.exports = router;
