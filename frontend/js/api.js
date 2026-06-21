// ============================================================
// API - CONFIGURAÇÃO
// ============================================================
const API_URL = CONFIG.API_URL;

function getToken() {
    return localStorage.getItem('token');
}

function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// ============================================================
// API - AUTENTICAÇÃO
// ============================================================
async function apiLogin(email, senha) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
    }
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
}

async function apiRegister(dados) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar');
    }
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
}

async function apiGetProfile() {
    const response = await fetch(`${API_URL}/auth/profile`, {
        headers: getHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar perfil');
    }
    
    return data.user;
}

async function apiUpdateProfile(dados) {
    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil');
    }
    
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
}

// ============================================================
// API - TURMAS
// ============================================================
async function apiListarTurmas() {
    const response = await fetch(`${API_URL}/turmas`, {
        headers: getHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao listar turmas');
    }
    
    return data.turmas;
}

async function apiCriarTurma(dados) {
    const response = await fetch(`${API_URL}/turmas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar turma');
    }
    
    return data.turma;
}

async function apiBuscarTurma(id) {
    const response = await fetch(`${API_URL}/turmas/${id}`, {
        headers: getHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar turma');
    }
    
    return data;
}

async function apiAtualizarTurma(id, dados) {
    const response = await fetch(`${API_URL}/turmas/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar turma');
    }
    
    return data.turma;
}

async function apiDeletarTurma(id) {
    const response = await fetch(`${API_URL}/turmas/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar turma');
    }
    
    return data;
}

// ============================================================
// API - ALUNOS
// ============================================================
async function apiAdicionarAluno(dados) {
    const response = await fetch(`${API_URL}/alunos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar aluno');
    }
    
    return data.aluno;
}

async function apiListarAlunos(turmaId) {
    const response = await fetch(`${API_URL}/alunos/turma/${turmaId}`, {
        headers: getHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao listar alunos');
    }
    
    return data.alunos;
}

async function apiBuscarAluno(id) {
    const response = await fetch(`${API_URL}/alunos/${id}`, {
        headers: getHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar aluno');
    }
    
    return data;
}

async function apiAtualizarAluno(id, dados) {
    const response = await fetch(`${API_URL}/alunos/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar aluno');
    }
    
    return data.aluno;
}

async function apiRemoverAluno(id) {
    const response = await fetch(`${API_URL}/alunos/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover aluno');
    }
    
    return data;
}

async function apiAdicionarNota(alunoId, dados) {
    const response = await fetch(`${API_URL}/alunos/${alunoId}/nota`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar nota');
    }
    
    return data;
}

async function apiRegistrarPresenca(alunoId, dados) {
    const response = await fetch(`${API_URL}/alunos/${alunoId}/presenca`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar presença');
    }
    
    return data;
}