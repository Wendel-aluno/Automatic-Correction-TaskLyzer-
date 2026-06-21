const db = require('../config/database');

class Aluno {
    static async create(alunoData) {
        const { turma_id, numero, nome, gpa } = alunoData;
        const [result] = await db.query(
            `INSERT INTO alunos (uuid, turma_id, numero, nome, gpa) 
             VALUES (UUID(), ?, ?, ?, ?)`,
            [turma_id, numero, nome, gpa || 0]
        );
        return result.insertId;
    }

    static async findByTurmaId(turmaId) {
        const [rows] = await db.query(
            `SELECT a.*,
                    COALESCE(h.nota, 0) as ultima_nota,
                    COUNT(h.id) as total_provas
             FROM alunos a
             LEFT JOIN historico_aluno h ON h.aluno_id = a.id
             WHERE a.turma_id = ? AND a.ativo = TRUE
             GROUP BY a.id
             ORDER BY a.numero ASC`,
            [turmaId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            `SELECT a.*,
                    COALESCE(h.nota, 0) as ultima_nota,
                    COUNT(h.id) as total_provas
             FROM alunos a
             LEFT JOIN historico_aluno h ON h.aluno_id = a.id
             WHERE a.id = ? AND a.ativo = TRUE
             GROUP BY a.id`,
            [id]
        );
        return rows[0] || null;
    }

    static async update(id, data) {
        const { numero, nome, gpa, faltas, presencas } = data;
        const [result] = await db.query(
            `UPDATE alunos 
             SET numero = ?, nome = ?, gpa = ?, faltas = ?, presencas = ?
             WHERE id = ? AND ativo = TRUE`,
            [numero, nome, gpa, faltas, presencas, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query(
            'UPDATE alunos SET ativo = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getHistory(id) {
        const [rows] = await db.query(
            `SELECT h.*, p.titulo as prova_titulo
             FROM historico_aluno h
             LEFT JOIN provas p ON p.id = h.prova_id
             WHERE h.aluno_id = ?
             ORDER BY h.data DESC`,
            [id]
        );
        return rows;
    }

    static async addGrade(alunoId, gradeData) {
        const { titulo, nota, data, acertos, erros, questoes_detalhes } = gradeData;
        const [result] = await db.query(
            `INSERT INTO historico_aluno (uuid, aluno_id, titulo, nota, data, acertos, erros, questoes_detalhes)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
            [alunoId, titulo, nota, data, acertos || 0, erros || 0, JSON.stringify(questoes_detalhes || [])]
        );
        
        // Recalcular estatísticas do aluno
        await this.recalculateStats(alunoId);
        
        return result.insertId;
    }

    static async recalculateStats(alunoId) {
        // A procedure do banco já faz isso, mas também podemos fazer via código
        await db.query('CALL sp_recalcular_estatisticas_aluno(?)', [alunoId]);
    }
}

module.exports = Aluno;