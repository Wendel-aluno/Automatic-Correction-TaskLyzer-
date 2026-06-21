// ============================================================
// ESTADO DA APLICAÇÃO
// ============================================================
var App = {
    view: 'splash',
    sidebarOpen: false,
    theme: 'light',

    classes: [],
    selectedClass: null,
    selectedStudent: null,
    notifications: [],
    showNotifications: false,

    officialGabarito: null,
    studentGabarito: null,
    studentScan: null,
    lastCorrectionData: null,
    showSyncSuccess: false,
    mensagemToast: '',

    searchQuery: '',
    activeFilter: 'todos',
    activeSort: 'alfabetica',
    showStatsTab: false,
    selectedHistoricalTest: null,

    profileImage: null,
    profileName: 'Professor',
    profileBio: 'Docente',
    profileEmail: 'professor@escola.com',
    aiResult: null,
    email: '',
    password: '',
    isLoading: false,
    isProcessing: false,
    isConfirming: false,
    isAnalyzing: false,
    errorMsg: '',

    novaTurma: {
        nome: '',
        nivel: 'Ensino Básico',
        status: 'success',
        totalAulas: 0,
        alunos: [],
        statistics: {
            averageAttendance: '0%',
            worstQuestion: '-',
            mediaTurma: 0,
            aprovados: 0,
            reprovados: 0,
            heatmap: { 'Interpretação': 0, 'Gramática': 0, 'Pontuação': 0, 'Ortografia': 0 }
        }
    },
    isCreating: false,
    activeTab: 'config',

    novoAluno: {
        number: 1,
        name: '',
        gpa: 0,
        lastGrade: 0,
        testCount: 0,
        successRate: 0,
        trend: 'up',
        faltas: 0,
        presencas: 0,
        history: []
    },

    novaProva: {
        title: '',
        grade: 0,
        date: '',
        correct: 0,
        wrong: 0
    },

    registroFalta: {
        alunoId: '',
        quantidade: 1,
        data: ''
    },
    mostrarModalFalta: false,

    registroPresenca: {
        alunoId: '',
        quantidade: 1,
        data: ''
    },
    mostrarModalPresenca: false,

    modalNota: {
        alunoId: '',
        titulo: '',
        nota: 0,
        data: ''
    },
    mostrarModalNota: false,

    scanStep: 1,
    currentStudentId: null,
    scanStream: null,
    selectedTargetClass: '',
    selectedTargetStudent: '',

    testDetails: {
        name: 'Prova Trimestral',
        subject: 'Matemática',
        qCount: 20
    },

    localOfficial: null,
    studentAnswer: null,

    user: null
};

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================
function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getStatusClass(gpa) {
    if (gpa >= 8.0) return 'otimo';
    if (gpa >= 6.0) return 'bom';
    if (gpa >= 4.0) return 'regular';
    return 'ruim';
}

function getStatusIcon(gpa) {
    if (gpa >= 8.0) return 'fa-star';
    if (gpa >= 6.0) return 'fa-check-circle';
    if (gpa >= 4.0) return 'fa-exclamation-triangle';
    return 'fa-times-circle';
}

function getStatusLabel(gpa) {
    if (gpa >= 8.0) return 'Ótimo';
    if (gpa >= 6.0) return 'Bom';
    if (gpa >= 4.0) return 'Regular';
    return 'Ruim';
}

function getGradeColor(gpa) {
    if (gpa >= 8.0) return 'text-green-500';
    if (gpa >= 6.0) return 'text-blue-500';
    if (gpa >= 4.0) return 'text-yellow-500';
    return 'text-red-500';
}

function getStatusColor(status) {
    if (status === 'success') return 'bg-green-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-red-500';
}

function getRandomDetails(count) {
    var details = [];
    for (var i = 0; i < count; i++) {
        details.push(Math.random() > 0.3 ? 1 : 0);
    }
    return details;
}

function getStatusLabelFromStatus(status) {
    if (status === 'success') return 'Excelente';
    if (status === 'warning') return 'Atenção';
    return 'Crítico';
}

function calcularPresencaAluno(student, totalAulas) {
    if (!student || totalAulas === 0) return 0;
    var presencas = student.presencas || 0;
    return Math.round((presencas / totalAulas) * 100);
}

function getPresencaClass(percentual) {
    if (percentual >= 75) return 'alta';
    if (percentual >= 50) return 'media';
    return 'baixa';
}

function calcularEstatisticasTurma(students, totalAulas) {
    if (!students || students.length === 0) {
        return {
            averageAttendance: '0%',
            worstQuestion: '-',
            mediaTurma: 0,
            aprovados: 0,
            reprovados: 0,
            heatmap: { 'Interpretação': 0, 'Gramática': 0, 'Pontuação': 0, 'Ortografia': 0 }
        };
    }

    var totalGpa = 0;
    var totalSuccess = 0;
    var totalPresencas = 0;
    var aprovados = 0;
    var reprovados = 0;
    var heatmap = { 'Interpretação': 0, 'Gramática': 0, 'Pontuação': 0, 'Ortografia': 0 };

    for (var i = 0; i < students.length; i++) {
        var s = students[i];
        totalGpa += s.gpa || 0;
        totalSuccess += s.successRate || 0;
        var presencaPercent = calcularPresencaAluno(s, totalAulas);
        totalPresencas += presencaPercent;

        if ((s.gpa || 0) >= NOTA_MINIMA_APROVACAO) {
            aprovados++;
        } else {
            reprovados++;
        }
    }

    var avgGpa = (totalGpa / students.length);
    var mediaTurma = parseFloat(avgGpa.toFixed(1));
    var avgSuccess = Math.round(totalSuccess / students.length);
    var avgPresenca = students.length > 0 ? Math.round(totalPresencas / students.length) : 0;

    var worstQuestion = '-';
    var minGrade = 10;
    for (var j = 0; j < students.length; j++) {
        var hist = students[j].history || [];
        for (var k = 0; k < hist.length; k++) {
            if (hist[k].grade < minGrade) {
                minGrade = hist[k].grade;
                worstQuestion = hist[k].title || 'Questão';
            }
        }
    }

    return {
        averageAttendance: avgPresenca + '%',
        worstQuestion: worstQuestion,
        mediaTurma: mediaTurma,
        aprovados: aprovados,
        reprovados: reprovados,
        heatmap: {
            'Interpretação': Math.round(avgSuccess * 0.85),
            'Gramática': Math.round(avgSuccess * 0.72),
            'Pontuação': Math.round(avgSuccess * 0.78),
            'Ortografia': Math.round(avgSuccess * 0.92)
        }
    };
}

function updateStudentStats(student) {
    var history = student.history || [];
    var total = history.length;
    if (total === 0) {
        student.gpa = 0;
        student.lastGrade = 0;
        student.testCount = 0;
        student.successRate = 0;
        student.trend = 'up';
        student.status = 'regular';
        return student;
    }
    var sum = 0;
    var successSum = 0;
    var last = history[history.length - 1] || { grade: 0, correct: 0, wrong: 0 };
    for (var i = 0; i < history.length; i++) {
        sum += history[i].grade || 0;
        var totalQ = (history[i].correct || 0) + (history[i].wrong || 0);
        if (totalQ > 0) {
            successSum += ((history[i].correct || 0) / totalQ) * 100;
        }
    }
    student.gpa = parseFloat((sum / total).toFixed(1));
    student.lastGrade = last.grade || 0;
    student.testCount = total;
    student.successRate = Math.round(successSum / total);
    student.trend = 'up';
    if (history.length >= 2) {
        var lastTwo = history.slice(-2);
        if (lastTwo[1].grade < lastTwo[0].grade) student.trend = 'down';
    }
    student.status = getStatusClass(student.gpa);
    return student;
}

function avaliarAluno(student, mediaTurma) {
    if (!student || mediaTurma === undefined) return { status: 'regular', label: 'Regular', diff: 0 };
    var diff = student.gpa - mediaTurma;
    var status = 'regular';
    var label = 'Regular';
    if (diff >= 1.0) {
        status = 'otimo';
        label = 'Ótimo (Acima da média)';
    } else if (diff >= 0.5) {
        status = 'bom';
        label = 'Bom (Próximo da média)';
    } else if (diff >= -0.5) {
        status = 'regular';
        label = 'Regular (Na média)';
    } else {
        status = 'ruim';
        label = 'Ruim (Abaixo da média)';
    }
    return {
        status: status,
        label: label,
        diff: diff
    };
}

// ============================================================
// FUNÇÕES DE NAVEGAÇÃO
// ============================================================
function navigateTo(view) {
    App.view = view;
    App.sidebarOpen = false;
    App.showNotifications = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
}

function toggleTheme() {
    App.theme = App.theme === 'light' ? 'dark' : 'light';
    render();
}

function closeSidebar() {
    App.sidebarOpen = false;
    render();
}

// ============================================================
// LOGIN E AUTENTICAÇÃO
// ============================================================
async function handleLogin() {
    if (App.email && App.password) {
        App.isLoading = true;
        render();
        try {
            const result = await apiLogin(App.email, App.password);
            App.profileName = result.user.nome;
            App.profileEmail = result.user.email;
            App.profileBio = result.user.biografia || 'Docente';
            App.profileImage = result.user.foto_perfil || null;
            App.user = result.user;
            App.isLoading = false;
            await carregarTurmas();
            navigateTo('dashboard');
        } catch (error) {
            App.isLoading = false;
            alert('Erro ao fazer login: ' + error.message);
            render();
        }
    }
}

