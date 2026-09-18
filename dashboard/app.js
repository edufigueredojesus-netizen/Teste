// Configurações globais do Chart.js para o Dark Theme
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';
Chart.defaults.font.family = "'Inter', sans-serif";

// Variáveis de estado
let currentData = [...ocorrenciasData];
let charts = {};

// Elementos do DOM
const elements = {
    filterBairro: document.getElementById('filter-bairro'),
    filterTipo: document.getElementById('filter-tipo'),
    btnReset: document.getElementById('btn-reset'),
    
    kpiTotalBos: document.getElementById('kpi-total-bos'),
    kpiTotalVitimas: document.getElementById('kpi-total-vitimas'),
    kpiValor: document.getElementById('kpi-valor'),
    kpiBairroPrincipal: document.getElementById('kpi-bairro-principal')
};

// Formatação de Moeda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    populateFilters();
    updateDashboard();
    setupEventListeners();
});

// Popula os selects de filtros
function populateFilters() {
    const bairros = [...new Set(ocorrenciasData.map(d => d['Bairro_Regiao']).filter(b => b))].sort();
    const tipos = [...new Set(ocorrenciasData.map(d => d['Tipo_Ocorrencia']).filter(t => t))].sort();

    bairros.forEach(bairro => {
        const option = document.createElement('option');
        option.value = bairro;
        option.textContent = bairro;
        elements.filterBairro.appendChild(option);
    });

    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        elements.filterTipo.appendChild(option);
    });
}

// Configura os Listeners dos Filtros
function setupEventListeners() {
    elements.filterBairro.addEventListener('change', handleFilterChange);
    elements.filterTipo.addEventListener('change', handleFilterChange);
    
    elements.btnReset.addEventListener('click', () => {
        elements.filterBairro.value = 'todos';
        elements.filterTipo.value = 'todos';
        handleFilterChange();
    });
}

function handleFilterChange() {
    const bairro = elements.filterBairro.value;
    const tipo = elements.filterTipo.value;

    currentData = ocorrenciasData.filter(d => {
        const matchBairro = bairro === 'todos' || d['Bairro_Regiao'] === bairro;
        const matchTipo = tipo === 'todos' || d['Tipo_Ocorrencia'] === tipo;
        return matchBairro && matchTipo;
    });

    updateDashboard();
}

// Atualiza KPIs e Gráficos
function updateDashboard() {
    updateKPIs();
    updateCharts();
}

// Atualiza os Indicadores (KPIs)
function updateKPIs() {
    const totalBos = currentData.length;
    const totalVitimas = currentData.reduce((acc, curr) => acc + (parseInt(curr['Qtd_Vitimas']) || 0), 0);
    const valorTotal = currentData.reduce((acc, curr) => acc + (parseFloat(curr['Valor_Apreendido_R$']) || 0), 0);
    
    elements.kpiTotalBos.textContent = totalBos;
    elements.kpiTotalVitimas.textContent = totalVitimas;
    elements.kpiValor.textContent = formatCurrency(valorTotal);

    // Bairro Principal
    const bairroCount = {};
    currentData.forEach(d => {
        const b = d['Bairro_Regiao'];
        if (b) {
            bairroCount[b] = (bairroCount[b] || 0) + 1;
        }
    });
    
    let principal = '-';
    let max = 0;
    for (const [b, count] of Object.entries(bairroCount)) {
        if (count > max) {
            max = count;
            principal = b;
        }
    }
    elements.kpiBairroPrincipal.textContent = principal;
}

// Atualiza Gráficos
function updateCharts() {
    renderTimelineChart();
    renderTipoChart();
    renderBairroChart();
}

// Gráfico de Linha do Tempo
function renderTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    
    // Agrupar por data
    const dateCount = {};
    currentData.forEach(d => {
        if (!d['Data_Hora']) return;
        const dateObj = new Date(d['Data_Hora'].replace(' ', 'T')); // Handle format
        if(isNaN(dateObj)) return;
        
        const dateStr = dateObj.toLocaleDateString('pt-BR');
        dateCount[dateStr] = (dateCount[dateStr] || 0) + 1;
    });

    // Ordenar datas
    const sortedDates = Object.keys(dateCount).sort((a, b) => {
        const [d1, m1, y1] = a.split('/');
        const [d2, m2, y2] = b.split('/');
        return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
    });

    const data = sortedDates.map(date => dateCount[date]);

    if (charts.timeline) charts.timeline.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    charts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Ocorrências por Dia',
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: gradient,
                borderWidth: 2,
                pointBackgroundColor: '#0b0f19',
                pointBorderColor: '#3b82f6',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Gráfico de Rosca (Tipos de Ocorrência)
function renderTipoChart() {
    const ctx = document.getElementById('tipoChart').getContext('2d');
    
    const tipoCount = {};
    currentData.forEach(d => {
        const t = d['Tipo_Ocorrencia'];
        if(t) tipoCount[t] = (tipoCount[t] || 0) + 1;
    });

    // Ordenar por volume e pegar os top 5 para não poluir
    const sortedTipos = Object.entries(tipoCount).sort((a, b) => b[1] - a[1]);
    
    let labels = sortedTipos.slice(0, 5).map(i => i[0]);
    let data = sortedTipos.slice(0, 5).map(i => i[1]);
    
    if (sortedTipos.length > 5) {
        const othersCount = sortedTipos.slice(5).reduce((acc, curr) => acc + curr[1], 0);
        labels.push('OUTROS');
        data.push(othersCount);
    }

    if (charts.tipo) charts.tipo.destroy();

    charts.tipo = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#64748b'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } }
            }
        }
    });
}

// Gráfico de Barras (Top Bairros)
function renderBairroChart() {
    const ctx = document.getElementById('bairroChart').getContext('2d');
    
    const bairroCount = {};
    currentData.forEach(d => {
        const b = d['Bairro_Regiao'];
        if(b) bairroCount[b] = (bairroCount[b] || 0) + 1;
    });

    const sortedBairros = Object.entries(bairroCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    const labels = sortedBairros.map(i => i[0]);
    const data = sortedBairros.map(i => i[1]);

    if (charts.bairro) charts.bairro.destroy();

    charts.bairro = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ocorrências',
                data: data,
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}
