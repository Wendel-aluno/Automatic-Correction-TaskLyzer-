-- ============================================================
-- BANCO DE DADOS: AUTOMATIC CORRECTION
-- ============================================================
-- Versão: 1.0
-- Descrição: Sistema de correção automática de provas com IA

CREATE DATABASE IF NOT EXISTS automatic_correction;
USE automatic_correction;

-- ============================================================
-- TABELA: USUARIOS (Professores)
-- ============================================================
DROP TABLE IF EXISTS sessoes;
DROP TABLE IF EXISTS notificacoes;
DROP TABLE IF EXISTS recomendacoes;
DROP TABLE IF EXISTS correcoes_ia;
DROP TABLE IF EXISTS gabaritos;
DROP TABLE IF EXISTS heatmap_dificuldades;
DROP TABLE IF EXISTS registros_presenca;
DROP TABLE IF EXISTS historico_aluno;
DROP TABLE IF EXISTS provas;
DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS turmas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    biografia TEXT,
    escola VARCHAR(150),
    foto_perfil LONGTEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME,
    ativo BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: TURMAS
-- ============================================================
CREATE TABLE IF NOT EXISTS turmas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nivel VARCHAR(50) NOT NULL DEFAULT 'Ensino Básico',
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    total_aulas INT DEFAULT 0,
    media_geral DECIMAL(3,1) DEFAULT 0,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: ALUNOS