function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    App.user = null;
    navigateTo('login');
}

// ============================================================
// FUNÇÕES DE RENDERIZAÇÃO (MAIN)
// ============================================================
function render() {
    var html = '';
    var themeClass = App.theme === 'dark' ? 'dark' : '';

    var toastHtml = '';
    if (App.showSyncSuccess) {
        toastHtml =
            '<div class="toast-success"><i class="fas fa-check-circle"></i><div><p class="text-sm font-black uppercase">Operação Realizada!</p><p class="text-xs opacity-90">' +
            App.mensagemToast + '</p></div><button onclick="App.showSyncSuccess=false;render();" class="text-white hover:opacity-70 ml-2"><i class="fas fa-times"></i></button></div>';
    }

    var viewHtml = '';
    switch (App.view) {
        case 'splash':
            viewHtml = renderSplash();
            break;
        case 'login':
            viewHtml = renderLogin();
            break;
        case 'register':
            viewHtml = renderRegister();
            break;
        case 'success':
            viewHtml = renderSuccess();
            break;
        case 'dashboard':
            viewHtml = renderDashboard();
            break;
        case 'profile':
            viewHtml = renderProfile();
            break;
        case 'salas':
            viewHtml = renderSalas();
            break;
        case 'sala-detalhe':
            viewHtml = renderSalaDetalhe();
            break;
        case 'aluno-detalhe':
            viewHtml = renderAlunoDetalhe();
            break;
        case 'nova-turma':
            viewHtml = renderNovaTurma();
            break;
        case 'relatorios':
            viewHtml = renderRelatorios();
            break;
        case 'import':
            viewHtml = renderImport();
            break;
        case 'scan':
            viewHtml = renderScan();
            break;
        case 'confirm':
            viewHtml = renderConfirm();
            break;
        case 'results':
            viewHtml = renderResults();
            break;
        case 'compare':
            viewHtml = renderCompare();
            break;
        case 'tips':
            viewHtml = renderTips();
            break;
        case 'charts':
            viewHtml = renderCharts();
            break;
        case 'discursive':
            viewHtml = renderDiscursive();
            break;
        case 'ai_result':
            viewHtml = renderAiResult();
            break;
        case 'aplicar-prova':
            viewHtml = renderAplicarProva();
            break;
        default:
            viewHtml = renderSplash();
    }

    var sidebarHtml = '';
    if (App.sidebarOpen) {
        sidebarHtml = renderSidebar();
    }

    html =
        '<div class="min-h-screen ' + themeClass + ' bg-[#f0f7f7] dark:bg-slate-900 font-sans text-gray-800 dark:text-slate-100 transition-colors duration-200">' +
        toastHtml +
        '<main class="flex-1 w-full flex flex-col relative"><div class="flex-1 w-full max-w-5xl mx-auto bg-white dark:bg-slate-800 min-h-screen shadow-xl flex flex-col relative overflow-hidden transition-colors">' +
        viewHtml +
        '</div></main>' +
        sidebarHtml +
        '</div>';

    document.getElementById('app').innerHTML = html;

    if (App.view === 'scan') {
        setTimeout(initScan, 300);
    }
}

// ============================================================
// CARREGAR TURMAS DO BACKEND
// ============================================================
async function carregarTurmas() {
    try {
        const turmas = await apiListarTurmas();
        App.classes = turmas.map(t => ({
            id: t.id,
            name: t.nome,
            studentCount: t.total_alunos || 0,
            average: t.media_calculada || 0,
            lastActivity: t.data_atualizacao ? new Date(t.data_atualizacao).toLocaleDateString() : 'Sem atividade',
            status: t.status || 'success',
            totalAulas: t.total_aulas || 0,
            students: [],
            statistics: {}
        }));
        render();
    } catch (error) {
        console.error('Erro ao carregar turmas:', error);
    }
}

// ============================================================
// INICIAR APLICAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há usuário logado
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        App.user = JSON.parse(user);
        App.profileName = App.user.nome || 'Professor';
        App.profileEmail = App.user.email || '';
        App.profileBio = App.user.biografia || 'Docente';
        carregarTurmas().then(() => {
            navigateTo('dashboard');
        });
    } else {
        navigateTo('splash');
    }
});

// ============================================================
// RENDERIZAÇÃO DAS VIEWS (Simplificadas)
// ============================================================

// LOGO
function renderLogo(className) {
    className = className || 'w-24 h-24';
    return '<div class="logo-fixed ' + className + '">' +
        '<img src="assets/logo.png" alt="Automatic Correction" style="width:100%;height:100%;object-fit:contain;" />' +
        '</div>';
}

function renderLogoText() {
    return '<div class="text-center mt-3">' +
        '<h1 class="text-2xl font-black tracking-widest text-[#7aa2a1] dark:text-[#a0c4c3]">AUTOMATIC CORRECTION</h1>' +
        '<p class="text-xs tracking-wider mt-1 font-semibold opacity-90 text-[#7aa2a1] dark:text-[#a0c4c3]">AUTOMATIZE A CORREÇÃO, OTIMIZE O SEU TEMPO!</p>' +
        '</div>';
}

function renderSimpleHeader(title) {
    return '<div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">' +
        '<button onclick="navigateTo(\'dashboard\')" class="text-gray-400 hover:text-black p-2 hover:bg-gray-50 rounded-full transition-colors"><i class="fas fa-arrow-left text-2xl"></i></button>' +
        '<h2 class="text-lg font-black text-gray-700 dark:text-slate-100 tracking-wide">' + title +
        '</h2>' +
        '<div class="w-10"></div></div>';
}

// SPLASH
function renderSplash() {
    return '<div class="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 cursor-pointer" onclick="navigateTo(\'login\')">' +
        '<div class="animate-bounce flex flex-col items-center">' +
        renderLogo('w-48 h-48') +
        renderLogoText() +
        '</div>' +
        '<p class="text-gray-400 dark:text-gray-500 text-xs mt-16">Toque no ecrã para iniciar</p>' +
        '</div>';
}

// LOGIN
function renderLogin() {
    if (App.isLoading) {
        return '<div class="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 max-w-md mx-auto w-full">' +
            '<div class="mb-10 w-full flex flex-col items-center">' +
            renderLogo('w-32 h-32') +
            renderLogoText() +
            '</div>' +
            '<div class="w-full text-center py-10"><div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#7aa2a1] mx-auto"></div><p class="text-sm font-bold text-gray-500 mt-4">A autenticar...</p></div>' +
            '</div>';
    }
    return '<div class="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 max-w-md mx-auto w-full">' +
        '<div class="mb-10 w-full flex flex-col items-center">' +
        renderLogo('w-32 h-32') +
        renderLogoText() +
        '</div>' +
        '<div class="w-full space-y-3">' +
        '<input type="email" placeholder="E-mail" class="input-style" value="' + App.email + '" onchange="App.email=this.value"/>' +
        '<input type="password" placeholder="Senha" class="input-style" value="' + App.password + '" onchange="App.password=this.value"/>' +
        '<div class="flex flex-col items-center gap-2 pt-2">' +
        '<button onclick="handleLogin()" class="w-2/3 py-3 bg-[#e8f1f1] hover:bg-[#d0e1e1] text-[#7aa2a1] font-bold rounded-full text-sm transition-all active:scale-95">Entrar</button>' +
        '<button onclick="navigateTo(\'register\')" class="text-xs text-[#a3bdbc] hover:underline font-bold mt-1">Criar conta</button>' +
        '</div></div></div>';
}

// REGISTER
function renderRegister() {
    return '<div class="flex-1 flex flex-col items-center py-10 px-8 bg-white dark:bg-slate-800 max-w-md mx-auto w-full">' +
        renderLogo('w-24 h-24') +
        renderLogoText() +
        '<div class="w-full space-y-3 mt-8">' +
        '<input type="text" placeholder="Nome" class="input-style" id="regNome" />' +
        '<input type="text" placeholder="Apelido" class="input-style" id="regSobrenome" />' +
        '<input type="email" placeholder="E-mail" class="input-style" id="regEmail" />' +
        '<input type="password" placeholder="Palavra-passe" class="input-style" id="regSenha" />' +
        '<div class="flex items-start gap-2.5 my-6 pt-2">' +
        '<input type="checkbox" class="mt-1 h-4 w-4 rounded" style="accentColor:#7aa2a1" id="regTermos" />' +
        '<span class="text-xs text-gray-500 dark:text-gray-400">Li e concordo com os termos de utilização e política de privacidade.</span>' +
        '</div>' +
        '<div class="flex flex-col gap-3 pt-4">' +
        '<button onclick="handleRegister()" class="btn-solid">Criar conta</button>' +
        '<button onclick="navigateTo(\'login\')" class="text-sm font-bold text-gray-500 text-center hover:underline">Voltar ao Login</button>' +
        '</div></div></div>';
}

async function handleRegister() {
    const nome = document.getElementById('regNome').value;
    const sobrenome = document.getElementById('regSobrenome').value;
    const email = document.getElementById('regEmail').value;
    const senha = document.getElementById('regSenha').value;
    const termos = document.getElementById('regTermos').checked;

    if (!nome || !sobrenome || !email || !senha) {
        alert('Preencha todos os campos.');
        return;
    }

    if (!termos) {
        alert('Aceite os termos de utilização.');
        return;
    }

    try {
        App.isLoading = true;
        render();
        await apiRegister({ nome, sobrenome, email, senha });
        App.isLoading = false;
        navigateTo('success');
    } catch (error) {
        App.isLoading = false;
        alert('Erro ao registrar: ' + error.message);
        render();
    }
}

