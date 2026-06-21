const db = require('../config/database');

class Turma {
    static async create(turmaData) {
        const { usuario_id, nome, nivel, status, total_aulas } = turmaData;
        const [result] = await db.query(
            `INSERT INTO turmas (uuid, usuario_id, nome, nivel, status, total_aulas) 
             VALUES (UUID(), ?, ?, ?, ?, ?)`,
            [usuario_id, nome, nivel, status, total_aulas || 0]
        );
        return result.insertId;
    }

    static async findByUsuarioId(usuarioId) {
        const [rows] = await db.query(
            `SELECT t.*, 
                    COUNT(DISTINCT a.id) as total_alunos,
                    COALESCE(AVG(a.gpa), 0) as media_calculada
             FROM turmas t
             LEFT JOIN alunos a ON a.turma_id = t.id AND a.ativo = TRUE
             WHERE t.usuario_id = ? AND t.ativo = TRUE
             GROUP BY t.id
             ORDER BY t.data_criacao DESC`,
            [usuarioId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            `SELECT t.*, 
                    COUNT(DISTINCT a.id) as total_alunos,
                    COALESCE(AVG(a.gpa), 0) as media_calculada
             FROM turmas t
             LEFT JOIN alunos a ON a.turma_id = t.id AND a.ativo = TRUE
             WHERE t.id = ? AND t.ativo = TRUE
             GROUP BY t.id`,
            [id]
        );
        return rows[0] || null;
    }

    static async update(id, data) {
        const { nome, nivel, status, total_aulas } = data;
        const [result] = await db.query(
            `UPDATE turmas 
             SET nome = ?, nivel = ?, status = ?, total_aulas = ?
             WHERE id = ? AND ativo = TRUE`,
            [nome, nivel, status, total_aulas, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.query(
            'UPDATE turmas SET ativo = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getStatistics(id) {
        const [rows] = await db.query(
            `SELECT 
                COALESCE(AVG(a.gpa), 0) as media_turma,
                SUM(CASE WHEN a.gpa >= 6 THEN 1 ELSE 0 END) as aprovados,
                SUM(CASE WHEN a.gpa < 6 THEN 1 ELSE 0 END) as reprovados,
                COALESCE(SUM(a.presencas) / (COUNT(a.id) * t.total_aulas) * 100, 0) as presenca_media
             FROM turmas t
             LEFT JOIN alunos a ON a.turma_id = t.id AND a.ativo = TRUE
             WHERE t.id = ? AND t.ativo = TRUE`,
            [id]
        );
        return rows[0] || { media_turma: 0, aprovados: 0, reprovados: 0, presenca_media: 0 };
    }
}

module.exports = Turma;