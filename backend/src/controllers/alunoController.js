const Aluno = require('../models/Aluno');
const Turma = require('../models/Turma');

// Adicionar aluno à turma
exports.adicionar = async (req, res) => {
    try {
        const { turma_id, numero, nome, gpa } = req.body;

        // Verificar se a turma pertence ao usuário
        const turma = await Turma.findById(turma_id);
        if (!turma || turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const alunoId = await Aluno.create({
            turma_id,
            numero,
            nome,
            gpa
        });

        const aluno = await Aluno.findById(alunoId);
        res.status(201).json({
            message: 'Aluno adicionado com sucesso',
            aluno
        });

    } catch (error) {
        console.error('Erro ao adicionar aluno:', error);
        res.status(500).json({ error: 'Erro ao adicionar aluno' });
    }
};

// Listar alunos da turma
exports.listar = async (req, res) => {
    try {
        const { turma_id } = req.params;

        const turma = await Turma.findById(turma_id);
        if (!turma || turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const alunos = await Aluno.findByTurmaId(turma_id);
        res.json({ alunos });

    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({ error: 'Erro ao listar alunos' });
    }
};

// Buscar aluno por ID
exports.buscar = async (req, res) => {
    try {
        const { id } = req.params;
        const aluno = await Aluno.findById(id);

        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        // Verificar se a turma pertence ao usuário
        const turma = await Turma.findById(aluno.turma_id);
        if (!turma || turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const history = await Aluno.getHistory(id);
        res.json({
            aluno,
            history
        });

    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({ error: 'Erro ao buscar aluno' });
    }
};

// Atualizar aluno
exports.atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero, nome, gpa, faltas, presencas } = req.body;

        const aluno = await Aluno.findById(id);
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        const turma = await Turma.findById(aluno.turma_id);
        if (!turma || turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updated = await Aluno.update(id, { numero, nome, gpa, faltas, presencas });
        if (!updated) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        const alunoAtualizado = await Aluno.findById(id);
        res.json({
            message: 'Aluno atualizado com sucesso',
            aluno: alunoAtualizado
        });

    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({ error: 'Erro ao atualizar aluno' });
    }
};

// Remover aluno
exports.remover = async (req, res) => {
    try {
        const { id } = req.params;

        const aluno = await Aluno.findById(id);
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        const turma = await Turma.findById(aluno.turma_id);
        if (!turma || turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        await Aluno.delete(id);
        res.json({ message: 'Aluno removido com sucesso' });

    } catch (error) {
        console.error('Erro ao remover aluno:', error);
        res.status(500).json({ error: 'Erro ao remover aluno' });
    }
};

// Adicionar nota ao aluno
exports.adicionarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, nota, data, acertos, erros, questoes_detalhes } = req.body;

        const aluno = await Aluno.findById(id);
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        const turma = await Turma.findById(aluno.turma_id);
        if (!turma || turma.usuario_id !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const historicoId = await Aluno.addGrade(id, {
            titulo,
            nota,
            data,
            acertos,
            erros,
            questoes_detalhes
        });

        const alunoAtualizado = await Aluno.findById(id);
        res.status(201).json({
            message: 'Nota adicionada com sucesso',
            historico_id: historicoId,
            aluno: alunoAtualizado
        });

    } catch (error) {
        console.error('Erro ao adicionar nota:', error);
        res.status(500).json({ error: 'Erro ao adicionar nota' });
    }
};