// SUCCESS
function renderSuccess() {
    return '<div class="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 max-w-md mx-auto w-full">' +
        '<div class="flex flex-col items-center mb-16">' +
        '<div class="p-4 bg-[#e8f1f1] rounded-full mb-6"><i class="fas fa-check-circle text-7xl text-[#7aa2a1]"></i></div>' +
        '<h2 class="text-3xl font-black tracking-wide text-gray-700 italic text-center">Registo realizado</h2>' +
        '<h2 class="text-3xl font-black tracking-wide text-gray-700 italic text-center mt-1">com sucesso!</h2>' +
        '</div>' +
        '<button onclick="navigateTo(\'dashboard\')" class="btn-solid flex items-center justify-center gap-2">Aceder ao Painel <i class="fas fa-arrow-left rotate-180"></i></button>' +
        '</div>';
}

// SIDEBAR
function renderSidebar() {
    var profileImg = App.profileImage ?
        '<img src="' + App.profileImage + '" alt="Perfil" class="w-full h-full object-cover" />' :
        '<i class="fas fa-user text-2xl"></i>';

    var themeIcon = App.theme === 'light' ? 'fa-moon' : 'fa-sun';
    var themeLabel = App.theme === 'light' ? 'Modo Escuro' : 'Modo Claro';
    var toggleClass = App.theme === 'dark' ? 'active' : 'inactive';

    return '<div class="sidebar">' +
        '<div class="sidebar-backdrop" onclick="closeSidebar()"></div>' +
        '<div class="sidebar-content">' +
        '<div class="p-6 flex flex-col h-full">' +
        '<div class="flex justify-between items-center mb-8">' +
        '<span class="text-sm font-semibold text-gray-500 dark:text-gray-400">Menu</span>' +
        '<button onclick="closeSidebar()" class="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"><i class="fas fa-times text-2xl"></i></button>' +
        '</div>' +
        '<div class="flex items-center gap-4 mb-8 p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors" onclick="navigateTo(\'profile\');closeSidebar();">' +
        '<div class="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-white overflow-hidden shrink-0">' +
        profileImg +
        '</div>' +
        '<div class="overflow-hidden"><h3 class="font-bold text-gray-700 dark:text-gray-200 leading-tight truncate">' +
        App.profileName + '</h3><p class="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5 font-bold">Professor</p></div>' +
        '</div>' +
        '<div class="space-y-2">' +
        '<button onclick="navigateTo(\'dashboard\');closeSidebar();" class="menu-item"><i class="fas fa-sync-alt text-[#7aa2a1]"></i> Painel Principal</button>' +
        '<button onclick="navigateTo(\'salas\');closeSidebar();" class="menu-item"><i class="fas fa-users text-[#7aa2a1]"></i> Gestão de Salas (Turmas)</button>' +
        '<button onclick="navigateTo(\'profile\');closeSidebar();" class="menu-item"><i class="fas fa-user text-[#7aa2a1]"></i> O Meu Perfil</button>' +
        '</div>' +
        '<div class="mt-8 pt-4 border-t dark:border-slate-700">' +
        '<button onclick="toggleTheme()" class="w-full flex items-center justify-between py-2 px-4 rounded-lg bg-white dark:bg-slate-700 text-sm font-bold shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">' +
        '<span class="flex items-center gap-2"><i class="fas ' + themeIcon + ' text-[#7aa2a1]"></i> ' + themeLabel + '</span>' +
        '<div class="toggle-switch ' + toggleClass + '" onclick="event.stopPropagation();toggleTheme();"><div class="toggle-dot"></div></div>' +
        '</button></div>' +
        '<button onclick="logoutUser()" class="mt-auto flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 p-3 rounded-lg transition-colors">' +
        '<i class="fas fa-sign-out-alt"></i> Sair</button>' +
        '</div></div></div>';
}

// DASHBOARD
function renderDashboard() {
    var items = [
        { id: 'salas', icon: 'fa-users', label: 'GESTÃO DE SALAS\n(TURMAS)' },
        { id: 'import', icon: 'fa-image', label: 'IMPORTAR IMAGEM\nDO GABARITO' },
        { id: 'aplicar-prova', icon: 'fa-qrcode', label: 'APLICAR PROVA\nAOS ALUNOS' },
        { id: 'results', icon: 'fa-check-circle', label: 'CORRIGIR\nAUTOMATICAMENTE' },
        { id: 'compare', icon: 'fa-file-alt', label: 'COMPARAR COM O\nGABARITO OFICIAL' },
        { id: 'tips', icon: 'fa-lightbulb', label: 'SUGESTÕES DE MELHORIA' },
        { id: 'charts', icon: 'fa-chart-bar', label: 'GRÁFICOS DE\nDESEMPENHO' },
        { id: 'discursive', icon: 'fa-pen', label: 'CORREÇÃO DISCURSIVA\nCOM IA' }
    ];

    var unreadCount = 0;
    for (var i = 0; i < App.notifications.length; i++) {
        if (App.notifications[i].unread) unreadCount++;
    }

    var notifHtml = '';
    if (App.showNotifications) {
        var listHtml = '';
        for (var ni = 0; ni < App.notifications.length; ni++) {
            var n = App.notifications[ni];
            var cls = n.unread ? 'bg-[#e8f1f1] dark:bg-slate-600/50 font-semibold' :
                'bg-gray-50 dark:bg-slate-600/10 text-gray-500';
            listHtml += '<div class="p-2.5 rounded-xl text-xs transition-colors ' + cls +
                '"><p class="leading-tight text-gray-800 dark:text-gray-200">' + n.text +
                '</p><span class="text-[10px] text-gray-400 block mt-1">' + n.time +
                '</span></div>';
        }
        notifHtml =
            '<div class="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-700 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-600 z-50 p-4 animate-fade-in">' +
            '<div class="flex justify-between items-center mb-3 pb-2 border-b dark:border-slate-600">' +
            '<span class="text-xs font-black uppercase text-gray-500 dark:text-gray-400">Notificações</span>' +
            '<button onclick="markAllRead()" class="text-[10px] text-[#7aa2a1] hover:underline font-bold">Marcar como lidas</button>' +
            '</div>' +
            '<div class="space-y-3 max-h-60 overflow-y-auto">' + listHtml + '</div></div>';
    }

    var itemsHtml = '';
    for (var mi = 0; mi < items.length; mi++) {
        var item = items[mi];
        itemsHtml += '<button onclick="navigateTo(\'' + item.id + '\')" class="dashboard-item">' +
            '<i class="fas ' + item.icon + '"></i><span>' + item.label + '</span></button>';
    }

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800">' +
        '<div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">' +
        '<button onclick="App.sidebarOpen=true;render();" class="text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-50 rounded-lg transition-colors"><i class="fas fa-bars text-3xl"></i></button>' +
        '<div class="flex flex-col items-center">' +
        renderLogo('w-14 h-14') +
        renderLogoText() +
        '</div>' +
        '<div class="flex items-center gap-2">' +
        '<div class="relative cursor-pointer text-green-500 p-2"><i class="fas fa-cloud text-xl animate-bounce"></i><div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div></div>' +
        '<div class="relative">' +
        '<button onclick="App.showNotifications=!App.showNotifications;render();" class="p-2 text-gray-600 dark:text-gray-300 relative hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">' +
        '<i class="fas fa-bell text-2xl"></i>' +
        (unreadCount > 0 ? '<span class="notification-badge">' + unreadCount + '</span>' : '') +
        '</button>' + notifHtml +
        '</div></div></div>' +
        '<div class="flex-1 p-6 md:p-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">' +
        '<h2 class="text-gray-400 dark:text-gray-500 font-bold text-xs tracking-widest uppercase mb-6 self-start flex items-center gap-2">' +
        '<i class="fas fa-sparkles text-[#7aa2a1]"></i> Painel de ferramentas do docente</h2>' +
        '<div class="dashboard-grid">' + itemsHtml + '</div></div></div>';
}

function markAllRead() {
    for (var i = 0; i < App.notifications.length; i++) {
        App.notifications[i].unread = false;
    }
    App.showNotifications = false;
    render();
}

