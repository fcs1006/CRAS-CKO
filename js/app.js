// ==========================================================================
// CORE LOGIC - SISTEMA CRAS (SUAS DIGITAL)
// ==========================================================================

let mapInstance = null;
let vulnerabilityChartInstance = null;
let neighborhoodChartInstance = null;
let activeFamilyIdForDetail = null;

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

// Inicialização Principal
function initApp() {
    setupRouting();
    updateDashboardStats();
    loadDashboardRecentData();
    renderFamiliesTable();
    renderAppointmentsTable();
    renderBenefitsTable();
    renderSCFVGroups();
    renderReferralsTable();
    populateSelectFamilies();
    
    // Inicializar o Mapa do Leaflet na primeira vez que a aba for aberta
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", (e) => {
            const target = item.getAttribute("data-target");
            if (target === "map") {
                // Atraso curto para permitir que o container do Leaflet se ajuste ao layout
                setTimeout(() => {
                    initMap();
                }, 100);
            }
        });
    });
}

// ==========================================================================
// ROTEAMENTO DE TELA (SPA)
// ==========================================================================
function setupRouting() {
    const menuItems = document.querySelectorAll(".menu-item");
    const screens = document.querySelectorAll(".screen-view");

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Remover active de todos os links e telas
            menuItems.forEach(i => i.classList.remove("active"));
            screens.forEach(s => s.classList.remove("active"));
            
            // Adicionar active na seleção
            item.classList.add("active");
            const targetScreenId = `screen-${item.getAttribute("data-target")}`;
            const targetScreen = document.getElementById(targetScreenId);
            if (targetScreen) {
                targetScreen.classList.add("active");
            }
            
            // Ações específicas por tela
            if (item.getAttribute("data-target") === "dashboard") {
                updateDashboardStats();
                loadDashboardRecentData();
            } else if (item.getAttribute("data-target") === "families") {
                renderFamiliesTable();
            } else if (item.getAttribute("data-target") === "appointments") {
                renderAppointmentsTable();
            } else if (item.getAttribute("data-target") === "benefits") {
                renderBenefitsTable();
            } else if (item.getAttribute("data-target") === "scfv") {
                renderSCFVGroups();
            } else if (item.getAttribute("data-target") === "referrals") {
                renderReferralsTable();
            } else if (item.getAttribute("data-target") === "rma") {
                generateRMA();
            }
        });
    });
}

// ==========================================================================
// CONTROLE DO LOCALSTORAGE / BANCO DE DADOS LOCAL
// ==========================================================================
function getFamilies() {
    return JSON.parse(localStorage.getItem("cras_families")) || [];
}

function saveFamilies(families) {
    localStorage.setItem("cras_families", JSON.stringify(families));
    populateSelectFamilies();
}

function getGroups() {
    return JSON.parse(localStorage.getItem("cras_groups")) || [];
}

function saveGroups(groups) {
    localStorage.setItem("cras_groups", JSON.stringify(groups));
}

function getReferrals() {
    return JSON.parse(localStorage.getItem("cras_referrals")) || [];
}

function saveReferrals(referrals) {
    localStorage.setItem("cras_referrals", JSON.stringify(referrals));
}

// ==========================================================================
// CONTROLE DE MODAIS
// ==========================================================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
        
        // Tratar selects dinâmicos ao abrir modal específico
        if (modalId === "modal-add-appointment") {
            populateSelectOptions("app-family");
        } else if (modalId === "modal-add-benefit") {
            populateSelectOptions("ben-family");
            checkBenefitDuplication(); // Reseta aviso
        } else if (modalId === "modal-add-referral") {
            populateSelectOptions("ref-family-select");
            updateBeneficiaryOptions();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
    }
}

// Preencher selects com a lista de famílias cadastradas
function populateSelectFamilies() {
    // Essa função ajuda a garantir que os selects estejam sincronizados
}

function populateSelectOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const families = getFamilies();
    select.innerHTML = '<option value="">Selecione uma família...</option>';
    
    families.forEach(f => {
        const option = document.createElement("option");
        option.value = f.id;
        option.textContent = `${f.responsavel} (NIS: ${f.nisResponsavel})`;
        select.appendChild(option);
    });
}

// ==========================================================================
// INDICADORES & GRÁFICOS (DASHBOARD)
// ==========================================================================
function updateDashboardStats() {
    const families = getFamilies();
    const referrals = getReferrals();
    
    // Contagens
    const totalFamilies = families.length;
    const paifCount = families.filter(f => f.acompanhamentoPAIF && f.acompanhamentoPAIF.ativo).length;
    
    let totalBenefits = 0;
    families.forEach(f => {
        if (f.beneficiosConcedidos) {
            totalBenefits += f.beneficiosConcedidos.length;
        }
    });
    
    const activeReferrals = referrals.filter(r => r.status === "Pendente").length;
    
    // Setar no HTML
    document.getElementById("stat-families-count").textContent = totalFamilies;
    document.getElementById("stat-paif-count").textContent = paifCount;
    document.getElementById("stat-benefits-count").textContent = totalBenefits;
    document.getElementById("stat-referrals-count").textContent = activeReferrals;
    
    // Atualizar Gráficos
    renderVulnerabilityChart(families);
    renderNeighborhoodChart(families);
}

