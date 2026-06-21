const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', turmaController.listar);
router.post('/', turmaController.criar);
router.get('/:id', turmaController.buscar);
router.put('/:id', turmaController.atualizar);
router.delete('/:id', turmaController.deletar);

module.exports = router;