// ============================================================
// PROFILE
// ============================================================
function renderProfile() {
    var profileImg = App.profileImage ?
        '<img src="' + App.profileImage + '" alt="Perfil" class="w-full h-full object-cover" />' :
        '<i class="fas fa-user text-6xl text-gray-400"></i>';

    return '<div class="flex-1 flex flex-col p-6 md:p-10 bg-white dark:bg-slate-800 max-w-2xl mx-auto w-full">' +
        '<div class="flex items-center justify-between mb-8">' +
        '<button onclick="navigateTo(\'dashboard\')" class="text-gray-400 hover:text-black dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"><i class="fas fa-arrow-left text-2xl"></i></button>' +
        '<h2 class="text-xl font-bold text-gray-700 dark:text-slate-100">O Meu Perfil</h2><div class="w-10"></div>' +
        '</div>' +
        '<div class="flex flex-col items-center mb-8">' +
        '<div class="relative group cursor-pointer" onclick="document.getElementById(\'profileInput\').click()">' +
        '<div class="w-32 h-32 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#e8f1f1] dark:border-slate-700 shadow-md">' +
        profileImg +
        '</div>' +
        '<div class="absolute bottom-1 right-1 bg-[#7aa2a1] text-white p-2 rounded-full shadow border-2 border-white hover:bg-[#688f8e] transition-colors"><i class="fas fa-camera text-sm"></i></div>' +
        '</div>' +
        '<p class="text-xs text-gray-400 dark:text-gray-500 mt-3 font-semibold">Clique para alterar a imagem de perfil</p>' +
        '<input type="file" id="profileInput" class="hidden" accept="image/*" onchange="handleProfileImage(event)" />' +
        '</div>' +
        '<div class="space-y-4 max-w-md mx-auto w-full">' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1.5 block">Nome do Docente</label><input type="text" class="input-style" value="' +
        App.profileName + '" onchange="App.profileName=this.value" id="profileNameInput" /></div>' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1.5 block">Biografia / Escola</label><input type="text" class="input-style" value="' +
        App.profileBio + '" onchange="App.profileBio=this.value" id="profileBioInput" /></div>' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 mb-1.5 block">E-mail de Contacto</label><input type="email" class="input-style" value="' +
        App.profileEmail + '" onchange="App.profileEmail=this.value" id="profileEmailInput" /></div>' +
        '<div class="pt-6"><button onclick="handleUpdateProfile()" class="btn-solid">Guardar Alterações</button></div>' +
        '</div></div>';
}

async function handleUpdateProfile() {
    try {
        const nome = document.getElementById('profileNameInput').value;
        const biografia = document.getElementById('profileBioInput').value;
        const email = document.getElementById('profileEmailInput').value;

        await apiUpdateProfile({
            nome: nome,
            sobrenome: App.user?.sobrenome || '',
            email: email,
            biografia: biografia,
            escola: biografia,
            foto_perfil: App.profileImage
        });

        App.profileName = nome;
        App.profileBio = biografia;
        App.profileEmail = email;

        App.mensagemToast = 'Perfil atualizado com sucesso!';
        App.showSyncSuccess = true;
        render();
        setTimeout(function() {
            App.showSyncSuccess = false;
            render();
        }, 3000);
    } catch (error) {
        alert('Erro ao atualizar perfil: ' + error.message);
    }
}

function handleProfileImage(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onloadend = function() {
            App.profileImage = reader.result;
            render();
        };
        reader.readAsDataURL(file);
    }
}