function loadDashboardRecentData() {
    const families = getFamilies();
    const groups = getGroups();
    
    // Atendimentos recentes
    const recentTable = document.getElementById("dashboard-recent-atendimentos");
    recentTable.innerHTML = "";
    
    let allAtendimentos = [];
    families.forEach(f => {
        if (f.historicoAtendimentos) {
            f.historicoAtendimentos.forEach(at => {
                allAtendimentos.push({
                    familyId: f.id,
                    responsavel: f.responsavel,
                    ...at
                });
            });
        }
    });
    
    // Ordenar por data decrescente
    allAtendimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Limitar a 5
    const latestAtendimentos = allAtendimentos.slice(0, 5);
    
    if (latestAtendimentos.length === 0) {
        recentTable.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhum atendimento registrado.</td></tr>`;
    } else {
        latestAtendimentos.forEach(at => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${formatDate(at.data)}</td>
                <td><strong>${at.responsavel}</strong></td>
                <td>${at.tecnico}</td>
                <td><span class="badge badge-info">${at.tipo}</span></td>
                <td>
                    <button class="btn btn-secondary btn-icon-only" onclick="viewFamilyProntuario('${at.familyId}')" title="Ver Prontuário">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                </td>
            `;
            recentTable.appendChild(tr);
        });
    }
    
    // Oficinas ativas
    const groupsTable = document.getElementById("dashboard-recent-groups");
    groupsTable.innerHTML = "";
    
    if (groups.length === 0) {
        groupsTable.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">Nenhuma oficina ativa.</td></tr>`;
    } else {
        groups.slice(0, 4).forEach(g => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${g.nome}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${g.tecnicoResponsavel}</span></td>
                <td><span class="badge badge-success">${g.participantes.length} Participantes</span></td>
            `;
            groupsTable.appendChild(tr);
        });
    }
}

// Gráficos Chart.js
function renderVulnerabilityChart(families) {
    const canvas = document.getElementById("chart-vulnerabilities");
    if (!canvas) return;
    
    // Destruir instância anterior se houver
    if (vulnerabilityChartInstance) {
        vulnerabilityChartInstance.destroy();
    }
    
    // Contar vulnerabilidades
    const counts = {};
    families.forEach(f => {
        if (f.vulnerabilidades) {
            f.vulnerabilidades.forEach(vul => {
                counts[vul] = (counts[vul] || 0) + 1;
            });
        }
    });
    
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    
    if (labels.length === 0) {
        labels.push("Nenhuma Registrada");
        data.push(0);
    }
    
    vulnerabilityChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#e71d36', // Extrema Pobreza
                    '#ff9f1c', // Habitação Precária
                    '#2ec4b6', // Ausência de Saneamento
                    '#0077b6', // PcD
                    '#9bc53d', // Mãe Solo
                    '#7209b7', // Crianças fora da escola
                    '#f72585', // Violência
                    '#4cc9f0'  // Analfabetismo
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

function renderNeighborhoodChart(families) {
    const canvas = document.getElementById("chart-neighborhoods");
    if (!canvas) return;
    
    if (neighborhoodChartInstance) {
        neighborhoodChartInstance.destroy();
    }
    
    const counts = {};
    families.forEach(f => {
        if (f.bairro) {
            counts[f.bairro] = (counts[f.bairro] || 0) + 1;
        }
    });
    
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    
    neighborhoodChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Famílias',
                data: data,
                backgroundColor: 'rgba(43, 122, 120, 0.75)',
                borderColor: '#2b7a78',
                borderWidth: 1.5,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ==========================================================================
// TELA: FAMÍLIAS / PRONTUÁRIO SUAS
// ==========================================================================
function renderFamiliesTable() {
    const families = getFamilies();
    const tableBody = document.getElementById("families-table-body");
    tableBody.innerHTML = "";
    
    if (families.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhuma família cadastrada no sistema.</td></tr>`;
        return;
    }
    
    families.forEach(f => {
        const perCapita = calculatePerCapitaIncome(f);
        const paifStatus = f.acompanhamentoPAIF && f.acompanhamentoPAIF.ativo 
            ? `<span class="badge badge-success">Sim (Ativo)</span>` 
            : `<span class="badge badge-neutral">Não</span>`;
            
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><code>${f.codFamiliar}</code></td>
            <td><strong>${f.responsavel}</strong></td>
            <td><span style="font-size:0.8rem; color:var(--text-muted);">${f.cpfResponsavel}</span><br><span style="font-size:0.75rem; color:var(--primary-light);">${f.nisResponsavel}</span></td>
            <td>${f.logradouro}, ${f.numero} - ${f.bairro}</td>
            <td><strong>R$ ${perCapita.toFixed(2)}</strong></td>
            <td style="text-align:center;">${f.membros ? f.membros.length : 1}</td>
            <td>${paifStatus}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary btn-icon-only" onclick="viewFamilyProntuario('${f.id}')" title="Ver Prontuário Completo">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    <button class="btn btn-secondary btn-icon-only" onclick="togglePAIFStatus('${f.id}')" title="Iniciar/Parar PAIF">
                        <i class="fa-solid fa-sync-alt"></i>
                    </button>
                    <button class="btn btn-danger btn-icon-only" onclick="deleteFamily('${f.id}')" title="Excluir Família">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function calculatePerCapitaIncome(family) {
    if (!family.membros || family.membros.length === 0) return 0;
    const totalIncome = family.membros.reduce((sum, m) => sum + parseFloat(m.renda || 0), 0);
    return totalIncome / family.membros.length;
}

function filterFamilies() {
    const searchText = document.getElementById("filter-family-search").value.toLowerCase();
    const vulnerabilityFilter = document.getElementById("filter-family-vulnerability").value;
    
    const families = getFamilies();
    const tableBody = document.getElementById("families-table-body");
    tableBody.innerHTML = "";
    
    const filtered = families.filter(f => {
        const matchesText = f.responsavel.toLowerCase().includes(searchText) || 
                            f.cpfResponsavel.includes(searchText) || 
                            f.nisResponsavel.includes(searchText) ||
                            f.codFamiliar.includes(searchText);
                            
        const matchesVul = vulnerabilityFilter === "" || (f.vulnerabilidades && f.vulnerabilidades.includes(vulnerabilityFilter));
        
        return matchesText && matchesVul;
    });
    
    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhuma família corresponde aos filtros informados.</td></tr>`;
        return;
    }
    
    filtered.forEach(f => {
        const perCapita = calculatePerCapitaIncome(f);
        const paifStatus = f.acompanhamentoPAIF && f.acompanhamentoPAIF.ativo 
            ? `<span class="badge badge-success">Sim (Ativo)</span>` 
            : `<span class="badge badge-neutral">Não</span>`;
            
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><code>${f.codFamiliar}</code></td>
            <td><strong>${f.responsavel}</strong></td>
            <td><span style="font-size:0.8rem; color:var(--text-muted);">${f.cpfResponsavel}</span><br><span style="font-size:0.75rem; color:var(--primary-light);">${f.nisResponsavel}</span></td>
            <td>${f.logradouro}, ${f.numero} - ${f.bairro}</td>
            <td><strong>R$ ${perCapita.toFixed(2)}</strong></td>
            <td style="text-align:center;">${f.membros ? f.membros.length : 1}</td>
            <td>${paifStatus}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary btn-icon-only" onclick="viewFamilyProntuario('${f.id}')" title="Ver Prontuário">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    <button class="btn btn-secondary btn-icon-only" onclick="togglePAIFStatus('${f.id}')" title="Iniciar/Parar PAIF">
                        <i class="fa-solid fa-sync-alt"></i>
                    </button>
                    <button class="btn btn-danger btn-icon-only" onclick="deleteFamily('${f.id}')" title="Excluir Família">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Salvar Nova Família (Formulário)
function saveNewFamily(e) {
    e.preventDefault();
    
    const name = document.getElementById("fam-name").value;
    const cpf = document.getElementById("fam-cpf").value;
    const nis = document.getElementById("fam-nis").value;
    const phone = document.getElementById("fam-phone").value;
    const street = document.getElementById("fam-street").value;
    const number = document.getElementById("fam-number").value;
    const neighborhood = document.getElementById("fam-neighborhood").value;
    const lat = parseFloat(document.getElementById("fam-lat").value);
    const lng = parseFloat(document.getElementById("fam-lng").value);
    const houseType = document.getElementById("fam-house-type").value;
    const water = document.getElementById("fam-water").value;
    const sanitation = document.getElementById("fam-sanitation").value;
    const garbage = document.getElementById("fam-garbage").value;
    
    // Obter vulnerabilidades selecionadas
    const checkboxes = document.querySelectorAll('input[name="vulnerabilities"]:checked');
    const vulnerabilities = [];
    checkboxes.forEach(cb => vulnerabilities.push(cb.value));
    
    const families = getFamilies();
    
    const newFamilyId = "fam-" + Date.now();
    const codFamiliar = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    const newFamily = {
        id: newFamilyId,
        codFamiliar: codFamiliar,
        responsavel: name,
        cpfResponsavel: cpf,
        nisResponsavel: nis,
        logradouro: street,
        numero: number,
        bairro: neighborhood,
        municipio: "Salvador",
        uf: "BA",
        telefone: phone,
        latitude: lat,
        longitude: lng,
        moradia: {
            tipo: houseType,
            abastecimentoAgua: water,
            escoamentoSanitario: sanitation,
            coletaLixo: garbage
        },
        vulnerabilidades: vulnerabilities,
        membros: [
            {
                id: "mem-" + Date.now() + "-1",
                nome: name,
                parentesco: "Responsável",
                idade: 35, // valor padrão a ser editado
                cpf: cpf,
                nis: nis,
                renda: 0.00,
                escolaridade: "Ensino Fundamental Incompleto"
            }
        ],
        historicoAtendimentos: [
            {
                id: "at-" + Date.now(),
                data: new Date().toISOString().split("T")[0],
                tecnico: "Fernanda Lima (Assistente Social)",
                tipo: "Acolhida/Cadastramento",
                relato: "Inclusão cadastral inicial da família no sistema SUAS Digital do CRAS.",
                encaminhamento: "Orientações gerais sobre benefícios e serviços."
            }
        ],
        beneficiosConcedidos: [],
        acompanhamentoPAIF: {
            ativo: false,
            dataInicio: "",
            metas: "",
            evolucao: ""
        }
    };
    
    families.push(newFamily);
    saveFamilies(families);
    
    document.getElementById("form-new-family").reset();
    closeModal("modal-add-family");
    
    renderFamiliesTable();
    updateDashboardStats();
    
    // Atualizar mapa se estiver renderizado
    if (mapInstance) {
        renderMapMarkers();
    }
}

// Deletar Família
function deleteFamily(id) {
    if (confirm("Tem certeza que deseja excluir permanentemente o prontuário desta família? Todos os dados serão perdidos.")) {
        const families = getFamilies();
        const updated = families.filter(f => f.id !== id);
        saveFamilies(updated);
        renderFamiliesTable();
        updateDashboardStats();
    }
}

// Alterar Status PAIF rapidamente
function togglePAIFStatus(id) {
    const families = getFamilies();
    const index = families.findIndex(f => f.id === id);
    if (index !== -1) {
        const isCurrentlyActive = families[index].acompanhamentoPAIF.ativo;
        families[index].acompanhamentoPAIF.ativo = !isCurrentlyActive;
        families[index].acompanhamentoPAIF.dataInicio = !isCurrentlyActive ? new Date().toISOString().split("T")[0] : "";
        families[index].acompanhamentoPAIF.metas = !isCurrentlyActive ? "Acompanhamento social continuado." : "";
        
        saveFamilies(families);
        renderFamiliesTable();
        updateDashboardStats();
    }
}

// ==========================================================================
// TELA: DETALHES DE PRONTUÁRIO (DOSSIÊ)
// ==========================================================================
function viewFamilyProntuario(id) {
    activeFamilyIdForDetail = id;
    const families = getFamilies();
    const family = families.find(f => f.id === id);
    if (!family) return;
    
    // Cabeçalhos
    document.getElementById("view-family-title").textContent = `Prontuário SUAS - ${family.responsavel}`;
    document.getElementById("view-cod-familiar").textContent = family.codFamiliar;
    document.getElementById("view-address").textContent = `${family.logradouro}, nº ${family.numero} - Bairro: ${family.bairro}`;
    document.getElementById("view-phone").textContent = family.telefone || "Não informado";
    
    // Renda Per Capita
    const perCapita = calculatePerCapitaIncome(family);
    document.getElementById("view-per-capita").textContent = perCapita.toFixed(2);
    
    // Status PAIF
    const paifBox = document.getElementById("paif-status-box");
    if (family.acompanhamentoPAIF && family.acompanhamentoPAIF.ativo) {
        paifBox.className = "card-container";
        paifBox.style.backgroundColor = "rgba(46, 196, 182, 0.1)";
        paifBox.style.border = "1px solid var(--success)";
        paifBox.innerHTML = `
            <p><span class="badge badge-success">Acompanhamento Ativo</span></p>
            <p style="font-size:0.75rem; margin-top:8px;"><strong>Início:</strong> ${formatDate(family.acompanhamentoPAIF.dataInicio)}</p>
            <p style="font-size:0.75rem; margin-top:4px;"><strong>Metas:</strong> ${family.acompanhamentoPAIF.metas || "Não definidas"}</p>
        `;
    } else {
        paifBox.className = "card-container";
        paifBox.style.backgroundColor = "rgba(107, 124, 133, 0.1)";
        paifBox.style.border = "1px solid var(--border-color)";
        paifBox.innerHTML = `
            <p><span class="badge badge-neutral">Sem Acompanhamento</span></p>
            <p style="font-size:0.75rem; margin-top:8px; color:var(--text-muted);">Família cadastrada, porém sem plano ativo no PAIF.</p>
        `;
    }
    
    // Renderizar Tabela de Membros
    renderMembersTable(family);
    
    // Renderizar Linha do Tempo de Atendimentos
    renderFamilyTimeline(family);
    
    // Renderizar Tabela de Benefícios
    renderFamilyBenefitsTable(family);
    
    openModal("modal-view-family");
}

function renderMembersTable(family) {
    const tbody = document.getElementById("view-members-table-body");
    tbody.innerHTML = "";
    
    family.membros.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${m.nome}</strong></td>
            <td>${m.parentesco}</td>
            <td>${m.idade} anos</td>
            <td>${m.cpf || "---"}</td>
            <td>${m.nis || "---"}</td>
            <td>R$ ${parseFloat(m.renda || 0).toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-icon-only" style="width:26px; height:26px; font-size:0.75rem;" onclick="removeMember('${family.id}', '${m.id}')" title="Remover Membro">
                    <i class="fa-solid fa-user-minus"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderFamilyTimeline(family) {
    const timeline = document.getElementById("view-timeline");
    timeline.innerHTML = "";
    
    if (!family.historicoAtendimentos || family.historicoAtendimentos.length === 0) {
        timeline.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding: 20px 0;">Sem atendimentos registrados no prontuário.</p>`;
        return;
    }
    
    // Ordenar histórico
    const sorted = [...family.historicoAtendimentos].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    sorted.forEach(at => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-date">${formatDate(at.data)} - ${at.tipo}</div>
                <div class="timeline-title">${at.tecnico}</div>
                <div class="timeline-body">${at.relato}</div>
                ${at.encaminhamento ? `<div class="timeline-meta"><strong>Encaminhamentos:</strong> ${at.encaminhamento}</div>` : ""}
            </div>
        `;
        timeline.appendChild(item);
    });
}

function renderFamilyBenefitsTable(family) {
    const tbody = document.getElementById("view-benefits-history-body");
    tbody.innerHTML = "";
    
    if (!family.beneficiosConcedidos || family.beneficiosConcedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Sem benefícios concedidos.</td></tr>`;
        return;
    }
    
    family.beneficiosConcedidos.forEach(b => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(b.data)}</td>
            <td><strong>${b.tipo}</strong></td>
            <td><span class="badge badge-success">${b.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Adicionar Membro à Família
function openAddMemberModal() {
    document.getElementById("member-family-id").value = activeFamilyIdForDetail;
    openModal("modal-add-member");
}

function saveNewMember(e) {
    e.preventDefault();
    
    const familyId = document.getElementById("member-family-id").value;
    const name = document.getElementById("member-name").value;
    const relation = document.getElementById("member-relation").value;
    const age = parseInt(document.getElementById("member-age").value);
    const income = parseFloat(document.getElementById("member-income").value || 0);
    const cpf = document.getElementById("member-cpf").value;
    const nis = document.getElementById("member-nis").value;
    const education = document.getElementById("member-education").value;
    
    const families = getFamilies();
    const familyIndex = families.findIndex(f => f.id === familyId);
    
    if (familyIndex !== -1) {
        const newMember = {
            id: "mem-" + Date.now(),
            nome: name,
            parentesco: relation,
            idade: age,
            cpf: cpf,
            nis: nis,
            renda: income,
            escolaridade: education
        };
        
        families[familyIndex].membros.push(newMember);
        saveFamilies(families);
        
        // Atualizar Dossiê aberto
        viewFamilyProntuario(familyId);
        
        // Limpar form
        document.getElementById("form-new-member").reset();
        closeModal("modal-add-member");
        
        // Sincronizar listas gerais
        renderFamiliesTable();
        updateDashboardStats();
    }
}

// Remover Membro da Família
function removeMember(familyId, memberId) {
    const families = getFamilies();
    const familyIndex = families.findIndex(f => f.id === familyId);
    
    if (familyIndex !== -1) {
        const family = families[familyIndex];
        
        // Se for o responsável, bloquear remoção rápida
        const member = family.membros.find(m => m.id === memberId);
        if (member && member.parentesco === "Responsável") {
            alert("Não é possível remover o Responsável Familiar diretamente. Altere primeiro as funções dos membros.");
            return;
        }
        
        if (confirm(`Remover o membro ${member.nome} do prontuário?`)) {
            families[familyIndex].membros = family.membros.filter(m => m.id !== memberId);
            saveFamilies(families);
            
            viewFamilyProntuario(familyId);
            renderFamiliesTable();
            updateDashboardStats();
        }
    }
}

// ==========================================================================
// TELA: ATENDIMENTOS / VISITAS DOMICILIARES
// ==========================================================================
function renderAppointmentsTable() {
    const families = getFamilies();
    const tbody = document.getElementById("appointments-table-body");
    tbody.innerHTML = "";
    
    let allAtendimentos = [];
    families.forEach(f => {
        if (f.historicoAtendimentos) {
            f.historicoAtendimentos.forEach(at => {
                allAtendimentos.push({
                    responsavel: f.responsavel,
                    nis: f.nisResponsavel,
                    ...at
                });
            });
        }
    });
    
    allAtendimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (allAtendimentos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhum atendimento registrado.</td></tr>`;
        return;
    }
    
    allAtendimentos.forEach(at => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(at.data)}</td>
            <td><strong>${at.responsavel}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">NIS: ${at.nis}</span></td>
            <td>${at.tecnico}</td>
            <td><span class="badge badge-info">${at.tipo}</span></td>
            <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${at.relato}">${at.relato}</td>
            <td style="max-width: 200px; font-size:0.85rem; color:var(--primary-light);">${at.encaminhamento || '---'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterAppointments() {
    const searchText = document.getElementById("filter-appointment-search").value.toLowerCase();
    const typeFilter = document.getElementById("filter-appointment-type").value;
    
    const families = getFamilies();
    const tbody = document.getElementById("appointments-table-body");
    tbody.innerHTML = "";
    
    let allAtendimentos = [];
    families.forEach(f => {
        if (f.historicoAtendimentos) {
            f.historicoAtendimentos.forEach(at => {
                allAtendimentos.push({
                    responsavel: f.responsavel,
                    nis: f.nisResponsavel,
                    ...at
                });
            });
        }
    });
    
    const filtered = allAtendimentos.filter(at => {
        const matchesText = at.responsavel.toLowerCase().includes(searchText) || at.tecnico.toLowerCase().includes(searchText);
        const matchesType = typeFilter === "" || at.tipo === typeFilter;
        return matchesText && matchesType;
    });
    
    filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhum atendimento corresponde aos filtros.</td></tr>`;
        return;
    }
    
    filtered.forEach(at => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(at.data)}</td>
            <td><strong>${at.responsavel}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">NIS: ${at.nis}</span></td>
            <td>${at.tecnico}</td>
            <td><span class="badge badge-info">${at.tipo}</span></td>
            <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${at.relato}">${at.relato}</td>
            <td style="max-width: 200px; font-size:0.85rem; color:var(--primary-light);">${at.encaminhamento || '---'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function saveNewAppointment(e) {
    e.preventDefault();
    
    const familyId = document.getElementById("app-family").value;
    const type = document.getElementById("app-type").value;
    const date = document.getElementById("app-date").value;
    const relato = document.getElementById("app-relato").value;
    const encaminhamento = document.getElementById("app-encaminhamento").value;
    const tech = document.getElementById("app-tech").value;
    
    if (!familyId) {
        alert("Por favor, selecione uma família para o atendimento.");
        return;
    }
    
    const families = getFamilies();
    const familyIndex = families.findIndex(f => f.id === familyId);
    
    if (familyIndex !== -1) {
        const newApp = {
            id: "at-" + Date.now(),
            data: date,
            tecnico: tech,
            tipo: type,
            relato: relato,
            encaminhamento: encaminhamento
        };
        
        families[familyIndex].historicoAtendimentos.push(newApp);
        saveFamilies(families);
        
        document.getElementById("form-new-appointment").reset();
        closeModal("modal-add-appointment");
        
        renderAppointmentsTable();
        updateDashboardStats();
    }
}

// ==========================================================================
// TELA: BENEFÍCIOS EVENTUAIS
// ==========================================================================
function renderBenefitsTable() {
    const families = getFamilies();
    const tbody = document.getElementById("benefits-table-body");
    tbody.innerHTML = "";
    
    let allBenefits = [];
    families.forEach(f => {
        if (f.beneficiosConcedidos) {
            f.beneficiosConcedidos.forEach(ben => {
                allBenefits.push({
                    responsavel: f.responsavel,
                    nis: f.nisResponsavel,
                    ...ben
                });
            });
        }
    });
    
    allBenefits.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (allBenefits.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhum benefício concedido recentemente.</td></tr>`;
        return;
    }
    
    allBenefits.forEach(ben => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(ben.data)}</td>
            <td><strong>${ben.responsavel}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">NIS: ${ben.nis}</span></td>
            <td><span class="badge badge-info">${ben.tipo}</span></td>
            <td><span class="badge badge-success">${ben.status}</span></td>
            <td>${ben.observacao}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterBenefits() {
    const searchText = document.getElementById("filter-benefit-search").value.toLowerCase();
    const families = getFamilies();
    const tbody = document.getElementById("benefits-table-body");
    tbody.innerHTML = "";
    
    let allBenefits = [];
    families.forEach(f => {
        if (f.beneficiosConcedidos) {
            f.beneficiosConcedidos.forEach(ben => {
                allBenefits.push({
                    responsavel: f.responsavel,
                    nis: f.nisResponsavel,
                    ...ben
                });
            });
        }
    });
    
    const filtered = allBenefits.filter(ben => ben.responsavel.toLowerCase().includes(searchText));
    filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhum benefício atende aos critérios.</td></tr>`;
        return;
    }
    
    filtered.forEach(ben => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(ben.data)}</td>
            <td><strong>${ben.responsavel}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">NIS: ${ben.nis}</span></td>
            <td><span class="badge badge-info">${ben.tipo}</span></td>
            <td><span class="badge badge-success">${ben.status}</span></td>
            <td>${ben.observacao}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Validação Inteligente Contra Concessões Recentes (Duplicidade)
// Vinculado a eventos de alteração de campos no modal de concessão
document.getElementById("ben-family").addEventListener("change", checkBenefitDuplication);
document.getElementById("ben-type").addEventListener("change", checkBenefitDuplication);

function checkBenefitDuplication() {
    const familyId = document.getElementById("ben-family").value;
    const type = document.getElementById("ben-type").value;
    const warningBox = document.getElementById("benefit-warning-box");
    
    if (!familyId || !type) {
        warningBox.style.display = "none";
        return;
    }
    
    const families = getFamilies();
    const family = families.find(f => f.id === familyId);
    
    if (family && family.beneficiosConcedidos) {
        // Encontrar concessões do mesmo tipo nos últimos 30 dias
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - 30);
        
        const recentConcession = family.beneficiosConcedidos.find(ben => {
            return ben.tipo === type && new Date(ben.data) >= limitDate;
        });
        
        if (recentConcession) {
            warningBox.style.display = "block";
            warningBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>Aviso:</strong> A família já recebeu o benefício <strong>${type}</strong> recentemente em ${formatDate(recentConcession.data)}. Conceder novamente pode gerar alertas no sistema municipal.`;
        } else {
            warningBox.style.display = "none";
        }
    } else {
        warningBox.style.display = "none";
    }
}

function saveNewBenefit(e) {
    e.preventDefault();
    
    const familyId = document.getElementById("ben-family").value;
    const type = document.getElementById("ben-type").value;
    const date = document.getElementById("ben-date").value;
    const obs = document.getElementById("ben-obs").value;
    
    if (!familyId) {
        alert("Selecione a família.");
        return;
    }
    
    const families = getFamilies();
    const familyIndex = families.findIndex(f => f.id === familyId);
    
    if (familyIndex !== -1) {
        const newBenefit = {
            id: "ben-" + Date.now(),
            data: date,
            tipo: type,
            status: "Entregue",
            observacao: obs
        };
        
        families[familyIndex].beneficiosConcedidos.push(newBenefit);
        saveFamilies(families);
        
        document.getElementById("form-new-benefit").reset();
        closeModal("modal-add-benefit");
        
        renderBenefitsTable();
        updateDashboardStats();
    }
}

// ==========================================================================
// TELA: OFICINAS & SCFV
// ==========================================================================
function renderSCFVGroups() {
    const groups = getGroups();
    const tbody = document.getElementById("scfv-groups-body");
    tbody.innerHTML = "";
    
    if (groups.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum grupo ativo.</td></tr>`;
        return;
    }
    
    groups.forEach(g => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${g.nome}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${g.descricao}</span></td>
            <td>${g.tecnicoResponsavel}</td>
            <td>${g.horario}</td>
            <td>
                <button class="btn btn-primary" style="padding:6px 12px; font-size:0.8rem;" onclick="openAttendanceSheet('${g.id}')">
                    <i class="fa-solid fa-list-check"></i> Frequência
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveNewGroup(e) {
    e.preventDefault();
    
    const name = document.getElementById("grp-name").value;
    const tech = document.getElementById("grp-tech").value;
    const time = document.getElementById("grp-time").value;
    const desc = document.getElementById("grp-desc").value;
    
    const groups = getGroups();
    
    // Coleta membros aleatórios dos prontuários para simular uma turma cheia
    const families = getFamilies();
    const participants = [];
    families.slice(0, 3).forEach(f => {
        if (f.membros && f.membros.length > 0) {
            participants.push({
                membroId: f.membros[0].id,
                nome: f.membros[0].nome,
                familiaId: f.id
            });
        }
    });
    
    const newGroup = {
        id: "grp-" + Date.now(),
        nome: name,
        tecnicoResponsavel: tech,
        horario: time,
        descricao: desc,
        participantes: participants,
        presencas: []
    };
    
    groups.push(newGroup);
    saveGroups(groups);
    
    document.getElementById("form-new-group").reset();
    closeModal("modal-add-group");
    
    renderSCFVGroups();
}

let activeGroupIdForAttendance = null;

function openAttendanceSheet(groupId) {
    activeGroupIdForAttendance = groupId;
    const groups = getGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    document.getElementById("attendance-panel").style.display = "block";
    document.getElementById("attendance-group-name").innerHTML = `<strong>${group.nome}</strong>`;
    
    loadAttendanceSheet();
}

function loadAttendanceSheet() {
    const groupId = activeGroupIdForAttendance;
    const dateInput = document.getElementById("attendance-date").value;
    
    const groups = getGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const container = document.getElementById("attendance-list");
    container.innerHTML = "";
    
    // Obter dados de presença para este dia
    const dailyPresencesObj = group.presencas.find(p => p.data === dateInput);
    const presentMemberIds = dailyPresencesObj ? dailyPresencesObj.presentes : [];
    
    if (group.participantes.length === 0) {
        container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">Não existem participantes cadastrados neste grupo ainda.</p>`;
        return;
    }
    
    group.participantes.forEach(part => {
        const isPresent = presentMemberIds.includes(part.membroId);
        
        const row = document.createElement("div");
        row.className = "attendance-row";
        row.innerHTML = `
            <span style="font-size:0.9rem; font-weight:600;">${part.nome}</span>
            <div class="attendance-actions">
                <button class="attendance-btn present ${isPresent ? 'active' : ''}" 
                        onclick="togglePresenceBtn(this, '${part.membroId}', 'P')" title="Marcar Presença">
                        <i class="fa-solid fa-check"></i>
                </button>
                <button class="attendance-btn absent ${!isPresent && dailyPresencesObj ? 'active' : ''}" 
                        onclick="togglePresenceBtn(this, '${part.membroId}', 'F')" title="Marcar Falta">
                        <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

function togglePresenceBtn(btn, memberId, type) {
    const parent = btn.parentElement;
    // Limpar estados nos botões da mesma linha
    parent.querySelectorAll(".attendance-btn").forEach(b => b.classList.remove("active"));
    // Ativar botão clicado
    btn.classList.add("active");
}

function saveAttendance() {
    const groupId = activeGroupIdForAttendance;
    const dateInput = document.getElementById("attendance-date").value;
    
    const groups = getGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    
    const group = groups[groupIndex];
    const presentIds = [];
    
    // Selecionar botões com a classe active para identificar presenças
    const rows = document.querySelectorAll("#attendance-list .attendance-row");
    rows.forEach((row, idx) => {
        const presentBtn = row.querySelector(".attendance-btn.present");
        const participantId = group.participantes[idx].membroId;
        if (presentBtn && presentBtn.classList.contains("active")) {
            presentIds.push(participantId);
        }
    });
    
    // Atualizar registro ou inserir novo
    const existingIndex = group.presencas.findIndex(p => p.data === dateInput);
    if (existingIndex !== -1) {
        group.presencas[existingIndex].presentes = presentIds;
    } else {
        group.presencas.push({
            data: dateInput,
            presentes: presentIds
        });
    }
    
    groups[groupIndex] = group;
    saveGroups(groups);
    alert("Frequência de presença gravada com sucesso!");
    loadAttendanceSheet();
}

// ==========================================================================
// TELA: ENCAMINHAMENTOS (REFERÊNCIA E CONTRARREFERÊNCIA)
// ==========================================================================
function renderReferralsTable() {
    const referrals = getReferrals();
    const families = getFamilies();
    const tbody = document.getElementById("referrals-table-body");
    tbody.innerHTML = "";
    
    if (referrals.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhum encaminhamento ativo.</td></tr>`;
        return;
    }
    
    referrals.forEach(ref => {
        const statusBadge = ref.status === "Respondido" 
            ? `<span class="badge badge-success">Concluído</span>`
            : `<span class="badge badge-warning">Aguardando Retorno</span>`;
            
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(ref.dataEnvio)}</td>
            <td><strong>${ref.beneficiario}</strong></td>
            <td>${ref.destino}</td>
            <td>${ref.motivo}</td>
            <td>${ref.tecnico}</td>
            <td>${statusBadge}</td>
            <td style="font-size:0.85rem; font-style:italic;">${ref.resposta || '<span style="color:var(--text-muted);">Sem resposta registrada</span>'}</td>
            <td>
                ${ref.status === "Pendente" ? `
                    <button class="btn btn-success" style="padding:6px 12px; font-size:0.8rem;" onclick="answerReferral('${ref.id}')">
                        <i class="fa-solid fa-reply"></i> Responder
                    </button>
                ` : '---'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateBeneficiaryOptions() {
    const familyId = document.getElementById("ref-family-select").value;
    const selectMember = document.getElementById("ref-member-select");
    
    if (!familyId) {
        selectMember.innerHTML = '<option value="">Aguardando seleção familiar...</option>';
        return;
    }
    
    const families = getFamilies();
    const family = families.find(f => f.id === familyId);
    
    selectMember.innerHTML = "";
    if (family && family.membros) {
        family.membros.forEach(m => {
            const option = document.createElement("option");
            option.value = m.nome;
            option.textContent = `${m.nome} (${m.parentesco})`;
            selectMember.appendChild(option);
        });
    }
}

function saveNewReferral(e) {
    e.preventDefault();
    
    const familyId = document.getElementById("ref-family-select").value;
    const memberName = document.getElementById("ref-member-select").value;
    const dest = document.getElementById("ref-dest").value;
    const date = document.getElementById("ref-date").value;
    const reason = document.getElementById("ref-reason").value;
    
    const referrals = getReferrals();
    
    const newRef = {
        id: "ref-" + Date.now(),
        familiaId: familyId,
        beneficiario: memberName,
        destino: dest,
        motivo: reason,
        dataEnvio: date,
        status: "Pendente",
        tecnico: "Fernanda Lima (Assistente Social)",
        resposta: ""
    };
    
    referrals.push(newRef);
    saveReferrals(referrals);
    
    document.getElementById("form-new-referral").reset();
    closeModal("modal-add-referral");
    
    renderReferralsTable();
    updateDashboardStats();
}

function answerReferral(id) {
    const answer = prompt("Insira a resposta/retorno oficial da instituição parceira (Contrarreferência):");
    if (answer === null || answer.trim() === "") return;
    
    const referrals = getReferrals();
    const index = referrals.findIndex(r => r.id === id);
    
    if (index !== -1) {
        referrals[index].status = "Respondido";
        referrals[index].resposta = answer;
        
        saveReferrals(referrals);
        renderReferralsTable();
        updateDashboardStats();
    }
}

// ==========================================================================
// TELA: GEOPROCESSAMENTO / MAPA REAL (LEAFLET)
// ==========================================================================
function initMap() {
    const mapContainer = document.getElementById("cras-map");
    if (!mapContainer) return;
    
    // Se a instância de mapa já existir, invalidar o tamanho do container
    if (mapInstance !== null) {
        mapInstance.invalidateSize();
        return;
    }
    
    // Criar mapa apontando para Salvador
    mapInstance = L.map('cras-map').setView([-12.9714, -38.5014], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);
    
    renderMapMarkers();
}

function renderMapMarkers() {
    if (!mapInstance) return;
    
    // Limpar marcadores anteriores
    mapInstance.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            mapInstance.removeLayer(layer);
        }
    });
    
    const families = getFamilies();
    
    families.forEach(f => {
        if (f.latitude && f.longitude) {
            // Decidir cor de risco baseado no número de vulnerabilidades
            let color = "#2ec4b6"; // Baixa
            let risk = "Baixo";
            
            const vulCount = f.vulnerabilidades ? f.vulnerabilidades.length : 0;
            
            if (vulCount >= 3) {
                color = "#e71d36"; // Alto
                risk = "Alto";
            } else if (vulCount >= 1) {
                color = "#ff9f1c"; // Médio
                risk = "Médio";
            }
            
            // Criar ícone circular estilizado via SVG
            const customIcon = L.divIcon({
                html: `<div style="background-color:${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: var(--shadow-sm);"></div>`,
                className: 'custom-div-icon',
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            });
            
            const marker = L.marker([f.latitude, f.longitude], { icon: customIcon }).addTo(mapInstance);
            
            // Configurar popup do Leaflet
            const popupContent = `
                <div class="custom-leaflet-popup">
                    <h4>${f.responsavel}</h4>
                    <p><strong>Cód. Família:</strong> ${f.codFamiliar}</p>
                    <p><strong>Risco:</strong> <span class="badge" style="background-color:${color}22; color:${color}; padding:2px 6px;">${risk}</span></p>
                    <p><strong>Endereço:</strong> ${f.logradouro}, ${f.numero} - ${f.bairro}</p>
                    <p style="margin-top: 10px; text-align: center;">
                        <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem; width:100%; border-radius:4px;" 
                                onclick="viewFamilyProntuario('${f.id}')">
                            <i class="fa-solid fa-folder-open"></i> Abrir Prontuário
                        </button>
                    </p>
                </div>
            `;
            
            marker.bindPopup(popupContent);
        }
    });
}

// ==========================================================================
// TELA: RELATÓRIOS RMA (REGISTRO MENSAL)
// ==========================================================================
function generateRMA() {
    const families = getFamilies();
    const month = document.getElementById("rma-month").value;
    
    // Filtrar dados do mês selecionado (Junho de 2026 como base padrão)
    const baseMonthStr = `2026-${month}`;
    
    // A.1: Acompanhados no início do mês
    // Simula as famílias que já estavam ativas no PAIF antes do mês de referência
    const a1Count = families.filter(f => {
        return f.acompanhamentoPAIF && 
               f.acompanhamentoPAIF.ativo && 
               f.acompanhamentoPAIF.dataInicio !== "" &&
               new Date(f.acompanhamentoPAIF.dataInicio) < new Date(`${baseMonthStr}-01`);
    }).length;
    
    // A.2: Novas famílias inseridas no PAIF no mês
    const a2Count = families.filter(f => {
        return f.acompanhamentoPAIF && 
               f.acompanhamentoPAIF.ativo && 
               f.acompanhamentoPAIF.dataInicio !== "" &&
               f.acompanhamentoPAIF.dataInicio.startsWith(baseMonthStr);
    }).length;
    
    // A.4: Total fim do mês (A.1 + A.2)
    const a4Count = a1Count + a2Count;
    
    // B.1: Atendimentos individuais no mês
    let b1Count = 0;
    families.forEach(f => {
        if (f.historicoAtendimentos) {
            f.historicoAtendimentos.forEach(at => {
                if (at.data.startsWith(baseMonthStr)) {
                    b1Count++;
                }
            });
        }
    });
    
    // B.2: Visitas domiciliares no mês
    let b2Count = 0;
    families.forEach(f => {
        if (f.historicoAtendimentos) {
            f.historicoAtendimentos.forEach(at => {
                if (at.data.startsWith(baseMonthStr) && at.tipo === "Visita Domiciliar") {
                    b2Count++;
                }
            });
        }
    });
    
    // B.3: Concessões de Benefícios no mês
    let b3Count = 0;
    families.forEach(f => {
        if (f.beneficiosConcedidos) {
            f.beneficiosConcedidos.forEach(ben => {
                if (ben.data.startsWith(baseMonthStr)) {
                    b3Count++;
                }
            });
        }
    });
    
    // Carregar na tela
    document.getElementById("rma-a1").textContent = a1Count;
    document.getElementById("rma-a2").textContent = a2Count;
    document.getElementById("rma-a4").textContent = a4Count;
    document.getElementById("rma-b1").textContent = b1Count;
    document.getElementById("rma-b2").textContent = b2Count;
    document.getElementById("rma-b3").textContent = b3Count;
}

// ==========================================================================
// FUNÇÕES AUXILIARES / FORMATADORES
// ==========================================================================
function formatDate(dateString) {
    if (!dateString) return "---";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
