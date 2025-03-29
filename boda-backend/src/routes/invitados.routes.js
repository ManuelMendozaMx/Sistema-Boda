const express = require('express');
const router = express.Router();
const invitadosController = require('../controllers/invitados.controller');

// Definir rutas para invitados
router.get('/', invitadosController.getInvitados);
router.post('/', invitadosController.createInvitado);
router.put('/:id', invitadosController.updateInvitado);
router.delete('/:id', invitadosController.deleteInvitado);

module.exports = router;