// ============================================================
// SALAS (TURMAS)
// ============================================================
function renderSalas() {
    var classesHtml = '';
    if (App.classes.length === 0) {
        classesHtml =
            '<div class="empty-state col-span-2"><i class="fas fa-users"></i><h3>Nenhuma turma criada</h3><p>Clique no botão "Nova Turma" para começar a organizar as suas salas.</p></div>';
    } else {
        for (var ci = 0; ci < App.classes.length; ci++) {
            var c = App.classes[ci];
            var statusLabel = getStatusLabelFromStatus(c.status);
            var presencaBadge = '<span class="presenca-badge media">0%</span>';

            classesHtml +=
                '<div class="bg-white dark:bg-slate-700 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-600 flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow">' +
                '<div class="absolute top-0 left-0 w-2 h-full ' + getStatusColor(c.status) + '"></div>' +
                '<div class="pl-3">' +
                '<div class="flex justify-between items-start mb-2"><h4 class="text-lg font-black text-gray-800 dark:text-white">' +
                c.name + '</h4><span class="text-xs font-semibold px-2 py-1 rounded-full ' +
                (c.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    c.status === 'warning' ?
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400') + '">' +
                statusLabel +
                '</span></div>' +
                '<p class="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Média Geral: <span class="text-gray-800 dark:text-gray-100 font-bold">' +
                c.average + ' / 10</span></p>' +
                '<p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Alunos: <span class="text-gray-800 dark:text-gray-100 font-bold">' +
                c.studentCount + ' matriculados</span></p>' +
                '<p class="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">Presença Média: ' +
                presencaBadge + '</p>' +
                '<p class="text-xs text-gray-400 dark:text-gray-500 truncate">Atividade Recente: ' +
                c.lastActivity + '</p></div>' +
                '<div class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-slate-600 pl-3">' +
                '<button onclick="selectClass(\'' + c.id +
                '\')" class="py-2.5 px-3 bg-[#e8f1f1] dark:bg-slate-600 text-[#7aa2a1] dark:text-slate-100 text-xs font-bold rounded-xl hover:opacity-80 transition-opacity">Ver Alunos</button>' +
                '<button onclick="selectClassAndNavigate(\'' + c.id +
                '\',\'relatorios\')" class="py-2.5 px-3 bg-gray-50 dark:bg-slate-600/50 text-gray-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:opacity-80 transition-opacity">Relatórios</button>' +
                '</div></div>';
        }
    }

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-4xl mx-auto w-full">' +
        renderSimpleHeader('Salas & Turmas') +
        '<div class="p-6 md:p-8 flex-1">' +
        '<div class="flex justify-between items-center mb-6">' +
        '<h3 class="text-gray-400 dark:text-gray-500 font-bold text-xs tracking-widest uppercase">Minhas turmas ativas</h3>' +
        '<button onclick="navigateTo(\'nova-turma\')" class="flex items-center gap-1 text-xs font-black uppercase text-[#7aa2a1] hover:underline"><i class="fas fa-plus"></i> Nova Turma</button>' +
        '</div>' +
        '<div class="grid md:grid-cols-2 gap-6">' + classesHtml + '</div></div></div>';
}

async function selectClass(classId) {
    try {
        const result = await apiBuscarTurma(classId);
        App.selectedClass = {
            id: result.turma.id,
            name: result.turma.nome,
            studentCount: result.turma.total_alunos || 0,
            average: result.turma.media_calculada || 0,
            status: result.turma.status || 'success',
            totalAulas: result.turma.total_aulas || 0,
            students: result.alunos.map(a => ({
                id: a.id,
                number: a.numero,
                name: a.nome,
                gpa: a.gpa || 0,
                lastGrade: a.ultima_nota || 0,
                testCount: a.total_provas || 0,
                successRate: a.taxa_acerto || 0,
                trend: a.tendencia || 'up',
                faltas: a.faltas || 0,
                presencas: a.presencas || 0,
                history: []
            })),
            statistics: {
                averageAttendance: result.statistics.presenca_media ? Math.round(result.statistics.presenca_media) +
                    '%' : '0%',
                worstQuestion: '-',
                mediaTurma: result.statistics.media_turma || 0,
                aprovados: result.statistics.aprovados || 0,
                reprovados: result.statistics.reprovados || 0,
                heatmap: { 'Interpretação': 75, 'Gramática': 65, 'Pontuação': 70, 'Ortografia': 85 }
            }
        };

        // Carregar histórico dos alunos
        for (var i = 0; i < App.selectedClass.students.length; i++) {
            try {
                const alunoData = await apiBuscarAluno(App.selectedClass.students[i].id);
                App.selectedClass.students[i].history = alunoData.history || [];
                updateStudentStats(App.selectedClass.students[i]);
            } catch (e) {
                console.warn('Erro ao carregar histórico do aluno:', e);
            }
        }

        App.showStatsTab = false;
        navigateTo('sala-detalhe');
    } catch (error) {
        alert('Erro ao carregar turma: ' + error.message);
    }
}

function selectClassAndNavigate(classId, view) {
    selectClass(classId);
    setTimeout(function() {
        navigateTo(view);
    }, 500);
}

// ============================================================
// FUNÇÕES DE SALA DETALHE (Simplificadas)
// ============================================================
function renderSalaDetalhe() {
    var cls = App.selectedClass;
    if (!cls) return '<div class="p-8 text-center">Turma não encontrada</div>';

    var totalAulas = cls.totalAulas || 0;
    var stats = calcularEstatisticasTurma(cls.students || [], totalAulas);
    cls.statistics = stats;
    var students = getSortedStudents(cls.students || []);
    var showStats = App.showStatsTab;

    // Versão simplificada - apenas lista de alunos
    var studentsHtml = '';
    if (students.length > 0) {
        for (var si = 0; si < students.length; si++) {
            var s = students[si];
            var initials = getInitials(s.name);
            var statusClass = getStatusClass(s.gpa);

            studentsHtml +=
                '<div class="bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4">' +
                '<div class="flex items-center gap-4 w-full sm:w-auto">' +
                '<div class="student-avatar-placeholder">' + initials + '</div>' +
                '<div><h4 class="font-black text-gray-800 dark:text-white">' + s.name +
                '</h4><p class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5">N° ' + s.number +
                ' | ' + s.testCount + ' provas</p></div></div>' +
                '<div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">' +
                '<div class="text-right"><p class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Média</p><p class="text-lg font-black ' +
                getGradeColor(s.gpa) + '">' + s.gpa + '</p></div>' +
                '<div class="flex flex-wrap gap-1">' +
                '<button onclick="abrirModalNota(\'' + s.id + '\')" class="btn-info text-xs py-1 px-2" title="Adicionar Nota"><i class="fas fa-graduation-cap"></i></button>' +
                '<button onclick="selectStudent(\'' + s.id + '\')" class="btn-secondary text-xs py-1 px-2" title="Ver Detalhes"><i class="fas fa-eye"></i></button>' +
                '</div></div></div>';
        }
    } else {
        studentsHtml =
            '<div class="empty-state"><i class="fas fa-user-graduate"></i><h3>Nenhum aluno matriculado</h3><p>Adicione alunos a esta turma.</p></div>';
    }

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-4xl mx-auto w-full">' +
        '<div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10">' +
        '<button onclick="navigateTo(\'salas\')" class="text-gray-400 hover:text-black dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"><i class="fas fa-arrow-left text-2xl"></i></button>' +
        '<div class="text-center"><h2 class="text-lg font-black text-gray-800 dark:text-slate-100">' + cls.name +
        '</h2><p class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5">Média: ' + cls.average +
        '/10 | Alunos: ' + cls.studentCount + '</p></div>' +
        '<div class="w-10"></div></div>' +
        '<div class="p-6 flex-1 flex flex-col gap-6">' +
        '<div class="flex flex-col sm:flex-row gap-4">' +
        '<div class="relative flex-1"><i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>' +
        '<input type="text" placeholder="Pesquisar aluno..." class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-2xl outline-none focus:ring-2 focus:ring-[#7aa2a1]" value="' +
        App.searchQuery + '" oninput="App.searchQuery=this.value;render();"></div>' +
        '<div class="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 rounded-2xl px-4 py-2.5">' +
        '<i class="fas fa-sliders-h text-[#7aa2a1]"></i>' +
        '<select class="bg-transparent text-xs font-bold text-gray-600 dark:text-slate-300 outline-none" onchange="App.activeSort=this.value;render();">' +
        '<option value="alfabetica">Ordem Alfabética</option>' +
        '<option value="melhor-desempenho">Melhor Desempenho</option>' +
        '<option value="pior-desempenho">Pior Desempenho</option>' +
        '</select></div></div>' +
        '<div class="flex flex-wrap gap-2 items-center">' +
        '<button onclick="adicionarAula()" class="btn-success text-xs py-2 px-4"><i class="fas fa-plus"></i> Registrar Aula</button>' +
        '<span class="text-xs text-gray-500 dark:text-gray-400">Total de aulas: ' + totalAulas + '</span>' +
        '</div>' +
        '<div class="space-y-4">' + studentsHtml + '</div></div>' +
        renderModalNota() +
        '</div>';
}

// ============================================================
// FUNÇÕES DE MODAIS (Nota, Falta, Presença)
// ============================================================
function renderModalNota() {
    if (!App.mostrarModalNota) return '';

    return '<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">' +
        '<div class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">' +
        '<h3 class="text-lg font-black text-gray-800 dark:text-white mb-4"><i class="fas fa-graduation-cap text-[#7aa2a1]"></i> Adicionar Nota</h3>' +
        '<div class="space-y-4">' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Título da Prova</label>' +
        '<input type="text" class="input-style" value="' + App.modalNota.titulo +
        '" onchange="App.modalNota.titulo=this.value" placeholder="Ex: Prova Trimestral" /></div>' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Nota (0-10)</label>' +
        '<input type="number" class="input-style" value="' + App.modalNota.nota +
        '" min="0" max="10" step="0.5" onchange="App.modalNota.nota=parseFloat(this.value)||0" /></div>' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Data</label>' +
        '<input type="date" class="input-style" value="' + (App.modalNota.data || new Date().toISOString().split('T')[
            0]) +
        '" onchange="App.modalNota.data=this.value" /></div>' +
        '</div>' +
        '<div class="flex gap-3 mt-6">' +
        '<button onclick="confirmarNota()" class="flex-1 btn-solid bg-[#7aa2a1] hover:bg-[#688f8e]">Adicionar Nota</button>' +
        '<button onclick="cancelarNota()" class="flex-1 btn-secondary">Cancelar</button>' +
        '</div></div></div>';
}

function abrirModalNota(alunoId) {
    App.modalNota.alunoId = alunoId;
    App.modalNota.titulo = '';
    App.modalNota.nota = 0;
    App.modalNota.data = new Date().toISOString().split('T')[0];
    App.mostrarModalNota = true;
    render();
}

function cancelarNota() {
    App.mostrarModalNota = false;
    App.modalNota = { alunoId: '', titulo: '', nota: 0, data: '' };
    render();
}

async function confirmarNota() {
    var cls = App.selectedClass;
    if (!cls) return;

    var alunoId = App.modalNota.alunoId;
    var titulo = App.modalNota.titulo.trim();
    var nota = App.modalNota.nota;
    var data = App.modalNota.data || new Date().toISOString().split('T')[0];

    if (!titulo) {
        alert('Por favor, insira um título para a prova.');
        return;
    }
    if (nota <= 0 || nota > 10) {
        alert('Por favor, insira uma nota válida entre 0 e 10.');
        return;
    }

    try {
        await apiAdicionarNota(alunoId, {
            titulo: titulo,
            nota: nota,
            data: data,
            acertos: Math.round(nota * 2),
            erros: Math.round((10 - nota) * 2),
            questoes_detalhes: getRandomDetails(20)
        });

        // Recarregar turma
        await selectClass(cls.id);

        App.mostrarModalNota = false;
        App.mensagemToast = 'Nota adicionada com sucesso!';
        App.showSyncSuccess = true;
        render();
        setTimeout(function() {
            App.showSyncSuccess = false;
            render();
        }, 3000);

    } catch (error) {
        alert('Erro ao adicionar nota: ' + error.message);
    }
}

function adicionarAula() {
    var cls = App.selectedClass;
    if (!cls) return;

    cls.totalAulas = (cls.totalAulas || 0) + 1;

    App.mensagemToast = 'Aula registrada com sucesso! Total: ' + cls.totalAulas + ' aulas.';
    App.showSyncSuccess = true;
    render();
    setTimeout(function() {
        App.showSyncSuccess = false;
        render();
    }, 3000);
}

// ============================================================
// ALUNO DETALHE (Simplificado)
// ============================================================
function renderAlunoDetalhe() {
    var student = App.selectedStudent;
    var cls = App.selectedClass;
    if (!student) return '<div class="p-8 text-center">Aluno não encontrado</div>';

    var initials = getInitials(student.name);
    var statusClass = getStatusClass(student.gpa);

    var historyHtml = '';
    if (student.history && student.history.length > 0) {
        var sortedHistory = student.history.slice().reverse();
        for (var hi = 0; hi < sortedHistory.length; hi++) {
            var test = sortedHistory[hi];
            var gradeClass = test.grade >= 7.0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                test.grade >= 5.0 ?
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            historyHtml +=
                '<div class="bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 p-4 rounded-2xl flex justify-between items-center shadow-xs">' +
                '<div><h5 class="font-bold text-gray-800 dark:text-white text-sm">' + test.title +
                '</h5><p class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">' + test.date +
                '</p></div>' +
                '<span class="text-sm font-black px-3 py-1 rounded-xl ' + gradeClass + '">' + test.grade +
                '/10</span></div>';
        }
    } else {
        historyHtml =
            '<div class="empty-state py-8"><i class="fas fa-file-alt"></i><h3>Nenhuma prova registrada</h3></div>';
    }

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-4xl mx-auto w-full">' +
        renderSimpleHeader('Dossiê do Aluno') +
        '<div class="p-6 overflow-y-auto flex-1 space-y-6">' +
        '<div class="gradient-card p-6 rounded-3xl text-white flex items-center gap-6 shadow-md">' +
        '<div class="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-black text-white border-4 border-white/20">' +
        initials + '</div>' +
        '<div><h3 class="text-2xl font-black">' + student.name + '</h3>' +
        '<p class="text-xs font-semibold opacity-80 uppercase mt-0.5">Número: ' + student.number +
        ' | ' + (cls ? cls.name : '') + '</p>' +
        '<div class="flex flex-wrap items-center gap-3 mt-2">' +
        '<span class="text-xs font-semibold opacity-80">Provas: ' + student.testCount + '</span>' +
        '</div></div>' +
        '<div class="ml-auto"><span class="status-badge ' + statusClass + ' text-base px-4 py-2"><i class="fas ' +
        getStatusIcon(student.gpa) + '"></i> ' + getStatusLabel(student.gpa) + '</span></div></div>' +

        '<div class="grid grid-cols-3 gap-4">' +
        '<div class="bg-white dark:bg-slate-700 border dark:border-slate-600 p-4 rounded-2xl text-center"><span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Média</span><p class="text-2xl font-black ' +
        getGradeColor(student.gpa) + '">' + student.gpa + '</p></div>' +
        '<div class="bg-white dark:bg-slate-700 border dark:border-slate-600 p-4 rounded-2xl text-center"><span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Última Nota</span><p class="text-2xl font-black">' +
        student.lastGrade + '</p></div>' +
        '<div class="bg-white dark:bg-slate-700 border dark:border-slate-600 p-4 rounded-2xl text-center"><span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Acertos</span><p class="text-2xl font-black text-[#7aa2a1]">' +
        student.successRate + '%</p></div></div>' +

        '<div><h4 class="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-4">Histórico de Provas</h4><div class="space-y-3">' +
        historyHtml + '</div></div></div></div>';
}

function selectStudent(studentId) {
    var cls = App.selectedClass;
    if (cls) {
        for (var i = 0; i < cls.students.length; i++) {
            if (cls.students[i].id === studentId) {
                App.selectedStudent = cls.students[i];
                App.selectedHistoricalTest = null;
                navigateTo('aluno-detalhe');
                return;
            }
        }
    }
}

function getSortedStudents(list) {
    var result = (list || []).slice();
    var filter = App.activeFilter;
    var search = App.searchQuery.toLowerCase();

    if (filter === 'aprovados') result = result.filter(function(s) { return s.gpa >= NOTA_MINIMA_APROVACAO; });
    else if (filter === 'recuperacao') result = result.filter(function(s) { return s.gpa < NOTA_MINIMA_APROVACAO; });

    if (search) result = result.filter(function(s) { return s.name.toLowerCase().indexOf(search) !== -1; });

    switch (App.activeSort) {
        case 'alfabetica':
            return result.sort(function(a, b) { return a.name.localeCompare(b.name); });
        case 'melhor-desempenho':
            return result.sort(function(a, b) { return b.gpa - a.gpa; });
        case 'pior-desempenho':
            return result.sort(function(a, b) { return a.gpa - b.gpa; });
        default:
            return result;
    }
}

// ============================================================
// NOVA TURMA
// ============================================================
function renderNovaTurma() {
    var tab = App.activeTab || 'config';

    var configHtml =
        '<div class="space-y-6">' +
        '<div class="bg-gray-50 dark:bg-slate-700 p-6 rounded-2xl border dark:border-slate-600">' +
        '<h3 class="text-sm font-black text-gray-700 dark:text-gray-200 mb-4">Configurações da Turma</h3>' +
        '<div class="space-y-4">' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Nome da Turma</label><input type="text" class="input-style" value="' +
        App.novaTurma.nome + '" onchange="App.novaTurma.nome=this.value" placeholder="Ex: 9° Ano B" /></div>' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Nível de Ensino</label><select class="input-style appearance-none" onchange="App.novaTurma.nivel=this.value">' +
        '<option value="Ensino Básico"' + (App.novaTurma.nivel === 'Ensino Básico' ? ' selected' : '') +
        '>Ensino Básico</option>' +
        '<option value="Ensino Secundário"' + (App.novaTurma.nivel === 'Ensino Secundário' ? ' selected' : '') +
        '>Ensino Secundário</option>' +
        '<option value="Ensino Profissional"' + (App.novaTurma.nivel === 'Ensino Profissional' ? ' selected' : '') +
        '>Ensino Profissional</option>' +
        '</select></div>' +
        '<div><label class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Status</label><select class="input-style appearance-none" onchange="App.novaTurma.status=this.value">' +
        '<option value="success"' + (App.novaTurma.status === 'success' ? ' selected' : '') + '>Excelente</option>' +
        '<option value="warning"' + (App.novaTurma.status === 'warning' ? ' selected' : '') + '>Atenção</option>' +
        '<option value="danger"' + (App.novaTurma.status === 'danger' ? ' selected' : '') + '>Crítico</option>' +
        '</select></div>' +
        '</div></div></div>';

    var alunosHtml = '<div class="space-y-6">' +
        '<div class="bg-gray-50 dark:bg-slate-700 p-6 rounded-2xl border dark:border-slate-600">' +
        '<h3 class="text-sm font-black text-gray-700 dark:text-gray-200 mb-4 flex items-center justify-between">' +
        '<span>Alunos (' + (App.novaTurma.alunos || []).length + ')</span>' +
        '<button onclick="adicionarAluno()" class="btn-success text-xs">+ Adicionar</button>' +
        '</h3>';

    if (App.novaTurma.alunos && App.novaTurma.alunos.length > 0) {
        alunosHtml += '<div class="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">';
        for (var ai = 0; ai < App.novaTurma.alunos.length; ai++) {
            var aluno = App.novaTurma.alunos[ai];
            var initials = getInitials(aluno.name || 'Aluno');
            alunosHtml +=
                '<div class="student-card flex items-center justify-between gap-4">' +
                '<div class="flex items-center gap-3">' +
                '<div class="student-avatar-placeholder">' + initials + '</div>' +
                '<div><p class="font-bold text-gray-800 dark:text-white text-sm">' + (aluno.name ||
                    'Novo Aluno') +
                '</p><p class="text-xs text-gray-500 dark:text-gray-400">N° ' + (aluno.number || 0) +
                ' | Média: ' + (aluno.gpa || 0) + '</p></div></div>' +
                '<div class="flex gap-2">' +
                '<button onclick="editarAluno(\'' + aluno.id +
                '\')" class="btn-secondary text-xs py-1 px-3">Editar</button>' +
                '<button onclick="removerAluno(\'' + aluno.id +
                '\')" class="btn-danger text-xs py-1 px-3">Remover</button>' +
                '</div></div>';
        }
        alunosHtml += '</div>';
    } else {
        alunosHtml += '<div class="empty-state"><i class="fas fa-user-plus"></i><h3>Nenhum aluno</h3></div>';
    }
    alunosHtml += '</div></div>';

    var tabsHtml =
        '<div class="flex gap-2 mb-6 border-b dark:border-slate-700 pb-4">' +
        '<button class="tab-button ' + (tab === 'config' ? 'active' : '') +
        '" onclick="App.activeTab=\'config\';render();"><i class="fas fa-cog"></i> Configurações</button>' +
        '<button class="tab-button ' + (tab === 'alunos' ? 'active' : '') +
        '" onclick="App.activeTab=\'alunos\';render();"><i class="fas fa-users"></i> Alunos</button>' +
        '</div>';

    var tabContent = tab === 'config' ? configHtml : alunosHtml;

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-4xl mx-auto w-full">' +
        '<div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">' +
        '<button onclick="navigateTo(\'salas\')" class="text-gray-400 hover:text-black dark:hover:text-white transition-colors"><i class="fas fa-arrow-left text-2xl"></i></button>' +
        '<h2 class="text-lg font-black text-gray-700 dark:text-slate-100">Nova Turma</h2><div class="w-6"></div>' +
        '</div>' +
        '<div class="p-6 flex-1 overflow-y-auto">' +
        tabsHtml +
        tabContent +
        '<div class="mt-6 flex gap-4">' +
        '<button onclick="salvarTurma()" class="flex-1 btn-solid">💾 Salvar Turma</button>' +
        '<button onclick="cancelarTurma()" class="flex-1 btn-secondary">Cancelar</button>' +
        '</div></div></div>';
}

function adicionarAluno() {
    var novoAluno = {
        id: generateId(),
        number: (App.novaTurma.alunos || []).length + 1,
        name: 'Aluno ' + ((App.novaTurma.alunos || []).length + 1),
        gpa: 0,
        lastGrade: 0,
        testCount: 0,
        successRate: 0,
        trend: 'up',
        faltas: 0,
        presencas: 0,
        history: []
    };
    App.novaTurma.alunos.push(novoAluno);
    render();
}

function removerAluno(id) {
    if (confirm('Deseja remover este aluno?')) {
        App.novaTurma.alunos = App.novaTurma.alunos.filter(function(a) { return a.id !== id; });
        for (var i = 0; i < App.novaTurma.alunos.length; i++) {
            App.novaTurma.alunos[i].number = i + 1;
        }
        render();
    }
}

function editarAluno(id) {
    var aluno = null;
    for (var i = 0; i < App.novaTurma.alunos.length; i++) {
        if (App.novaTurma.alunos[i].id === id) {
            aluno = App.novaTurma.alunos[i];
            break;
        }
    }
    if (!aluno) return;

    var novoNome = prompt('Nome do aluno:', aluno.name);
    if (novoNome !== null && novoNome.trim()) {
        aluno.name = novoNome.trim();
    }

    var novaNota = prompt('Média Geral (0-10):', aluno.gpa);
    if (novaNota !== null) {
        var gpa = parseFloat(novaNota);
        if (!isNaN(gpa) && gpa >= 0 && gpa <= 10) {
            aluno.gpa = gpa;
            aluno.lastGrade = gpa;
        }
    }
    render();
}

async function salvarTurma() {
    var nome = App.novaTurma.nome.trim();
    if (!nome) {
        alert('Por favor, insira um nome para a turma.');
        return;
    }

    try {
        const turma = await apiCriarTurma({
            nome: nome,
            nivel: App.novaTurma.nivel,
            status: App.novaTurma.status,
            total_aulas: App.novaTurma.totalAulas || 0
        });

        for (var i = 0; i < App.novaTurma.alunos.length; i++) {
            await apiAdicionarAluno({
                turma_id: turma.id,
                numero: App.novaTurma.alunos[i].number,
                nome: App.novaTurma.alunos[i].name,
                gpa: App.novaTurma.alunos[i].gpa || 0
            });
        }

        App.novaTurma = {
            nome: '',
            nivel: 'Ensino Básico',
            status: 'success',
            totalAulas: 0,
            alunos: [],
            statistics: {
                averageAttendance: '0%',
                worstQuestion: '-',
                mediaTurma: 0,
                aprovados: 0,
                reprovados: 0,
                heatmap: { 'Interpretação': 0, 'Gramática': 0, 'Pontuação': 0, 'Ortografia': 0 }
            }
        };
        App.isCreating = false;
        App.activeTab = 'config';

        await carregarTurmas();
        navigateTo('salas');

    } catch (error) {
        alert('Erro ao salvar turma: ' + error.message);
    }
}

function cancelarTurma() {
    App.novaTurma = {
        nome: '',
        nivel: 'Ensino Básico',
        status: 'success',
        totalAulas: 0,
        alunos: [],
        statistics: {
            averageAttendance: '0%',
            worstQuestion: '-',
            mediaTurma: 0,
            aprovados: 0,
            reprovados: 0,
            heatmap: { 'Interpretação': 0, 'Gramática': 0, 'Pontuação': 0, 'Ortografia': 0 }
        }
    };
    App.isCreating = false;
    App.activeTab = 'config';
    navigateTo('salas');
}

// ============================================================
// RELATÓRIOS (Simplificado)
// ============================================================
function renderRelatorios() {
    var cls = App.selectedClass;
    if (!cls) return '<div class="p-8 text-center">Turma não encontrada</div>';

    var students = cls.students || [];
    var aprovados = students.filter(function(s) { return s.gpa >= NOTA_MINIMA_APROVACAO; }).length;
    var recuperacao = students.filter(function(s) { return s.gpa < NOTA_MINIMA_APROVACAO; }).length;
    var melhor = students.slice().sort(function(a, b) { return b.gpa - a.gpa; })[0] || null;

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-4xl mx-auto w-full">' +
        renderSimpleHeader('Relatórios') +
        '<div class="flex-1 p-6 overflow-y-auto space-y-6">' +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">' +
        '<div class="bg-white dark:bg-slate-700 p-5 rounded-3xl border text-center"><span class="text-xs text-gray-400 uppercase font-bold">Média</span><h4 class="text-3xl font-black">' +
        cls.average + '</h4></div>' +
        '<div class="bg-white dark:bg-slate-700 p-5 rounded-3xl border text-center"><span class="text-xs text-gray-400 uppercase font-bold">Aprovados</span><h4 class="text-3xl font-black text-green-500">' +
        aprovados + '</h4></div>' +
        '<div class="bg-white dark:bg-slate-700 p-5 rounded-3xl border text-center"><span class="text-xs text-gray-400 uppercase font-bold">Recuperação</span><h4 class="text-3xl font-black text-red-500">' +
        recuperacao + '</h4></div>' +
        '<div class="gradient-card p-5 rounded-3xl text-white text-center"><span class="text-xs uppercase font-bold opacity-90">Melhor</span><h4 class="text-sm font-black">' +
        (melhor ? melhor.name : '-') + '</h4></div></div>' +
        '<div class="bg-gray-50 dark:bg-slate-700 p-6 rounded-3xl border"><h4 class="text-xs font-black uppercase text-gray-400 mb-4">Alunos</h4>' +
        students.map(function(s) {
            return '<div class="flex justify-between items-center p-3 border-b dark:border-slate-600 last:border-0"><span>' +
                s.name + '</span><span class="font-bold ' + getGradeColor(s.gpa) + '">' + s.gpa +
                '</span></div>';
        }).join('') +
        '</div></div></div>';
}

// ============================================================
// FUNÇÕES AUXILIARES (Import, Scan, etc - Simplificadas)
// ============================================================
function renderImport() {
    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-3xl mx-auto w-full">' +
        renderSimpleHeader('Importar Gabarito') +
        '<div class="flex-1 p-6 flex flex-col items-center justify-center">' +
        '<div onclick="document.getElementById(\'importInput\').click()" class="w-full max-w-md p-8 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#e8f1f1]/30 transition-all border-[#7aa2a1]">' +
        '<i class="fas fa-upload text-5xl text-[#7aa2a1] mb-4"></i>' +
        '<h2 class="text-xl font-black tracking-widest text-center uppercase text-[#7aa2a1]">Adicionar Gabarito</h2>' +
        '<p class="text-gray-400 text-xs mt-2 text-center">Selecione a imagem do gabarito oficial</p>' +
        '</div><input type="file" id="importInput" class="hidden" accept="image/*" onchange="handleImportUpload(event)" />' +
        '</div></div>';
}

function handleImportUpload(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onloadend = function() {
            App.officialGabarito = {
                dataUrl: reader.result,
                mimeType: file.type,
                base64: reader.result.split(',')[1]
            };
            App.mensagemToast = 'Gabarito importado com sucesso!';
            App.showSyncSuccess = true;
            render();
            setTimeout(function() {
                App.showSyncSuccess = false;
                navigateTo('dashboard');
            }, 1500);
        };
        reader.readAsDataURL(file);
    }
}