-- ============================================================
CREATE TABLE IF NOT EXISTS alunos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    turma_id INT NOT NULL,
    numero INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    gpa DECIMAL(3,1) DEFAULT 0,
    ultima_nota DECIMAL(3,1) DEFAULT 0,
    total_provas INT DEFAULT 0,
    taxa_acerto INT DEFAULT 0,
    tendencia VARCHAR(10) DEFAULT 'up',
    faltas INT DEFAULT 0,
    presencas INT DEFAULT 0,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    INDEX idx_turma (turma_id),
    INDEX idx_uuid (uuid),
    UNIQUE KEY uk_turma_numero (turma_id, numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: PROVAS
-- ============================================================
CREATE TABLE IF NOT EXISTS provas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    turma_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    disciplina VARCHAR(100),
    data_prova DATE,
    quantidade_questoes INT DEFAULT 20,
    nota_maxima DECIMAL(3,1) DEFAULT 10,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    INDEX idx_turma (turma_id),
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: HISTORICO_ALUNO
-- ============================================================
CREATE TABLE IF NOT EXISTS historico_aluno (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    aluno_id INT NOT NULL,
    prova_id INT NULL,
    titulo VARCHAR(150) NOT NULL,
    nota DECIMAL(3,1) NOT NULL,
    data DATE NOT NULL,
    acertos INT DEFAULT 0,
    erros INT DEFAULT 0,
    questoes_detalhes JSON,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (prova_id) REFERENCES provas(id) ON DELETE SET NULL,
    INDEX idx_aluno (aluno_id),
    INDEX idx_uuid (uuid),
    INDEX idx_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: GABARITOS
-- ============================================================
CREATE TABLE IF NOT EXISTS gabaritos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    turma_id INT NOT NULL,
    prova_id INT NULL,
    imagem_data LONGTEXT,
    imagem_tipo VARCHAR(50),
    base64 TEXT,
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (prova_id) REFERENCES provas(id) ON DELETE SET NULL,
    INDEX idx_turma (turma_id),
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: CORRECOES_IA
-- ============================================================
CREATE TABLE IF NOT EXISTS correcoes_ia (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    aluno_id INT NOT NULL,
    gabarito_id INT NULL,
    nota_obtida DECIMAL(3,1) DEFAULT 0,
    quantidade_questoes INT DEFAULT 0,
    acertos INT DEFAULT 0,
    erros INT DEFAULT 0,
    dificuldade_principal VARCHAR(100),
    resultado_texto LONGTEXT,
    data_correcao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (gabarito_id) REFERENCES gabaritos(id) ON DELETE SET NULL,
    INDEX idx_aluno (aluno_id),
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: RECOMENDACOES
-- ============================================================
CREATE TABLE IF NOT EXISTS recomendacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    correcao_id INT NOT NULL,
    aluno_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade INT DEFAULT 1,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    aplicada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (correcao_id) REFERENCES correcoes_ia(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    INDEX idx_correcao (correcao_id),
    INDEX idx_aluno (aluno_id),
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: NOTIFICACOES
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    usuario_id INT NOT NULL,
    turma_id INT NULL,
    aluno_id INT NULL,
    texto VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'info',
    lida BOOLEAN DEFAULT FALSE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_lida (lida),
    INDEX idx_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: REGISTROS_PRESENCA
-- ============================================================
CREATE TABLE IF NOT EXISTS registros_presenca (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    aluno_id INT NOT NULL,
    turma_id INT NOT NULL,
    data DATE NOT NULL,
    presente BOOLEAN DEFAULT TRUE,
    observacao VARCHAR(255),
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    INDEX idx_aluno (aluno_id),
    INDEX idx_data (data),
    INDEX idx_uuid (uuid),
    UNIQUE KEY uk_aluno_data (aluno_id, data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: HEATMAP_DIFICULDADES
-- ============================================================
CREATE TABLE IF NOT EXISTS heatmap_dificuldades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    turma_id INT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    proficiencia INT DEFAULT 0,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
    UNIQUE KEY uk_turma_categoria (turma_id, categoria),
    INDEX idx_turma (turma_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: SESSOES
-- ============================================================
CREATE TABLE IF NOT EXISTS sessoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(45),
    user_agent TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_expiracao DATETIME,
    ativa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario (usuario_id),
    INDEX idx_expiracao (data_expiracao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW vw_resumo_turma AS
SELECT 
    t.id AS turma_id,
    t.uuid AS turma_uuid,
    t.nome AS turma_nome,
    t.media_geral,
    t.total_aulas,
    COUNT(DISTINCT a.id) AS total_alunos,
    AVG(a.gpa) AS media_alunos,
    SUM(CASE WHEN a.gpa >= 6 THEN 1 ELSE 0 END) AS aprovados,
    SUM(CASE WHEN a.gpa < 6 THEN 1 ELSE 0 END) AS reprovados,
    AVG(CASE WHEN t.total_aulas > 0 THEN (a.presencas / t.total_aulas) * 100 ELSE 0 END) AS presenca_media
FROM turmas t
LEFT JOIN alunos a ON a.turma_id = t.id AND a.ativo = TRUE
WHERE t.ativo = TRUE
GROUP BY t.id, t.uuid, t.nome, t.media_geral, t.total_aulas;

CREATE OR REPLACE VIEW vw_historico_aluno AS
SELECT 
    a.id AS aluno_id,
    a.uuid AS aluno_uuid,
    a.nome AS aluno_nome,
    a.numero,
    t.id AS turma_id,
    t.nome AS turma_nome,
    h.id AS historico_id,
    h.titulo AS prova_titulo,
    h.nota,
    h.data AS data_prova,
    h.acertos,
    h.erros,
    h.questoes_detalhes
FROM alunos a
JOIN turmas t ON t.id = a.turma_id
JOIN historico_aluno h ON h.aluno_id = a.id
WHERE a.ativo = TRUE
ORDER BY h.data DESC;

-- ============================================================
-- PROCEDURES
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_recalcular_estatisticas_aluno(IN p_aluno_id INT)
BEGIN
    DECLARE v_total_provas INT;
    DECLARE v_soma_notas DECIMAL(10,1);
    DECLARE v_media DECIMAL(3,1);
    DECLARE v_ultima_nota DECIMAL(3,1);
    DECLARE v_acertos_total INT;
    DECLARE v_questoes_total INT;
    DECLARE v_taxa_acerto INT;
    DECLARE v_tendencia VARCHAR(10);
    
    SELECT 
        COUNT(*),
        COALESCE(SUM(nota), 0),
        COALESCE(SUM(acertos), 0),
        COALESCE(SUM(acertos + erros), 0)
    INTO 
        v_total_provas,
        v_soma_notas,
        v_acertos_total,
        v_questoes_total
    FROM historico_aluno
    WHERE aluno_id = p_aluno_id;
    
    IF v_total_provas > 0 THEN
        SET v_media = ROUND(v_soma_notas / v_total_provas, 1);
        
        SELECT nota INTO v_ultima_nota
        FROM historico_aluno
        WHERE aluno_id = p_aluno_id
        ORDER BY data DESC, id DESC
        LIMIT 1;
        
        IF v_questoes_total > 0 THEN
            SET v_taxa_acerto = ROUND((v_acertos_total / v_questoes_total) * 100);
        ELSE
            SET v_taxa_acerto = 0;
        END IF;
        
        SET v_tendencia = 'up';
    ELSE
        SET v_media = 0;
        SET v_ultima_nota = 0;
        SET v_taxa_acerto = 0;
        SET v_tendencia = 'up';
    END IF;
    
    UPDATE alunos 
    SET 
        gpa = v_media,
        ultima_nota = v_ultima_nota,
        total_provas = v_total_provas,
        taxa_acerto = v_taxa_acerto,
        tendencia = v_tendencia,
        data_atualizacao = CURRENT_TIMESTAMP
    WHERE id = p_aluno_id;
    
    CALL sp_recalcular_media_turma(
        (SELECT turma_id FROM alunos WHERE id = p_aluno_id)
    );
END //

CREATE PROCEDURE sp_recalcular_media_turma(IN p_turma_id INT)
BEGIN
    DECLARE v_media DECIMAL(3,1);
    
    SELECT COALESCE(AVG(gpa), 0)
    INTO v_media
    FROM alunos
    WHERE turma_id = p_turma_id AND ativo = TRUE;
    
    UPDATE turmas
    SET media_geral = ROUND(v_media, 1)
    WHERE id = p_turma_id;
END //

CREATE PROCEDURE sp_registrar_presenca(
    IN p_aluno_id INT,
    IN p_turma_id INT,
    IN p_data DATE,
    IN p_presente BOOLEAN
)
BEGIN
    INSERT INTO registros_presenca (uuid, aluno_id, turma_id, data, presente)
    VALUES (UUID(), p_aluno_id, p_turma_id, p_data, p_presente)
    ON DUPLICATE KEY UPDATE presente = p_presente;
    
    UPDATE alunos a
    SET presencas = (
        SELECT COUNT(*) 
        FROM registros_presenca 
        WHERE aluno_id = a.id AND presente = TRUE
    ),
    faltas = (
        SELECT COUNT(*) 
        FROM registros_presenca 
        WHERE aluno_id = a.id AND presente = FALSE
    )
    WHERE a.id = p_aluno_id;
END //

DELIMITER ;

-- ============================================================
-- DADOS DE EXEMPLO
-- ============================================================

INSERT INTO usuarios (uuid, nome, sobrenome, email, senha, biografia, escola) VALUES 
(UUID(), 'Admin', 'Sistema', 'admin@automaticcorrection.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Professor Administrador', 'Escola Modelo');

INSERT INTO turmas (uuid, usuario_id, nome, nivel, status, total_aulas) VALUES 
(UUID(), 1, '9º Ano B', 'Ensino Básico', 'success', 20);

INSERT INTO alunos (uuid, turma_id, numero, nome, gpa, faltas, presencas) VALUES 
(UUID(), 1, 1, 'Ana Silva', 8.5, 1, 19),
(UUID(), 1, 2, 'Carlos Santos', 7.2, 2, 18),
(UUID(), 1, 3, 'Mariana Costa', 9.0, 0, 20),
(UUID(), 1, 4, 'João Pereira', 5.8, 3, 17),
(UUID(), 1, 5, 'Beatriz Oliveira', 6.5, 1, 19);

INSERT INTO heatmap_dificuldades (turma_id, categoria, proficiencia) VALUES 
(1, 'Interpretação', 75),
(1, 'Gramática', 65),
(1, 'Pontuação', 70),
(1, 'Ortografia', 85);