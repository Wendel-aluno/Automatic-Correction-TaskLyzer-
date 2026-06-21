const Turma = require('../models/Turma');
const Aluno = require('../models/Aluno');

// Listar turmas do usuário
exports.listar = async (req, res) => {
    try {
        const turmas = await Turma.findByUsuarioId(req.userId);
        res.json({ turmas });

    } catch (error) {
        console.error('Erro ao listar turmas:', error);
        res.status(500).json({ error: 'Erro ao listar turmas' });
    }
};

// Criar nova turma
exports.criar = async (req, res) => {
    try {
        const { nome, nivel, status, total_aulas } = req.body;

        const turmaId = await Turma.create({
            usuario_id: req.userId,
            nome,
            nivel,
            status,
            total_aulas
        });

        const turma = await Turma.findById(turmaId);
        res.status(201).json({
            message: 'Turma criada com sucesso',
            turma
        });

    } catch (error) {
        console.error('Erro ao criar turma:', error);
        res.status(500).json({ error: 'Erro ao criar turma' });
    }
};

// Buscar turma por ID
exports.buscar = async (req, res) => {
    try {
        const { id } = req.params;
        const turma = await Turma.findById(id);

        if (!turma) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        if (turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const alunos = await Aluno.findByTurmaId(id);
        const stats = await Turma.getStatistics(id);

        res.json({
            turma,
            alunos,
            statistics: stats
        });

    } catch (error) {
        console.error('Erro ao buscar turma:', error);
        res.status(500).json({ error: 'Erro ao buscar turma' });
    }
};

// Atualizar turma
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, nivel, status, total_aulas } = req.body;

        const turma = await Turma.findById(id);
        if (!turma) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        if (turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updated = await Turma.update(id, { nome, nivel, status, total_aulas });
        if (!updated) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        const turmaAtualizada = await Turma.findById(id);
        res.json({
            message: 'Turma atualizada com sucesso',
            turma: turmaAtualizada
        });

    } catch (error) {
        console.error('Erro ao atualizar turma:', error);
        res.status(500).json({ error: 'Erro ao atualizar turma' });
    }
};

// Deletar turma
exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;

        const turma = await Turma.findById(id);
        if (!turma) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        if (turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await Turma.delete(id);
        res.json({ message: 'Turma removida com sucesso' });

    } catch (error) {
        console.error('Erro ao deletar turma:', error);
        res.status(500).json({ error: 'Erro ao deletar turma' });
    }
};