// ============================================================
// SCAN (Simplificado)
// ============================================================
function renderScan() {
    return '<div class="flex-1 flex flex-col bg-[#0a0a0a] text-white w-full max-w-4xl mx-auto">' +
        '<div class="p-6 flex justify-between items-center bg-black/40">' +
        '<button onclick="stopScan();navigateTo(\'dashboard\');" class="text-white hover:bg-white/10 p-2 rounded-full transition-colors"><i class="fas fa-arrow-left text-2xl"></i></button>' +
        '<h2 class="text-sm font-bold tracking-widest uppercase">Digitalizar Prova</h2><div class="w-10"></div>' +
        '</div>' +
        '<div class="flex-1 flex flex-col items-center justify-center p-6">' +
        '<div class="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-black flex items-center justify-center border-4 border-[#7aa2a1]">' +
        '<video id="scanVideo" autoplay playsinline class="w-full h-full object-cover"></video>' +
        '<div class="scan-line"></div><div class="scan-overlay"></div></div>' +
        '<canvas id="scanCanvas" class="hidden"></canvas>' +
        '<div class="mt-8 flex flex-col items-center gap-4 w-full max-w-sm">' +
        '<button onclick="captureScan()" class="w-20 h-20 bg-white border-8 border-gray-400/40 rounded-full hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center shadow-lg"><div class="w-10 h-10 bg-[#7aa2a1] rounded-full"></div></button>' +
        '<button onclick="document.getElementById(\'scanFallback\').click()" class="w-full py-3.5 bg-gray-800 border border-gray-700 text-white font-bold rounded-xl text-xs tracking-widest hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"><i class="fas fa-camera"></i> CARREGAR FICHEIRO</button>' +
        '<input type="file" id="scanFallback" class="hidden" accept="image/*" onchange="handleScanFallback(event)" />' +
        '</div></div></div>';
}

