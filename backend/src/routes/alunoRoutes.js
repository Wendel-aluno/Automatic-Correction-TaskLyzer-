const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', alunoController.adicionar);
router.get('/turma/:turma_id', alunoController.listar);
router.get('/:id', alunoController.buscar);
router.put('/:id', alunoController.atualizar);
router.delete('/:id', alunoController.remover);
router.post('/:id/nota', alunoController.adicionarNota);

module.exports = router;