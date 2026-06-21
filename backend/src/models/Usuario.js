const db = require('../config/database');

class Usuario {
    static async create(usuarioData) {
        const { nome, sobrenome, email, senha, biografia, escola } = usuarioData;
        const [result] = await db.query(
            `INSERT INTO usuarios (uuid, nome, sobrenome, email, senha, biografia, escola) 
             VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
            [nome, sobrenome, email, senha, biografia, escola]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
            [email]
        );
        return rows[0] || null;
    }

    static async findById(id) {
        const [rows] = await db.query(
            'SELECT id, nome, sobrenome, email, biografia, escola, foto_perfil, data_cadastro FROM usuarios WHERE id = ? AND ativo = TRUE',
            [id]
        );
        return rows[0] || null;
    }

    static async update(id, data) {
        const { nome, sobrenome, email, biografia, escola, foto_perfil } = data;
        const [result] = await db.query(
            `UPDATE usuarios 
             SET nome = ?, sobrenome = ?, email = ?, biografia = ?, escola = ?, foto_perfil = ?
             WHERE id = ? AND ativo = TRUE`,
            [nome, sobrenome, email, biografia, escola, foto_perfil, id]
        );
        return result.affectedRows > 0;
    }

    static async updateLastAccess(id) {
        await db.query(
            'UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?',
            [id]
        );
    }
}

module.exports = Usuario;