function initScan() {
    var video = document.getElementById('scanVideo');
    if (video) {
        startScan();
    }
}

function startScan() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function(stream) {
                App.scanStream = stream;
                var video = document.getElementById('scanVideo');
                if (video) {
                    video.srcObject = stream;
                }
            })
            .catch(function(err) {
                console.warn('Câmara indisponível:', err);
            });
    }
}

function stopScan() {
    if (App.scanStream) {
        App.scanStream.getTracks().forEach(function(track) { track.stop(); });
        App.scanStream = null;
    }
}

function captureScan() {
    var video = document.getElementById('scanVideo');
    var canvas = document.getElementById('scanCanvas');
    if (video && canvas) {
        var ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var dataUrl = canvas.toDataURL('image/jpeg');
        stopScan();
        App.studentGabarito = {
            dataUrl: dataUrl,
            mimeType: 'image/jpeg',
            base64: dataUrl.split(',')[1]
        };
        navigateTo('confirm');
    }
}

function handleScanFallback(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onloadend = function() {
            App.studentGabarito = {
                dataUrl: reader.result,
                mimeType: file.type,
                base64: reader.result.split(',')[1]
            };
            stopScan();
            navigateTo('confirm');
        };
        reader.readAsDataURL(file);
    }
}

// ============================================================
// CONFIRM (Simplificado)
// ============================================================
function renderConfirm() {
    var image = App.studentGabarito;

    return '<div class="flex-1 flex flex-col bg-black/95 relative max-w-3xl mx-auto w-full">' +
        '<div class="p-6 flex justify-between z-10">' +
        '<button onclick="navigateTo(\'dashboard\')" class="text-white hover:bg-white/10 p-2 rounded-full transition-colors"><i class="fas fa-arrow-left text-2xl"></i></button>' +
        '<span class="text-white/60 font-bold text-sm tracking-widest self-center uppercase">Confirmar Captura</span><div class="w-10"></div>' +
        '</div>' +
        '<div class="flex-1 flex flex-col items-center justify-center z-10 p-6">' +
        '<div class="bg-white p-4 rounded-2xl shadow-2xl mb-8 max-w-sm w-full overflow-hidden">' +
        (image && image.dataUrl ? '<img src="' + image.dataUrl +
            '" alt="Capturado" class="w-full aspect-[3/4] object-contain rounded-lg" />' :
            '<div class="border border-gray-300 rounded-lg p-4 bg-white text-center text-gray-400">Nenhuma imagem</div>') +
        '</div>' +
        '<button onclick="handleConfirm()" class="bg-[#7aa2a1] hover:bg-[#688f8e] text-white font-bold py-4 px-12 rounded-xl shadow-lg transition-all">CONFIRMAR</button>' +
        '</div></div>';
}

function handleConfirm() {
    navigateTo('results');
}

// ============================================================
// RESULTS, COMPARE, TIPS, CHARTS, DISCURSIVE, AI_RESULT (Simplificados)
// ============================================================
function renderResults() {
    var hasOfficial = App.officialGabarito !== null;
    var hasStudent = App.studentGabarito !== null;

    var classOptions = '';
    for (var ci = 0; ci < App.classes.length; ci++) {
        classOptions += '<option value="' + App.classes[ci].id + '">' + App.classes[ci].name + '</option>';
    }

    var targetClass = null;
    for (var i = 0; i < App.classes.length; i++) {
        if (App.classes[i].id === App.selectedTargetClass) {
            targetClass = App.classes[i];
            break;
        }
    }
    if (!targetClass) targetClass = { students: [] };

    var studentOptions = '';
    for (var si = 0; si < targetClass.students.length; si++) {
        var s = targetClass.students[si];
        studentOptions += '<option value="' + s.id + '">' + s.name + ' (Nº ' + s.number + ')</option>';
    }

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-3xl mx-auto w-full">' +
        renderSimpleHeader('Correção Automática') +
        '<div class="flex-1 p-6 flex flex-col justify-center items-center">' +
        '<div class="w-full max-w-md bg-gray-50 dark:bg-slate-700 border rounded-3xl p-6 mb-6">' +
        '<h3 class="font-bold text-gray-700 dark:text-slate-200 text-sm mb-4 uppercase">Configuração</h3>' +
        '<div class="space-y-4">' +
        '<div><label class="text-xs font-bold text-gray-500 mb-1 block">Turma:</label>' +
        '<select class="w-full py-2.5 px-3 rounded-xl border dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none" onchange="App.selectedTargetClass=this.value;render();">' +
        classOptions + '</select></div>' +
        '<div><label class="text-xs font-bold text-gray-500 mb-1 block">Aluno:</label>' +
        '<select class="w-full py-2.5 px-3 rounded-xl border dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none" onchange="App.selectedTargetStudent=this.value">' +
        studentOptions + '</select></div></div></div>' +
        '<div class="w-full max-w-md bg-gray-50 dark:bg-slate-700 border rounded-2xl p-6 mb-6">' +
        '<div class="flex items-center justify-between mb-4 pb-3 border-b">' +
        '<span class="text-xs font-bold uppercase">Gabarito Oficial</span>' +
        (hasOfficial ? '<span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ PRONTO</span>' :
            '<button onclick="navigateTo(\'import\')" class="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full">CARREGAR</button>') +
        '</div><div class="flex items-center justify-between">' +
        '<span class="text-xs font-bold uppercase">Prova do Aluno</span>' +
        (hasStudent ? '<span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ PRONTO</span>' :
            '<button onclick="navigateTo(\'scan\')" class="text-xs bg-gray-100 dark:bg-slate-600 px-3 py-1 rounded-lg">DIGITALIZAR</button>') +
        '</div></div>' +
        '<button onclick="handleAiCorrection()" ' + ((App.isLoading || !hasOfficial || !hasStudent) ? 'disabled' : '') +
        ' class="w-full max-w-md py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ' +
        ((App.isLoading || !hasOfficial || !hasStudent) ?
            'bg-gray-300 cursor-not-allowed' :
            'bg-[#7aa2a1] hover:bg-[#688f8e]') +
        '">' +
        (App.isLoading ? '<i class="fas fa-sync-alt animate-spin"></i> A CORRIGIR...' :
            '<i class="fas fa-check-circle"></i> INICIAR CORREÇÃO') +
        '</button></div></div>';
}

function handleAiCorrection() {
    if (!App.officialGabarito) {
        alert('Carregue o Gabarito Oficial primeiro.');
        return;
    }
    if (!App.studentGabarito) {
        alert('Digitalize a prova do Aluno.');
        return;
    }

    App.isLoading = true;
    render();

    setTimeout(function() {
        var grade = (Math.random() * 4 + 6);
        var correctCount = Math.floor(Math.random() * 10) + 10;

        App.lastCorrectionData = {
            studentName: "Aluno",
            grade: grade.toFixed(1),
            correctCount: correctCount,
            wrongCount: 20 - correctCount,
            mainDifficulty: 'Interpretação de Texto',
            tipsList: [
                { title: "Revisão de Conteúdo", desc: "Praticar mais exercícios de interpretação textual." },
                { title: "Exercícios Complementares", desc: "Resolver questões de provas anteriores." }
            ]
        };

        App.isLoading = false;
        App.mensagemToast = 'Correção realizada! Nota: ' + grade.toFixed(1);
        App.showSyncSuccess = true;
        render();
        setTimeout(function() {
            App.showSyncSuccess = false;
            navigateTo('tips');
        }, 2000);
    }, 1500);
}

function renderCompare() {
    var hasOfficial = App.officialGabarito !== null;
    var hasStudent = App.studentGabarito !== null;

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-4xl mx-auto w-full">' +
        renderSimpleHeader('Comparação') +
        '<div class="flex-1 p-6 flex flex-col md:flex-row gap-6 justify-center">' +
        '<div class="flex-1 bg-white dark:bg-slate-800 p-6 shadow-md rounded-2xl flex flex-col items-center">' +
        '<h3 class="font-bold text-xs mb-4 uppercase text-[#7aa2a1] border-b w-full text-center pb-2">GABARITO DO PROFESSOR</h3>' +
        (hasOfficial ? '<img src="' + App.officialGabarito.dataUrl + '" class="w-full max-h-[400px] object-contain rounded-lg border">' :
            '<div class="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 border-2 border-dashed rounded-xl w-full min-h-[250px]"><i class="fas fa-image text-5xl mb-2"></i><p class="text-xs text-center">Nenhum gabarito</p></div>') +
        '</div>' +
        '<div class="flex-1 bg-white dark:bg-slate-800 p-6 shadow-md rounded-2xl flex flex-col items-center">' +
        '<h3 class="font-bold text-xs mb-4 uppercase text-[#7aa2a1] border-b w-full text-center pb-2">PROVA DO ALUNO</h3>' +
        (hasStudent ? '<img src="' + App.studentGabarito.dataUrl + '" class="w-full max-h-[400px] object-contain rounded-lg border">' :
            '<div class="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 border-2 border-dashed rounded-xl w-full min-h-[250px]"><i class="fas fa-qrcode text-5xl mb-2"></i><p class="text-xs text-center">Nenhuma prova</p></div>') +
        '</div></div></div>';
}

function renderTips() {
    var data = App.lastCorrectionData || {
        studentName: 'Aluno',
        grade: 0,
        mainDifficulty: 'Aguardando correção',
        tipsList: [
            { title: "Realize uma correção", desc: "Use a ferramenta de correção automática." },
            { title: "Analise os resultados", desc: "Verifique os pontos fortes." }
        ]
    };

    var tipsHtml = '';
    for (var i = 0; i < data.tipsList.length; i++) {
        tipsHtml += '<div class="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border">' +
            '<h4 class="font-bold text-gray-800 dark:text-white mb-1">' + data.tipsList[i].title +
            '</h4><p class="text-gray-600 dark:text-slate-400">' + data.tipsList[i].desc +
            '</p></div>';
    }

    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-3xl mx-auto w-full">' +
        renderSimpleHeader('Sugestões') +
        '<div class="p-6 overflow-y-auto">' +
        '<div class="bg-yellow-50/50 dark:bg-slate-900 border border-yellow-200 dark:border-slate-700 rounded-2xl p-6 mb-8 text-center">' +
        '<h2 class="text-sm font-bold text-yellow-800 dark:text-yellow-400 uppercase">Dificuldade em <strong>' +
        data.mainDifficulty + '</strong></h2></div>' +
        '<h3 class="text-gray-400 font-bold text-xs uppercase mb-4">Recomendações</h3>' +
        '<div class="space-y-6">' + tipsHtml + '</div></div></div>';
}

function renderCharts() {
    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-3xl mx-auto w-full">' +
        renderSimpleHeader('Gráficos') +
        '<div class="flex-1 p-6 flex items-center justify-center">' +
        '<div class="text-center text-gray-400"><i class="fas fa-chart-bar text-6xl mb-4"></i><p>Gráficos em desenvolvimento</p></div>' +
        '</div></div>';
}

function renderDiscursive() {
    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-3xl mx-auto w-full">' +
        renderSimpleHeader('Correção Discursiva') +
        '<div class="flex-1 p-6 flex items-center justify-center">' +
        '<div class="text-center text-gray-400"><i class="fas fa-pen text-6xl mb-4"></i><p>Correção discursiva com IA em desenvolvimento</p></div>' +
        '</div></div>';
}

function renderAiResult() {
    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-3xl mx-auto w-full">' +
        renderSimpleHeader('Resultado IA') +
        '<div class="flex-1 p-6 overflow-y-auto">' +
        '<div class="bg-[#e8f1f1] dark:bg-slate-700/50 p-6 rounded-2xl border">' +
        '<h3 class="font-bold text-gray-800 dark:text-white mb-4">Resultado da Avaliação</h3>' +
        '<p class="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">' +
        (App.aiResult || 'Nenhum resultado disponível.') +
        '</p></div>' +
        '<button onclick="navigateTo(\'dashboard\')" class="mt-8 w-full btn-solid">Voltar</button>' +
        '</div></div>';
}

function renderAplicarProva() {
    return '<div class="flex-1 flex flex-col bg-white dark:bg-slate-800 max-w-3xl mx-auto w-full">' +
        renderSimpleHeader('Aplicar Prova') +
        '<div class="flex-1 p-6 flex items-center justify-center">' +
        '<div class="text-center text-gray-400"><i class="fas fa-qrcode text-6xl mb-4"></i><p>Funcionalidade em desenvolvimento</p></div>' +
        '</div></div>';
}

// ============================================================
// INICIAR APLICAÇÃO
// ============================================================
// A função de inicialização já está no DOMContentLoaded acima