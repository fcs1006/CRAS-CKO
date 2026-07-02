// ==========================================================================
// CORE LOGIC - SISTEMA CRAS (SUAS DIGITAL) - VERSÃO CONFIGURÁVEL AVANÇADA
// ==========================================================================

let mapInstance = null;
let vulnerabilityChartInstance = null;
let neighborhoodChartInstance = null;
let activeFamilyIdForDetail = null;

// Coordenadas Centrais por Bairro (Salvador-BA) para Georreferenciamento Automático
const neighborhoodCoords = {
    "Liberdade": { lat: -12.9720, lng: -38.4980 },
    "Pero Vaz": { lat: -12.9690, lng: -38.4950 },
    "Caixa d'Água": { lat: -12.9660, lng: -38.4900 },
    "Palestina": { lat: -12.9100, lng: -38.4300 },
    "Centro": { lat: -12.9714, lng: -38.5014 }
};

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

// Inicialização Principal
function initApp() {
    setupRouting();
    applySettings(); // Carregar branding institucional
    updateDashboardStats();
    loadDashboardRecentData();
    renderFamiliesTable();
    renderAppointmentsTable();
    renderBenefitsTable();
    renderSCFVGroups();
    renderReferralsTable();
    renderStock();
    renderAgenda();
    populateSelectFamilies();
    setupMasks(); // Inicializar Máscaras de CPF, NIS, Tel
    setupFormListeners(); // Listeners dinâmicos
    
    // Ouvinte para carregar dinamicamente membros da família no form de atendimento
    const selAppFamily = document.getElementById("app-family");
    if (selAppFamily) {
        selAppFamily.addEventListener("change", () => {
            updateAppMemberOptions();
        });
    }
    
    // Ouvinte para carregar co-visitantes de acordo com a mudança do técnico principal
    const selAppTech = document.getElementById("app-tech");
    if (selAppTech) {
        selAppTech.addEventListener("change", () => {
            updateAppSharedTechsChecklist();
        });
    }
    
    // Fechar dropdowns customizados ao clicar fora
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".custom-multiselect")) {
            document.querySelectorAll(".multiselect-options").forEach(opt => {
                opt.classList.remove("active");
            });
        }
    });
    
    // Inicializar o Mapa do Leaflet na primeira vez que a aba for aberta
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            if (target === "map") {
                setTimeout(() => {
                    initMap();
                }, 100);
            }
        });
    });
}

// Alternar dropdown customizado de múltipla seleção
window.toggleMultiselect = function(id) {
    document.querySelectorAll(".multiselect-options").forEach(opt => {
        if (opt.id !== id) {
            opt.classList.remove("active");
        }
    });
    const options = document.getElementById(id);
    if (options) {
        options.classList.toggle("active");
    }
};

// ==========================================================================
// ROTEAMENTO DE TELA (SPA)
// ==========================================================================
function setupRouting() {
    const menuItems = document.querySelectorAll(".menu-item");
    const screens = document.querySelectorAll(".screen-view");

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            menuItems.forEach(i => i.classList.remove("active"));
            screens.forEach(s => s.classList.remove("active"));
            
            item.classList.add("active");
            const targetScreenId = `screen-${item.getAttribute("data-target")}`;
            const targetScreen = document.getElementById(targetScreenId);
            if (targetScreen) {
                targetScreen.classList.add("active");
            }
            
            const target = item.getAttribute("data-target");
            if (target === "dashboard") {
                updateDashboardStats();
                loadDashboardRecentData();
            } else if (target === "families") {
                renderFamiliesTable();
            } else if (target === "appointments") {
                renderAppointmentsTable();
                renderAgenda();
            } else if (target === "benefits") {
                renderBenefitsTable();
                renderStock();
            } else if (target === "scfv") {
                renderSCFVGroups();
            } else if (target === "referrals") {
                renderReferralsTable();
            } else if (target === "rma") {
                generateRMA();
            } else if (target === "settings") {
                loadSettingsForm();
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

// Sincronizar select com famílias cadastradas
function populateSelectFamilies() {
    // Sincronização secundária
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

function getAgenda() {
    return JSON.parse(localStorage.getItem("cras_agenda")) || [];
}

function saveAgenda(agenda) {
    localStorage.setItem("cras_agenda", JSON.stringify(agenda));
}

function getStock() {
    return JSON.parse(localStorage.getItem("cras_stock")) || [];
}

function saveStock(stock) {
    localStorage.setItem("cras_stock", JSON.stringify(stock));
}

function getSettings() {
    return JSON.parse(localStorage.getItem("cras_settings")) || {
        municipio: "Prefeitura Municipal",
        secretaria: "Secretaria de Assistência Social",
        crasUnidade: "CRAS Geral",
        endereco: "Endereço da Unidade, nº 0",
        telefone: "(00) 0000-0000",
        email: "cras@municipio.gov.br",
        logoUrl: ""
    };
}

// Retorna profissionais cadastrados
function getProfessionals() {
    let profs = JSON.parse(localStorage.getItem("cras_professionals"));
    if (!profs) {
        profs = [
            { id: "prof-1", nome: "Fernanda Lima", cargo: "Assistente Social", conselho: "CRESS/BA 4567" },
            { id: "prof-2", nome: "Claudio Rocha", cargo: "Psicólogo(a)", conselho: "CRP-03/9876" },
            { id: "prof-3", nome: "Marcos Souza", cargo: "Orientador(a) Social", conselho: "Não aplicável" }
        ];
        localStorage.setItem("cras_professionals", JSON.stringify(profs));
    }
    return profs;
}

function saveProfessionals(profs) {
    localStorage.setItem("cras_professionals", JSON.stringify(profs));
}

function saveSettings(settings) {
    localStorage.setItem("cras_settings", JSON.stringify(settings));
}

// ==========================================================================
// CONFIGURAÇÕES MUNICIPAIS & GESTÃO DE EQUIPE
// ==========================================================================
function applySettings() {
    const s = getSettings();
    const sideTitle = document.getElementById("side-unit-name");
    sideTitle.innerHTML = `${s.crasUnidade} <span style="font-size:0.75rem;">SUAS Digital</span>`;
    
    const logoPlaceholder = document.getElementById("sidebar-logo-placeholder");
    const logoImg = document.getElementById("sidebar-logo");
    
    if (s.logoUrl && s.logoUrl.trim() !== "") {
        logoImg.src = s.logoUrl;
        logoImg.style.display = "block";
        logoPlaceholder.style.display = "none";
    } else {
        logoImg.style.display = "none";
        logoPlaceholder.style.display = "block";
    }
    
    document.getElementById("side-footer-secretaria").textContent = s.secretaria;
    document.getElementById("side-footer-municipio").textContent = s.municipio;
    document.getElementById("topbar-unit-name").textContent = `Assistente Social • ${s.crasUnidade}`;
}

function loadSettingsForm() {
    const s = getSettings();
    document.getElementById("set-municipio").value = s.municipio;
    document.getElementById("set-secretaria").value = s.secretaria;
    document.getElementById("set-crasUnidade").value = s.crasUnidade;
    document.getElementById("set-endereco").value = s.endereco;
    document.getElementById("set-telefone").value = s.telefone;
    document.getElementById("set-email").value = s.email;
    
    const logoPreview = document.getElementById("settings-logo-preview");
    const clearBtn = document.getElementById("btn-clear-logo");
    if (logoPreview && clearBtn) {
        if (s.logoUrl && s.logoUrl.trim() !== "") {
            logoPreview.innerHTML = `<img src="${s.logoUrl}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
            logoPreview.dataset.base64 = s.logoUrl;
            clearBtn.style.display = "inline-block";
        } else {
            logoPreview.innerHTML = `<i class="fa-solid fa-image" style="color: var(--text-muted); font-size: 1.8rem;"></i>`;
            delete logoPreview.dataset.base64;
            clearBtn.style.display = "none";
        }
    }
    
    renderSettingsTeamTable();
}

function saveMunicipalSettings(e) {
    e.preventDefault();
    const logoPreview = document.getElementById("settings-logo-preview");
    const logoBase64 = logoPreview && logoPreview.dataset.base64 ? logoPreview.dataset.base64 : "";
    
    const updated = {
        municipio: document.getElementById("set-municipio").value,
        secretaria: document.getElementById("set-secretaria").value,
        crasUnidade: document.getElementById("set-crasUnidade").value,
        endereco: document.getElementById("set-endereco").value,
        telefone: document.getElementById("set-telefone").value,
        email: document.getElementById("set-email").value,
        logoUrl: logoBase64
    };
    saveSettings(updated);
    applySettings();
    alert("Configurações institucionais salvas e aplicadas com sucesso em toda a plataforma!");
}

// Equipe Técnica Gestão
function renderSettingsTeamTable() {
    const profs = getProfessionals();
    const tbody = document.getElementById("settings-team-table-body");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    profs.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${p.nome}</strong></td>
            <td>${p.cargo}</td>
            <td><code>${p.conselho || 'Não aplicável'}</code></td>
            <td>
                <button class="btn btn-danger btn-icon-only" onclick="deleteTeamMember('${p.id}')" title="Excluir Profissional">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function addTeamMember(e) {
    e.preventDefault();
    const name = document.getElementById("team-name").value.trim();
    const role = document.getElementById("team-role").value;
    const council = document.getElementById("team-council").value.trim() || "Não aplicável";
    
    if (!name || !role) return;
    
    const profs = getProfessionals();
    const newProf = {
        id: "prof-" + Date.now(),
        nome: name,
        cargo: role,
        conselho: council
    };
    
    profs.push(newProf);
    saveProfessionals(profs);
    
    document.getElementById("form-add-team-member").reset();
    renderSettingsTeamTable();
    alert("Profissional adicionado à equipe com sucesso!");
}

function deleteTeamMember(id) {
    const profs = getProfessionals();
    if (profs.length <= 1) {
        alert("A equipe do CRAS precisa ter pelo menos um profissional cadastrado.");
        return;
    }
    
    if (confirm("Excluir este profissional da equipe?")) {
        const updated = profs.filter(p => p.id !== id);
        saveProfessionals(updated);
        renderSettingsTeamTable();
    }
}

// ==========================================================================
// MÁSCARAS DE ENTRADA DE DADOS EM TEMPO REAL (CPF, NIS, TELEFONE)
// ==========================================================================
function setupMasks() {
    const cpfs = ["fam-cpf", "member-cpf"];
    cpfs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => applyCPFMask(el));
    });
    
    const nises = ["fam-nis", "member-nis"];
    nises.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => applyNISMask(el));
    });
    
    const phones = ["fam-phone", "set-telefone"];
    phones.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => applyPhoneMask(el));
    });
}

function applyCPFMask(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 9) {
        input.value = `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6, 9)}-${v.substring(9)}`;
    } else if (v.length > 6) {
        input.value = `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6)}`;
    } else if (v.length > 3) {
        input.value = `${v.substring(0, 3)}.${v.substring(3)}`;
    } else {
        input.value = v;
    }
}

function applyNISMask(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) {
        input.value = `${v.substring(0, 3)}.${v.substring(3, 8)}.${v.substring(8, 10)}-${v.substring(10)}`;
    } else if (v.length > 8) {
        input.value = `${v.substring(0, 3)}.${v.substring(3, 8)}.${v.substring(8)}`;
    } else if (v.length > 3) {
        input.value = `${v.substring(0, 3)}.${v.substring(3)}`;
    } else {
        input.value = v;
    }
}

function applyPhoneMask(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) {
        input.value = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
    } else if (v.length > 6) {
        input.value = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
    } else if (v.length > 2) {
        input.value = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    } else if (v.length > 0) {
        input.value = `(${v}`;
    } else {
        input.value = "";
    }
}

function setupFormListeners() {
    const chkOther = document.getElementById("chk-other-vul");
    const textOther = document.getElementById("fam-other-vul-text");
    if (chkOther && textOther) {
        chkOther.addEventListener("change", () => {
            textOther.style.display = chkOther.checked ? "block" : "none";
        });
    }
    
    // Toggle para o Programa de Governo do Responsável
    const selFamGov = document.getElementById("fam-gov-program");
    const txtFamGov = document.getElementById("fam-gov-program-text");
    if (selFamGov && txtFamGov) {
        selFamGov.addEventListener("change", () => {
            txtFamGov.style.display = selFamGov.value === "Outros" ? "block" : "none";
        });
    }
    
    // Toggle para o Programa de Governo do Membro Familiar
    const selMemGov = document.getElementById("member-gov-program");
    const txtMemGov = document.getElementById("member-gov-program-text");
    if (selMemGov && txtMemGov) {
        selMemGov.addEventListener("change", () => {
            txtMemGov.style.display = selMemGov.value === "Outros" ? "block" : "none";
        });
    }
    
    // Toggle para Visita Compartilhada no Atendimento
    const selAppShared = document.getElementById("app-shared");
    const divAppSharedTechs = document.getElementById("app-shared-techs-container");
    if (selAppShared && divAppSharedTechs) {
        selAppShared.addEventListener("change", () => {
            divAppSharedTechs.style.display = selAppShared.value === "Sim" ? "block" : "none";
        });
    }

    // LISTENER DO UPLOAD DE LOGO
    const logoFile = document.getElementById("set-logoFile");
    const logoPreview = document.getElementById("settings-logo-preview");
    const clearBtn = document.getElementById("btn-clear-logo");
    
    if (logoFile && logoPreview && clearBtn) {
        logoFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64Data = evt.target.result;
                    logoPreview.innerHTML = `<img src="${base64Data}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
                    clearBtn.style.display = "inline-block";
                    logoPreview.dataset.base64 = base64Data;
                };
                reader.readAsDataURL(file);
            }
        });
        
        clearBtn.addEventListener("click", () => {
            logoFile.value = "";
            logoPreview.innerHTML = `<i class="fa-solid fa-image" style="color: var(--text-muted); font-size: 1.8rem;"></i>`;
            delete logoPreview.dataset.base64;
            clearBtn.style.display = "none";
        });
    }

    // LISTENER DO TIPO DE AÇÃO DO ATENDIMENTO (Atendimento vs Visita Domiciliar)
    const selAppActionType = document.getElementById("app-action-type");
    const divSingleGroup = document.getElementById("app-single-member-group");
    const divMultipleGroup = document.getElementById("app-multiple-members-group");
    const selAppLocation = document.getElementById("app-location");
    
    if (selAppActionType) {
        selAppActionType.addEventListener("change", () => {
            const val = selAppActionType.value;
            if (val === "Atendimento") {
                if (divSingleGroup) divSingleGroup.style.display = "block";
                if (divMultipleGroup) divMultipleGroup.style.display = "none";
                if (selAppLocation) selAppLocation.value = "CRAS";
                document.getElementById("app-member").setAttribute("required", "required");
            } else if (val === "Visita Domiciliar") {
                if (divSingleGroup) divSingleGroup.style.display = "none";
                if (divMultipleGroup) divMultipleGroup.style.display = "block";
                if (selAppLocation) selAppLocation.value = "Domicílio";
                document.getElementById("app-member").removeAttribute("required");
            } else {
                if (divSingleGroup) divSingleGroup.style.display = "none";
                if (divMultipleGroup) divMultipleGroup.style.display = "none";
                document.getElementById("app-member").removeAttribute("required");
            }
        });
    }
}

// ==========================================================================
// CONTROLE DE MODAIS
// ==========================================================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("active");
        
        if (modalId === "modal-add-appointment") {
            populateSelectOptions("app-family");
            document.getElementById("app-action-type").value = "";
            document.getElementById("app-single-member-group").style.display = "none";
            document.getElementById("app-multiple-members-group").style.display = "none";
            
            // Reset labels dropdowns multi-seleção
            document.getElementById("family-multiselect-label").textContent = "Selecione os familiares...";
            document.getElementById("family-multiselect-label").style.color = "var(--text-muted)";
            document.getElementById("techs-multiselect-label").textContent = "Selecione os co-visitantes...";
            document.getElementById("techs-multiselect-label").style.color = "var(--text-muted)";
            
            updateAppTechOptions();
            updateAppMemberOptions();
        } else if (modalId === "modal-add-benefit") {
            populateSelectOptions("ben-family");
            checkBenefitDuplication();
        } else if (modalId === "modal-add-referral") {
            populateSelectOptions("ref-family-select");
            updateBeneficiaryOptions();
        } else if (modalId === "modal-add-agenda") {
            populateSelectOptions("age-family");
            updateAgendaTechOptions();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
    }
}

function populateSelectOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const families = getFamilies();
    select.innerHTML = '<option value="" disabled selected>Selecione...</option>';
    
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
    
    const totalFamilies = families.length;
    const paifCount = families.filter(f => f.acompanhamentoPAIF && f.acompanhamentoPAIF.ativo).length;
    
    let totalBenefits = 0;
    families.forEach(f => {
        if (f.beneficiosConcedidos) {
            totalBenefits += f.beneficiosConcedidos.length;
        }
    });
    
    const activeReferrals = referrals.filter(r => r.status === "Pendente").length;
    
    document.getElementById("stat-families-count").textContent = totalFamilies;
    document.getElementById("stat-paif-count").textContent = paifCount;
    document.getElementById("stat-benefits-count").textContent = totalBenefits;
    document.getElementById("stat-referrals-count").textContent = activeReferrals;
    
    renderVulnerabilityChart(families);
    renderNeighborhoodChart(families);
}

function loadDashboardRecentData() {
    const families = getFamilies();
    const groups = getGroups();
    
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
    
    allAtendimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
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
                <td><span class="badge badge-info">${at.tipo || 'Atendimento'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-icon-only" onclick="viewFamilyProntuario('${at.familyId}')" title="Ver Prontuário">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                </td>
            `;
            recentTable.appendChild(tr);
        });
    }
    
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
    
    if (vulnerabilityChartInstance) {
        vulnerabilityChartInstance.destroy();
    }
    
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
                    '#2ec4b6', // Saneamento
                    '#0077b6', // PcD
                    '#9bc53d', // Mãe/Pai Solo
                    '#7209b7', // Escola
                    '#f72585', // Violência
                    '#4cc9f0', // Analfabetismo
                    '#8338ec', // Atípica
                    '#3a0ca3'  // Outros
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
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhuma família cadastrada.</td></tr>`;
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
            <td style="white-space: nowrap;"><span style="font-size:0.8rem; color:var(--text-muted);">${f.cpfResponsavel}</span><br><span style="font-size:0.75rem; color:var(--primary-light);">${f.nisResponsavel}</span></td>
            <td>${f.logradouro}, ${f.numero} - ${f.bairro}</td>
            <td><strong>R$ ${perCapita.toFixed(2)}</strong></td>
            <td style="text-align:center;">${f.membros ? f.membros.length : 1}</td>
            <td>${paifStatus}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary btn-icon-only" onclick="viewFamilyProntuario('${f.id}')" title="Ver Prontuário">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    <button class="btn btn-warning btn-icon-only" onclick="editFamily('${f.id}')" title="Editar Cadastro">
                        <i class="fa-solid fa-pen-to-square"></i>
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
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhuma família atende aos filtros.</td></tr>`;
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
            <td style="white-space: nowrap;"><span style="font-size:0.8rem; color:var(--text-muted);">${f.cpfResponsavel}</span><br><span style="font-size:0.75rem; color:var(--primary-light);">${f.nisResponsavel}</span></td>
            <td>${f.logradouro}, ${f.numero} - ${f.bairro}</td>
            <td><strong>R$ ${perCapita.toFixed(2)}</strong></td>
            <td style="text-align:center;">${f.membros ? f.membros.length : 1}</td>
            <td>${paifStatus}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary btn-icon-only" onclick="viewFamilyProntuario('${f.id}')" title="Ver Prontuário">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    <button class="btn btn-warning btn-icon-only" onclick="editFamily('${f.id}')" title="Editar Cadastro">
                        <i class="fa-solid fa-pen-to-square"></i>
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

function openCreateFamilyModal() {
    document.getElementById("edit-family-id").value = "";
    document.getElementById("modal-family-title").textContent = "Cadastrar Nova Família - Prontuário SUAS";
    document.getElementById("btn-save-family").innerHTML = '<i class="fa-solid fa-save"></i> Salvar Prontuário';
    document.getElementById("form-new-family").reset();
    
    document.getElementById("fam-other-vul-text").style.display = "none";
    document.getElementById("fam-gov-program-text").style.display = "none";
    
    openModal("modal-add-family");
}

function editFamily(id) {
    const families = getFamilies();
    const f = families.find(fam => fam.id === id);
    if (!f) return;
    
    document.getElementById("edit-family-id").value = f.id;
    document.getElementById("modal-family-title").textContent = "Editar Cadastro Familiar";
    document.getElementById("btn-save-family").innerHTML = '<i class="fa-solid fa-save"></i> Salvar Alterações';
    
    const resp = f.membros.find(m => m.parentesco === "Responsável") || f.membros[0];
    
    document.getElementById("fam-name").value = f.responsavel;
    document.getElementById("fam-birthdate").value = resp ? resp.dataNascimento : "";
    document.getElementById("fam-rg").value = resp ? (resp.rg === "Não Informado" ? "" : resp.rg) : "";
    document.getElementById("fam-cpf").value = f.cpfResponsavel;
    document.getElementById("fam-nis").value = f.nisResponsavel;
    document.getElementById("fam-income").value = resp ? resp.renda : 0;
    document.getElementById("fam-profession").value = resp ? resp.profissao : "";
    document.getElementById("fam-phone").value = f.telefone;
    document.getElementById("fam-other-contact").value = f.outroContato || "";
    
    const govOptions = ["Nenhum", "Bolsa Família", "BPC (Benefício de Prestação Continuada)", "Bolsa Família + BPC"];
    const respGov = resp ? resp.programaGoverno : "Nenhum";
    if (govOptions.includes(respGov)) {
        document.getElementById("fam-gov-program").value = respGov;
        document.getElementById("fam-gov-program-text").style.display = "none";
        document.getElementById("fam-gov-program-text").value = "";
    } else {
        document.getElementById("fam-gov-program").value = "Outros";
        document.getElementById("fam-gov-program-text").style.display = "block";
        document.getElementById("fam-gov-program-text").value = respGov;
    }
    
    document.getElementById("fam-education").value = resp ? resp.escolaridade : "";
    
    document.getElementById("fam-street").value = f.logradouro;
    document.getElementById("fam-number").value = f.numero;
    document.getElementById("fam-neighborhood").value = f.bairro;
    
    document.getElementById("fam-house-type").value = f.moradia.tipo;
    document.getElementById("fam-water").value = f.moradia.abastecimentoAgua;
    document.getElementById("fam-sanitation").value = f.moradia.escoamentoSanitario;
    document.getElementById("fam-garbage").value = f.moradia.coletaLixo;
    
    const checkboxes = document.querySelectorAll('input[name="vulnerabilities"]');
    const standardVuls = ["Extrema Pobreza", "Habitação Precária", "Ausência de Saneamento", "Membro com Deficiência (PcD)", "Mãe / Pai Solo", "Crianças fora da escola", "Violência Doméstica Relatada", "Analfabetismo", "Família Atípica (Membro Neurodivergente/PCD)"];
    
    let hasOther = false;
    let otherText = "";
    
    checkboxes.forEach(cb => {
        if (cb.id === "chk-other-vul") {
            cb.checked = false;
        } else {
            cb.checked = f.vulnerabilidades.includes(cb.value);
        }
    });
    
    f.vulnerabilidades.forEach(v => {
        if (!standardVuls.includes(v)) {
            hasOther = true;
            otherText = v;
        }
    });
    
    const chkOther = document.getElementById("chk-other-vul");
    const txtOther = document.getElementById("fam-other-vul-text");
    if (hasOther) {
        chkOther.checked = true;
        txtOther.style.display = "block";
        txtOther.value = otherText;
    } else {
        chkOther.checked = false;
        txtOther.style.display = "none";
        txtOther.value = "";
    }
    
    openModal("modal-add-family");
}

function saveNewFamily(e) {
    e.preventDefault();
    
    const name = document.getElementById("fam-name").value;
    const cpf = document.getElementById("fam-cpf").value;
    const nis = document.getElementById("fam-nis").value;
    const phone = document.getElementById("fam-phone").value;
    const otherContact = document.getElementById("fam-other-contact").value;
    const street = document.getElementById("fam-street").value;
    const number = document.getElementById("fam-number").value;
    const neighborhood = document.getElementById("fam-neighborhood").value;
    const houseType = document.getElementById("fam-house-type").value;
    const water = document.getElementById("fam-water").value;
    const sanitation = document.getElementById("fam-sanitation").value;
    const garbage = document.getElementById("fam-garbage").value;
    
    const birthdate = document.getElementById("fam-birthdate").value;
    const rg = document.getElementById("fam-rg").value;
    const income = parseFloat(document.getElementById("fam-income").value || 0);
    const profession = document.getElementById("fam-profession").value;
    let govProgram = document.getElementById("fam-gov-program").value;
    if (govProgram === "Outros") {
        govProgram = document.getElementById("fam-gov-program-text").value.trim() || "Outros";
    }
    const education = document.getElementById("fam-education").value;
    
    const dob = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    if (age < 0) age = 0;
    
    const checkboxes = document.querySelectorAll('input[name="vulnerabilities"]:checked');
    const vulnerabilities = [];
    checkboxes.forEach(cb => {
        if (cb.id === "chk-other-vul") {
            const customVal = document.getElementById("fam-other-vul-text").value.trim();
            if (customVal) vulnerabilities.push(customVal);
        } else {
            vulnerabilities.push(cb.value);
        }
    });
    
    const editId = document.getElementById("edit-family-id").value;
    const families = getFamilies();
    
    if (editId) {
        const index = families.findIndex(fam => fam.id === editId);
        if (index !== -1) {
            const f = families[index];
            f.responsavel = name;
            f.cpfResponsavel = cpf;
            f.nisResponsavel = nis;
            f.logradouro = street;
            f.numero = number;
            
            if (f.bairro !== neighborhood) {
                f.bairro = neighborhood;
                const center = neighborhoodCoords[neighborhood] || { lat: -12.9714, lng: -38.5014 };
                f.latitude = center.lat + (Math.random() - 0.5) * 0.005;
                f.longitude = center.lng + (Math.random() - 0.5) * 0.005;
            }
            
            f.telefone = phone;
            f.outroContato = otherContact;
            f.moradia = {
                tipo: houseType,
                abastecimentoAgua: water,
                escoamentoSanitario: sanitation,
                coletaLixo: garbage
            };
            f.vulnerabilidades = vulnerabilities;
            
            const respIndex = f.membros.findIndex(m => m.parentesco === "Responsável");
            if (respIndex !== -1) {
                f.membros[respIndex].nome = name;
                f.membros[respIndex].dataNascimento = birthdate;
                f.membros[respIndex].idade = age;
                f.membros[respIndex].cpf = cpf;
                f.membros[respIndex].nis = nis;
                f.membros[respIndex].rg = rg || "Não Informado";
                f.membros[respIndex].renda = income;
                f.membros[respIndex].escolaridade = education;
                f.membros[respIndex].profissao = profession;
                f.membros[respIndex].programaGoverno = govProgram;
            }
            
            saveFamilies(families);
            
            document.getElementById("form-new-family").reset();
            document.getElementById("edit-family-id").value = "";
            document.getElementById("fam-other-vul-text").style.display = "none";
            document.getElementById("fam-gov-program-text").style.display = "none";
            closeModal("modal-add-family");
            
            renderFamiliesTable();
            updateDashboardStats();
            if (mapInstance) renderMapMarkers();
            alert("Cadastro familiar atualizado com sucesso!");
            return;
        }
    }
    
    const center = neighborhoodCoords[neighborhood] || { lat: -12.9714, lng: -38.5014 };
    const lat = center.lat + (Math.random() - 0.5) * 0.005;
    const lng = center.lng + (Math.random() - 0.5) * 0.005;
    
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
        outroContato: otherContact,
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
                dataNascimento: birthdate,
                idade: age,
                cpf: cpf,
                nis: nis,
                rg: rg || "Não Informado",
                renda: income,
                escolaridade: education,
                profissao: profession || "Não informada",
                programaGoverno: govProgram
            }
        ],
        historicoAtendimentos: [
            {
                id: "at-" + Date.now(),
                data: new Date().toISOString().split("T")[0],
                hora: "10:00",
                usuarioVisitado: name,
                participantesFamiliares: [name],
                local: "CRAS",
                compartilhada: "Não",
                profissionaisParticipantes: "",
                tecnico: "Fernanda Lima (Assistente Social)",
                tipo: "Atendimento",
                relato: "Inclusão cadastral inicial da família no sistema SUAS Digital do CRAS.",
                providencias: "Orientações gerais sobre benefícios e serviços do território."
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
    document.getElementById("fam-other-vul-text").style.display = "none";
    document.getElementById("fam-gov-program-text").style.display = "none";
    closeModal("modal-add-family");
    
    renderFamiliesTable();
    updateDashboardStats();
    if (mapInstance) renderMapMarkers();
}

function deleteFamily(id) {
    if (confirm("Tem certeza que deseja excluir permanentemente o prontuário desta família? Todos os dados serão perdidos.")) {
        const families = getFamilies();
        const updated = families.filter(f => f.id !== id);
        saveFamilies(updated);
        renderFamiliesTable();
        updateDashboardStats();
    }
}

function togglePAIFStatus(id) {
    const families = getFamilies();
    const index = families.findIndex(f => f.id === id);
    if (index !== -1) {
        const isCurrentlyActive = families[index].acompanhamentoPAIF.ativo;
        families[index].acompanhamentoPAIF.ativo = !isCurrentlyActive;
        families[index].acompanhamentoPAIF.dataInicio = !isCurrentlyActive ? new Date().toISOString().split("T")[0] : "";
        families[index].acompanhamentoPAIF.metas = !isCurrentlyActive ? "Acompanhamento social continuado no PAIF." : "";
        
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
    
    document.getElementById("view-family-title").textContent = `Prontuário SUAS - ${family.responsavel}`;
    document.getElementById("view-cod-familiar").textContent = family.codFamiliar;
    document.getElementById("view-address").textContent = `${family.logradouro}, nº ${family.numero} - Bairro: ${family.bairro}`;
    document.getElementById("view-phone").textContent = family.telefone || "Não informado";
    document.getElementById("view-other-contact").textContent = family.outroContato || "Não cadastrado";
    
    const perCapita = calculatePerCapitaIncome(family);
    document.getElementById("view-per-capita").textContent = perCapita.toFixed(2);
    
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
    
    renderMembersTable(family);
    renderFamilyTimeline(family);
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
            <td>${formatDate(m.dataNascimento)} (${m.idade} anos)</td>
            <td><code>${m.rg || '---'}</code></td>
            <td><code>${m.nis || '---'}</code></td>
            <td>${m.profissao || '---'}</td>
            <td><span class="badge ${m.programaGoverno !== 'Nenhum' ? 'badge-info' : 'badge-neutral'}">${m.programaGoverno || 'Nenhum'}</span></td>
            <td>R$ ${parseFloat(m.renda || 0).toFixed(2)}</td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="btn btn-warning btn-icon-only" style="width:26px; height:26px; font-size:0.75rem;" onclick="editMember('${family.id}', '${m.id}')" title="Editar Membro">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-danger btn-icon-only" style="width:26px; height:26px; font-size:0.75rem;" onclick="removeMember('${family.id}', '${m.id}')" title="Remover Membro">
                        <i class="fa-solid fa-user-minus"></i>
                    </button>
                </div>
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
    
    const sorted = [...family.historicoAtendimentos].sort((a, b) => new Date(b.data + "T" + (b.hora || "00:00")) - new Date(a.data + "T" + (a.hora || "00:00")));
    
    sorted.forEach(at => {
        let displayVisitados = at.usuarioVisitado || family.responsavel;
        if (at.tipo === "Visita Domiciliar" && at.participantesFamiliares && at.participantesFamiliares.length > 0) {
            displayVisitados = at.participantesFamiliares.join(", ");
        }
        
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-date">${formatDate(at.data)} ${at.hora || ''} - Local: ${at.local || 'CRAS'}</div>
                <div class="timeline-title">${at.tecnico} ${at.compartilhada === "Sim" ? `+ ${at.profissionaisParticipantes}` : ''}</div>
                <div class="timeline-body">
                    <strong>Tipo:</strong> ${at.tipo || 'Atendimento'}<br>
                    <strong>Participante(s):</strong> ${displayVisitados}<br>
                    <strong>Relato:</strong> ${at.relato}
                </div>
                <div class="timeline-meta"><strong>Providências:</strong> ${at.providencias || at.encaminhamento || 'Nenhuma registrada'}</div>
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

function openAddMemberModal() {
    document.getElementById("member-family-id").value = activeFamilyIdForDetail;
    document.getElementById("edit-member-id").value = "";
    document.getElementById("modal-member-title").textContent = "Adicionar Membro Familiar";
    document.getElementById("btn-save-member").innerHTML = '<i class="fa-solid fa-save"></i> Adicionar';
    document.getElementById("form-new-member").reset();
    document.getElementById("member-gov-program-text").style.display = "none";
    openModal("modal-add-member");
}

function editMember(familyId, memberId) {
    const families = getFamilies();
    const f = families.find(fam => fam.id === familyId);
    if (!f) return;
    
    const m = f.membros.find(mem => mem.id === memberId);
    if (!m) return;
    
    document.getElementById("member-family-id").value = familyId;
    document.getElementById("edit-member-id").value = memberId;
    document.getElementById("modal-member-title").textContent = "Editar Membro Familiar";
    document.getElementById("btn-save-member").innerHTML = '<i class="fa-solid fa-save"></i> Salvar Alterações';
    
    document.getElementById("member-name").value = m.nome;
    document.getElementById("member-relation").value = m.parentesco;
    document.getElementById("member-birthdate").value = m.dataNascimento;
    document.getElementById("member-income").value = m.renda;
    document.getElementById("member-rg").value = m.rg === "Não Informado" ? "" : (m.rg || "");
    document.getElementById("member-cpf").value = m.cpf || "";
    document.getElementById("member-nis").value = m.nis || "";
    document.getElementById("member-profession").value = m.profissao || "";
    
    const govOptions = ["Nenhum", "Bolsa Família", "BPC (Benefício de Prestação Continuada)", "Bolsa Família + BPC"];
    if (govOptions.includes(m.programaGoverno)) {
        document.getElementById("member-gov-program").value = m.programaGoverno;
        document.getElementById("member-gov-program-text").style.display = "none";
        document.getElementById("member-gov-program-text").value = "";
    } else {
        document.getElementById("member-gov-program").value = "Outros";
        document.getElementById("member-gov-program-text").style.display = "block";
        document.getElementById("member-gov-program-text").value = m.programaGoverno;
    }
    
    document.getElementById("member-education").value = m.escolaridade;
    
    openModal("modal-add-member");
}

function saveNewMember(e) {
    e.preventDefault();
    
    const familyId = document.getElementById("member-family-id").value;
    const name = document.getElementById("member-name").value;
    const relation = document.getElementById("member-relation").value;
    const birthdate = document.getElementById("member-birthdate").value;
    const income = parseFloat(document.getElementById("member-income").value || 0);
    const rg = document.getElementById("member-rg").value;
    const cpf = document.getElementById("member-cpf").value;
    const nis = document.getElementById("member-nis").value;
    const profession = document.getElementById("member-profession").value;
    let govProgram = document.getElementById("member-gov-program").value;
    if (govProgram === "Outros") {
        govProgram = document.getElementById("member-gov-program-text").value.trim() || "Outros";
    }
    const education = document.getElementById("member-education").value;
    
    const dob = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    if (age < 0) age = 0;
    
    const families = getFamilies();
    const familyIndex = families.findIndex(f => f.id === familyId);
    
    if (familyIndex !== -1) {
        const editMemId = document.getElementById("edit-member-id").value;
        
        if (editMemId) {
            const memberIndex = families[familyIndex].membros.findIndex(mem => mem.id === editMemId);
            if (memberIndex !== -1) {
                families[familyIndex].membros[memberIndex].nome = name;
                families[familyIndex].membros[memberIndex].parentesco = relation;
                families[familyIndex].membros[memberIndex].dataNascimento = birthdate;
                families[familyIndex].membros[memberIndex].idade = age;
                families[familyIndex].membros[memberIndex].cpf = cpf;
                families[familyIndex].membros[memberIndex].rg = rg || "Não Informado";
                families[familyIndex].membros[memberIndex].nis = nis;
                families[familyIndex].membros[memberIndex].renda = income;
                families[familyIndex].membros[memberIndex].escolaridade = education;
                families[familyIndex].membros[memberIndex].profissao = profession;
                families[familyIndex].membros[memberIndex].programaGoverno = govProgram;
                
                if (relation === "Responsável" || memberIndex === 0) {
                    families[familyIndex].responsavel = name;
                    families[familyIndex].cpfResponsavel = cpf;
                    families[familyIndex].nisResponsavel = nis;
                }
                
                saveFamilies(families);
                viewFamilyProntuario(familyId);
                
                document.getElementById("form-new-member").reset();
                document.getElementById("edit-member-id").value = "";
                document.getElementById("member-gov-program-text").style.display = "none";
                closeModal("modal-add-member");
                
                renderFamiliesTable();
                updateDashboardStats();
                alert("Dados do membro atualizados com sucesso!");
                return;
            }
        } else {
            const newMember = {
                id: "mem-" + Date.now(),
                nome: name,
                parentesco: relation,
                dataNascimento: birthdate,
                idade: age,
                cpf: cpf,
                rg: rg,
                nis: nis,
                renda: income,
                escolaridade: education,
                profissao: profession,
                programaGoverno: govProgram
            };
            
            families[familyIndex].membros.push(newMember);
            saveFamilies(families);
            
            viewFamilyProntuario(familyId);
            
            document.getElementById("form-new-member").reset();
            document.getElementById("member-gov-program-text").style.display = "none";
            closeModal("modal-add-member");
            
            renderFamiliesTable();
            updateDashboardStats();
        }
    }
}

function removeMember(familyId, memberId) {
    const families = getFamilies();
    const familyIndex = families.findIndex(f => f.id === familyId);
    
    if (familyIndex !== -1) {
        const family = families[familyIndex];
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
// TELA: ATENDIMENTOS & AGENDA TÉCNICA
// ==========================================================================
function updateAppTechOptions() {
    const selectTech = document.getElementById("app-tech");
    if (!selectTech) return;
    
    const profs = getProfessionals();
    selectTech.innerHTML = "";
    
    profs.forEach(p => {
        const option = document.createElement("option");
        option.value = `${p.nome} (${p.cargo})`;
        option.textContent = `${p.nome} (${p.cargo})`;
        selectTech.appendChild(option);
    });
    
    // Atualizar checklist de co-visitantes
    updateAppSharedTechsChecklist();
}

function updateAppSharedTechsChecklist() {
    const container = document.getElementById("techs-multiselect-options");
    const mainTechSelect = document.getElementById("app-tech");
    const label = document.getElementById("techs-multiselect-label");
    if (!container || !mainTechSelect || !label) return;
    
    label.textContent = "Selecione os co-visitantes...";
    label.style.color = "var(--text-muted)";
    
    const mainTechVal = mainTechSelect.value;
    const profs = getProfessionals();
    container.innerHTML = "";
    
    profs.forEach(p => {
        const key = `${p.nome} (${p.cargo})`;
        if (key !== mainTechVal) {
            const labelItem = document.createElement("label");
            labelItem.className = "checkbox-label";
            labelItem.innerHTML = `<input type="checkbox" name="app-shared-techs" value="${key}" onchange="updateTechsMultiselectLabel()"> ${p.nome} (${p.cargo})`;
            container.appendChild(labelItem);
        }
    });
}

window.updateTechsMultiselectLabel = function() {
    const checked = document.querySelectorAll('input[name="app-shared-techs"]:checked');
    const label = document.getElementById("techs-multiselect-label");
    if (!label) return;
    
    if (checked.length === 0) {
        label.textContent = "Selecione os co-visitantes...";
        label.style.color = "var(--text-muted)";
    } else {
        const names = Array.from(checked).map(cb => cb.value.split(" (")[0]);
        label.textContent = names.join(", ");
        label.style.color = "var(--text-main)";
    }
};

function updateAgendaTechOptions() {
    const selectTech = document.getElementById("age-tech");
    if (!selectTech) return;
    
    const profs = getProfessionals();
    selectTech.innerHTML = "";
    
    profs.forEach(p => {
        const option = document.createElement("option");
        option.value = `${p.nome} (${p.cargo})`;
        option.textContent = `${p.nome} (${p.cargo})`;
        selectTech.appendChild(option);
    });
}

function updateAppMemberOptions() {
    const familyId = document.getElementById("app-family").value;
    const selectMember = document.getElementById("app-member");
    const checklistList = document.getElementById("family-multiselect-options");
    const label = document.getElementById("family-multiselect-label");
    if (!selectMember || !checklistList || !label) return;
    
    label.textContent = "Selecione os familiares...";
    label.style.color = "var(--text-muted)";
    
    if (!familyId) {
        selectMember.innerHTML = '<option value="" disabled selected>Aguardando família...</option>';
        checklistList.innerHTML = '<p style="font-size:0.75rem; color:var(--text-muted); padding: 5px;">Aguardando família...</p>';
        return;
    }
    
    const families = getFamilies();
    const family = families.find(f => f.id === familyId);
    
    selectMember.innerHTML = '<option value="" disabled selected>Selecione o membro...</option>';
    checklistList.innerHTML = "";
    
    if (family && family.membros) {
        family.membros.forEach(m => {
            // Dropdown de Atendimento
            const option = document.createElement("option");
            option.value = m.nome;
            option.textContent = `${m.nome} (${m.parentesco})`;
            selectMember.appendChild(option);
            
            // Checkboxes de Visita Domiciliar
            const labelItem = document.createElement("label");
            labelItem.className = "checkbox-label";
            labelItem.innerHTML = `<input type="checkbox" name="app-participants" value="${m.nome}" onchange="updateFamilyMultiselectLabel()"> ${m.nome} (${m.parentesco})`;
            checklistList.appendChild(labelItem);
        });
    }
}

window.updateFamilyMultiselectLabel = function() {
    const checked = document.querySelectorAll('input[name="app-participants"]:checked');
    const label = document.getElementById("family-multiselect-label");
    if (!label) return;
    
    if (checked.length === 0) {
        label.textContent = "Selecione os familiares...";
        label.style.color = "var(--text-muted)";
    } else {
        const names = Array.from(checked).map(cb => cb.value);
        label.textContent = names.join(", ");
        label.style.color = "var(--text-main)";
    }
};

function renderAppointmentsTable() {
    const families = getFamilies();
    const tbody = document.getElementById("appointments-table-body");
    tbody.innerHTML = "";
    
    let allAtendimentos = [];
    families.forEach(f => {
        if (f.historicoAtendimentos) {
            f.historicoAtendimentos.forEach(at => {
                allAtendimentos.push({
                    familyId: f.id,
                    responsavel: f.responsavel,
                    nis: f.nisResponsavel,
                    ...at
                });
            });
        }
    });
    
    allAtendimentos.sort((a, b) => new Date(b.data + "T" + (b.hora || "00:00")) - new Date(a.data + "T" + (a.hora || "00:00")));
    
    if (allAtendimentos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhum atendimento registrado.</td></tr>`;
        return;
    }
    
    allAtendimentos.forEach(at => {
        const techDisplay = at.compartilhada === "Sim" && at.profissionaisParticipantes 
            ? `${at.tecnico} + ${at.profissionaisParticipantes}`
            : at.tecnico;
            
        let displayVisitados = at.usuarioVisitado || at.responsavel;
        if (at.tipo === "Visita Domiciliar" && at.participantesFamiliares && at.participantesFamiliares.length > 0) {
            displayVisitados = at.participantesFamiliares.join(", ");
        }
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(at.data)} <span style="font-size:0.75rem; color:var(--text-muted);">${at.hora || ''}</span></td>
            <td><strong>${at.responsavel}</strong><br><span style="font-size:0.75rem; color:var(--primary-light);">${at.tipo || 'Atendimento'}: ${displayVisitados}</span></td>
            <td>${techDisplay}</td>
            <td><span class="badge badge-neutral">${at.local || 'CRAS'}</span></td>
            <td style="max-width: 250px; font-size:0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <strong>Relato:</strong> <span title="${at.relato}">${at.relato}</span><br>
                <strong>Providências:</strong> <span title="${at.providencias || at.encaminhamento || ''}">${at.providencias || at.encaminhamento || ''}</span>
            </td>
            <td>
                <button class="btn btn-secondary btn-icon-only" onclick="printAppointment('${at.familyId}', '${at.id}')" title="Imprimir Relatório de Atendimento">
                    <i class="fa-solid fa-print"></i>
                </button>
            </td>
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
                    familyId: f.id,
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
    
    filtered.sort((a, b) => new Date(b.data + "T" + (b.hora || "00:00")) - new Date(a.data + "T" + (a.hora || "00:00")));
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhum atendimento corresponde aos filtros.</td></tr>`;
        return;
    }
    
    filtered.forEach(at => {
        const techDisplay = at.compartilhada === "Sim" && at.profissionaisParticipantes 
            ? `${at.tecnico} + ${at.profissionaisParticipantes}`
            : at.tecnico;
            
        let displayVisitados = at.usuarioVisitado || at.responsavel;
        if (at.tipo === "Visita Domiciliar" && at.participantesFamiliares && at.participantesFamiliares.length > 0) {
            displayVisitados = at.participantesFamiliares.join(", ");
        }
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatDate(at.data)} <span style="font-size:0.75rem; color:var(--text-muted);">${at.hora || ''}</span></td>
            <td><strong>${at.responsavel}</strong><br><span style="font-size:0.75rem; color:var(--primary-light);">${at.tipo || 'Atendimento'}: ${displayVisitados}</span></td>
            <td>${techDisplay}</td>
            <td><span class="badge badge-neutral">${at.local || 'CRAS'}</span></td>
            <td style="max-width: 250px; font-size:0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <strong>Relato:</strong> <span title="${at.relato}">${at.relato}</span><br>
                <strong>Providências:</strong> <span title="${at.providencias || at.encaminhamento || ''}">${at.providencias || at.encaminhamento || ''}</span>
            </td>
            <td>
                <button class="btn btn-secondary btn-icon-only" onclick="printAppointment('${at.familyId}', '${at.id}')" title="Imprimir Relatório de Atendimento">
                    <i class="fa-solid fa-print"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function saveNewAppointment(e) {
    e.preventDefault();
    
    const familyId = document.getElementById("app-family").value;
    const actionType = document.getElementById("app-action-type").value;
    const date = document.getElementById("app-date").value;
    const time = document.getElementById("app-time").value;
    const location = document.getElementById("app-location").value;
    const tech = document.getElementById("app-tech").value;
    const shared = document.getElementById("app-shared").value;
    
    let sharedTechs = "";
    if (shared === "Sim") {
        const checkedTechs = document.querySelectorAll('input[name="app-shared-techs"]:checked');
        const listTechs = Array.from(checkedTechs).map(cb => cb.value);
        sharedTechs = listTechs.join(", ");
    }
    
    const relato = document.getElementById("app-relato").value;
    const providencias = document.getElementById("app-providencias").value;
    
    if (!familyId) {
        alert("Por favor, selecione uma família.");
        return;
    }
    
    if (!actionType) {
        alert("Por favor, selecione o tipo de ação.");
        return;
    }
    
    let usuarioVisitado = "";
    let participantesFamiliares = [];
    
    if (actionType === "Atendimento") {
        usuarioVisitado = document.getElementById("app-member").value;
        if (!usuarioVisitado) {
            alert("Por favor, selecione o usuário atendido.");
            return;
        }
        participantesFamiliares = [usuarioVisitado];
    } else {
        // Visita Domiciliar
        const checkedBoxes = document.querySelectorAll('input[name="app-participants"]:checked');
        if (checkedBoxes.length === 0) {
            alert("Por favor, selecione pelo menos um participante familiar presente na visita.");
            return;
        }
        checkedBoxes.forEach(cb => {
            participantesFamiliares.push(cb.value);
        });
        usuarioVisitado = participantesFamiliares.join(", ");
    }
    
    const families = getFamilies();
    const familyIndex = families.findIndex(f => f.id === familyId);
    
    if (familyIndex !== -1) {
        const newApp = {
            id: "at-" + Date.now(),
            data: date,
            hora: time,
            usuarioVisitado: usuarioVisitado,
            participantesFamiliares: participantesFamiliares,
            local: location,
            compartilhada: shared,
            profissionaisParticipantes: sharedTechs,
            tecnico: tech,
            relato: relato,
            providencias: providencias,
            tipo: actionType
        };
        
        families[familyIndex].historicoAtendimentos.push(newApp);
        saveFamilies(families);
        
        document.getElementById("form-new-appointment").reset();
        document.getElementById("app-shared-techs-container").style.display = "none";
        document.getElementById("app-single-member-group").style.display = "none";
        document.getElementById("app-multiple-members-group").style.display = "none";
        closeModal("modal-add-appointment");
        
        renderAppointmentsTable();
        updateDashboardStats();
        alert("Atendimento/Visita registrada com sucesso!");
    }
}

// LÓGICA DA AGENDA TÉCNICA
function renderAgenda() {
    const agenda = getAgenda();
    const container = document.getElementById("agenda-list-container");
    container.innerHTML = "";
    
    const activeAgenda = agenda.filter(a => a.status === "Agendado").sort((a, b) => new Date(a.data + "T" + a.hora) - new Date(b.data + "T" + b.hora));
    
    if (activeAgenda.length === 0) {
        container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding: 20px;">Nenhum compromisso agendado.</p>`;
        return;
    }
    
    activeAgenda.forEach(ag => {
        const card = document.createElement("div");
        card.className = "agenda-card";
        card.innerHTML = `
            <div class="agenda-time-badge">
                <span><i class="fa-regular fa-calendar"></i> ${formatDate(ag.data)}</span>
                <span><i class="fa-regular fa-clock"></i> ${ag.hora}</span>
            </div>
            <div class="agenda-family">${ag.responsavel}</div>
            <div class="agenda-type">${ag.tipo}</div>
            <div class="agenda-desc">${ag.descricao}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;"><strong>Técnico:</strong> ${ag.tecnico}</div>
            <div class="agenda-actions">
                <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="updateAgendaStatus('${ag.id}', 'Não Compareceu')">Falta</button>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="updateAgendaStatus('${ag.id}', 'Cancelado')">Cancelar</button>
                <button class="btn btn-success" style="padding:4px 10px; font-size:0.75rem;" onclick="markAgendaRealized('${ag.id}')">Realizado</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function saveNewAgenda(e) {
    e.preventDefault();
    
    const familyId = document.getElementById("age-family").value;
    const type = document.getElementById("age-type").value;
    const date = document.getElementById("age-date").value;
    const hour = document.getElementById("age-hour").value;
    const tech = document.getElementById("age-tech").value;
    const desc = document.getElementById("age-desc").value;
    
    if (!familyId) {
        alert("Selecione a família.");
        return;
    }
    
    const families = getFamilies();
    const family = families.find(f => f.id === familyId);
    
    const agenda = getAgenda();
    const newEvent = {
        id: "ag-" + Date.now(),
        data: date,
        hora: hour,
        tipo: type,
        familiaId: familyId,
        responsavel: family.responsavel,
        tecnico: tech,
        descricao: desc,
        status: "Agendado"
    };
    
    agenda.push(newEvent);
    saveAgenda(agenda);
    
    document.getElementById("form-new-agenda").reset();
    closeModal("modal-add-agenda");
    
    renderAgenda();
}

function updateAgendaStatus(id, newStatus) {
    const agenda = getAgenda();
    const index = agenda.findIndex(a => a.id === id);
    if (index !== -1) {
        const item = agenda[index];
        if (newStatus === "Não Compareceu") {
            let reason = "";
            while (!reason || reason.trim() === "") {
                reason = prompt("ATENÇÃO TÉCNICO: O motivo da falta deve ser informado obrigatoriamente. Informe o motivo:");
                if (reason === null) return; // cancel operation
            }
            addAgendaEventToHistory(item, "Falta / Não Comparecimento", reason);
        } else if (newStatus === "Cancelado") {
            let reason = "";
            while (!reason || reason.trim() === "") {
                reason = prompt("Informe o motivo do cancelamento do compromisso:");
                if (reason === null) return; // cancel operation
            }
            addAgendaEventToHistory(item, "Agendamento Cancelado", reason);
        }
        
        agenda[index].status = newStatus;
        saveAgenda(agenda);
        renderAgenda();
    }
}

function addAgendaEventToHistory(item, eventType, reason) {
    const families = getFamilies();
    const familyIndex = families.findIndex(f => f.id === item.familiaId);
    if (familyIndex !== -1) {
        const newHistoryItem = {
            id: "at-" + Date.now(),
            data: item.data,
            hora: item.hora,
            usuarioVisitado: item.responsavel,
            participantesFamiliares: [item.responsavel],
            local: item.tipo === "Visita Domiciliar" ? "Domicílio" : "CRAS",
            compartilhada: "Não",
            profissionaisParticipantes: "",
            tecnico: item.tecnico,
            tipo: eventType,
            relato: `Compromisso agendado não realizado. Situação: ${eventType}. Motivo registrado: ${reason}`,
            providencias: "Compromisso arquivado no histórico. Reavaliar necessidade de remarcação profissional."
        };
        families[familyIndex].historicoAtendimentos.push(newHistoryItem);
        saveFamilies(families);
        renderAppointmentsTable();
        updateDashboardStats();
    }
}

function markAgendaRealized(id) {
    const agenda = getAgenda();
    const item = agenda.find(a => a.id === id);
    if (item) {
        // Atualizar status diretamente no array para evitar loop de prompt de falta
        const idx = agenda.findIndex(a => a.id === id);
        agenda[idx].status = "Realizado";
        saveAgenda(agenda);
        renderAgenda();
        
        openModal("modal-add-appointment");
        
        document.getElementById("app-family").value = item.familiaId;
        updateAppMemberOptions();
        
        const isVisita = item.tipo === "Visita Domiciliar";
        document.getElementById("app-action-type").value = isVisita ? "Visita Domiciliar" : "Atendimento";
        
        const event = new Event('change');
        document.getElementById("app-action-type").dispatchEvent(event);
        
        document.getElementById("app-tech").value = item.tecnico;
        // Atualizar co-visitantes
        updateAppSharedTechsChecklist();
        
        document.getElementById("app-date").value = item.data;
        document.getElementById("app-time").value = item.hora;
        document.getElementById("app-relato").value = `Compromisso técnico realizado: ${item.descricao}`;
    }
}

// ==========================================================================
// TELA: BENEFÍCIOS & ALMOXARIFADO
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
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - 30);
        
        const recentConcession = family.beneficiosConcedidos.find(ben => {
            return ben.tipo === type && new Date(ben.data) >= limitDate;
        });
        
        if (recentConcession) {
            warningBox.style.display = "block";
            warningBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>Aviso:</strong> A família já recebeu o benefício <strong>${type}</strong> em ${formatDate(recentConcession.data)}. Conceder novamente pode gerar duplicidade em curto período.`;
        } else {
            warningBox.style.display = "none";
        }
    } else {
        warningBox.style.display = "none";
    }
}

// ALMOXARIFADO ESTOQUE
function renderStock() {
    const stock = getStock();
    const container = document.getElementById("cras-stock-container");
    container.innerHTML = "";
    
    stock.forEach(item => {
        let fillClass = "high";
        let maxSim = 50;
        
        if (item.saldo <= 5) {
            fillClass = "low";
        } else if (item.saldo <= 15) {
            fillClass = "medium";
        }
        
        const pct = Math.min((item.saldo / maxSim) * 100, 100);
        
        const card = document.createElement("div");
        card.className = "stock-card";
        card.innerHTML = `
            <div class="stock-card-header">
                <span>${item.tipo}</span>
                <span class="badge ${item.saldo <= 5 ? 'badge-danger' : (item.saldo <= 15 ? 'badge-warning' : 'badge-success')}">
                    ${item.saldo <= 5 ? 'Estoque Crítico' : (item.saldo <= 15 ? 'Estoque Baixo' : 'Estoque Saudável')}
                </span>
            </div>
            <div class="stock-balance">
                ${item.saldo} <span>${item.unidade}</span>
            </div>
            <div class="stock-level-bar">
                <div class="stock-level-fill ${fillClass}" style="width: ${pct}%;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function saveStockEntry(e) {
    e.preventDefault();
    
    const type = document.getElementById("stk-type").value;
    const qty = parseInt(document.getElementById("stk-qty").value);
    
    const stock = getStock();
    const index = stock.findIndex(item => item.tipo === type);
    
    if (index !== -1) {
        stock[index].saldo += qty;
        saveStock(stock);
        renderStock();
        
        document.getElementById("form-new-stock").reset();
        closeModal("modal-add-stock");
        alert(`Entrada de ${qty} itens no estoque de ${type} registrada.`);
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
    
    const stock = getStock();
    const stockIndex = stock.findIndex(item => item.tipo === type);
    
    if (stockIndex !== -1) {
        if (stock[stockIndex].saldo <= 0) {
            alert(`ATENÇÃO TÉCNICO: Não há saldo disponível de [${type}] no almoxarifado do CRAS. Realize uma entrada de estoque para efetuar a entrega.`);
            return;
        }
        stock[stockIndex].saldo -= 1;
        saveStock(stock);
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
        renderStock();
        updateDashboardStats();
        
        alert("Benefício concedido e registrado com sucesso. Baixa automática realizada no almoxarifado.");
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
    
    const dailyPresencesObj = group.presencas.find(p => p.data === dateInput);
    const presentMemberIds = dailyPresencesObj ? dailyPresencesObj.presentes : [];
    
    if (group.participantes.length === 0) {
        container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">Não existem participantes cadastrados neste grupo.</p>`;
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
    parent.querySelectorAll(".attendance-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

// ==========================================================================
// TELA: ENCAMINHAMENTOS (REFERÊNCIA E CONTRARREFERÊNCIA)
// ==========================================================================
function renderReferralsTable() {
    const referrals = getReferrals();
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
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-secondary btn-icon-only" style="width:28px; height:28px; font-size:0.75rem;" onclick="printReferral('${ref.id}')" title="Imprimir Guia Oficial">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    ${ref.status === "Pendente" ? `
                        <button class="btn btn-success btn-icon-only" style="width:28px; height:28px; font-size:0.75rem;" onclick="answerReferral('${ref.id}')" title="Registrar Contrarreferência">
                            <i class="fa-solid fa-reply"></i>
                        </button>
                    ` : ''}
                </div>
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
    
    if (mapInstance !== null) {
        mapInstance.invalidateSize();
        return;
    }
    
    mapInstance = L.map('cras-map').setView([-12.9714, -38.5014], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);
    
    renderMapMarkers();
}

function renderMapMarkers() {
    if (!mapInstance) return;
    
    mapInstance.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            mapInstance.removeLayer(layer);
        }
    });
    
    const families = getFamilies();
    
    families.forEach(f => {
        if (f.latitude && f.longitude) {
            let color = "#2ec4b6";
            let risk = "Baixo";
            
            const vulCount = f.vulnerabilidades ? f.vulnerabilidades.length : 0;
            
            if (vulCount >= 3) {
                color = "#e71d36";
                risk = "Alto";
            } else if (vulCount >= 1) {
                color = "#ff9f1c";
                risk = "Médio";
            }
            
            const customIcon = L.divIcon({
                html: `<div style="background-color:${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: var(--shadow-sm);"></div>`,
                className: 'custom-div-icon',
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            });
            
            const marker = L.marker([f.latitude, f.longitude], { icon: customIcon }).addTo(mapInstance);
            
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
    const baseMonthStr = `2026-${month}`;
    
    const a1Count = families.filter(f => {
        return f.acompanhamentoPAIF && 
               f.acompanhamentoPAIF.ativo && 
               f.acompanhamentoPAIF.dataInicio !== "" &&
               new Date(f.acompanhamentoPAIF.dataInicio) < new Date(`${baseMonthStr}-01`);
    }).length;
    
    const a2Count = families.filter(f => {
        return f.acompanhamentoPAIF && 
               f.acompanhamentoPAIF.ativo && 
               f.acompanhamentoPAIF.dataInicio !== "" &&
               f.acompanhamentoPAIF.dataInicio.startsWith(baseMonthStr);
    }).length;
    
    const a4Count = a1Count + a2Count;
    
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
    
    document.getElementById("rma-a1").textContent = a1Count;
    document.getElementById("rma-a2").textContent = a2Count;
    document.getElementById("rma-a4").textContent = a4Count;
    document.getElementById("rma-b1").textContent = b1Count;
    document.getElementById("rma-b2").textContent = b2Count;
    document.getElementById("rma-b3").textContent = b3Count;
}

// ==========================================================================
// FLUXO DE IMPRESSÃO OFICIAL (PDF)
// ==========================================================================

// 1. Imprimir Dossiê Completo do Prontuário SUAS
function printFamilyProntuario() {
    const families = getFamilies();
    const family = families.find(f => f.id === activeFamilyIdForDetail);
    if (!family) return;
    
    const s = getSettings();
    const perCapita = calculatePerCapitaIncome(family);
    
    let logoHtml = s.logoUrl && s.logoUrl.trim() !== "" 
        ? `<img src="${s.logoUrl}" alt="Logo">` 
        : `<i class="fa-solid fa-people-roof" style="font-size:32pt; color:#134e5e;"></i>`;
        
    let membersRows = "";
    family.membros.forEach(m => {
        membersRows += `
            <tr>
                <td>${m.nome}</td>
                <td>${m.parentesco}</td>
                <td>${formatDate(m.dataNascimento)} (${m.idade} anos)</td>
                <td>${m.rg || '---'}</td>
                <td>${m.nis || '---'}</td>
                <td>${m.profissao || '---'}</td>
                <td>${m.programaGoverno || 'Nenhum'}</td>
                <td>R$ ${parseFloat(m.renda).toFixed(2)}</td>
            </tr>
        `;
    });
    
    let timelineHtml = "";
    if (family.historicoAtendimentos) {
        family.historicoAtendimentos.forEach(at => {
            let displayVisitados = at.usuarioVisitado || family.responsavel;
            if (at.tipo === "Visita Domiciliar" && at.participantesFamiliares && at.participantesFamiliares.length > 0) {
                displayVisitados = at.participantesFamiliares.join(", ");
            }
            
            timelineHtml += `
                <div style="margin-bottom: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 8px;">
                    <strong>${formatDate(at.data)} ${at.hora || ''} - ${at.tipo || 'Atendimento'}</strong> (${at.tecnico})<br>
                    <p style="margin-top: 4px;"><strong>Participante(s):</strong> ${displayVisitados}</p>
                    <p style="margin-top: 4px;">${at.relato}</p>
                    ${at.providencias || at.encaminhamento ? `<p style="font-size: 8.5pt; color: #555;"><strong>Providências:</strong> ${at.providencias || at.encaminhamento}</p>` : ""}
                </div>
            `;
        });
    }
    
    const htmlContent = `
        <div class="print-header">
            ${logoHtml}
            <div class="print-header-text">
                <h3>${s.municipio.toUpperCase()}</h3>
                <h4>${s.secretaria.toUpperCase()}</h4>
                <h5>CENTRO DE REFERÊNCIA DA ASSISTÊNCIA SOCIAL</h5>
                <h6>${s.crasUnidade.toUpperCase()}</h6>
            </div>
        </div>
        <div class="print-title">Dossiê de Acompanhamento Familiar</div>
        
        <div class="print-grid">
            <div class="print-group">
                <div class="print-group-title">Responsável Familiar</div>
                <div class="print-field"><strong>Nome:</strong> ${family.responsavel}</div>
                <div class="print-field"><strong>CPF:</strong> ${family.cpfResponsavel}</div>
                <div class="print-field"><strong>NIS:</strong> ${family.nisResponsavel}</div>
                <div class="print-field"><strong>Telefone Principal:</strong> ${family.telefone || 'Não informado'}</div>
                <div class="print-field"><strong>Contato Alt:</strong> ${family.outroContato || 'Não informado'}</div>
            </div>
            
            <div class="print-group">
                <div class="print-group-title">Indicadores Sociais</div>
                <div class="print-field"><strong>Cód. Família:</strong> ${family.codFamiliar}</div>
                <div class="print-field"><strong>Renda Familiar Capita:</strong> R$ ${perCapita.toFixed(2)}</div>
                <div class="print-field"><strong>Vulnerabilidades:</strong> ${family.vulnerabilidades.join(", ") || 'Nenhuma registrada'}</div>
                <div class="print-field"><strong>PAIF Ativo:</strong> ${family.acompanhamentoPAIF.ativo ? "Sim (Ativo)" : "Não"}</div>
            </div>
            
            <div class="print-group">
                <div class="print-group-title">Condições de Moradia</div>
                <div class="print-field"><strong>Tipo:</strong> ${family.moradia.tipo}</div>
                <div class="print-field"><strong>Água:</strong> ${family.moradia.abastecimentoAgua}</div>
            </div>
            
            <div class="print-group">
                <div class="print-group-title">Infraestrutura Sanitária</div>
                <div class="print-field"><strong>Saneamento:</strong> ${family.moradia.escoamentoSanitario}</div>
                <div class="print-field"><strong>Coleta de Lixo:</strong> ${family.moradia.coletaLixo}</div>
            </div>
            
            <div class="print-group full-width">
                <div class="print-group-title">Composição Familiar (Membros)</div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Membro</th>
                            <th>Parentesco</th>
                            <th>Nascimento (Idade)</th>
                            <th>RG</th>
                            <th>NIS</th>
                            <th>Ocupação</th>
                            <th>Prog. Social</th>
                            <th>Renda Individual</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${membersRows}
                    </tbody>
                </table>
            </div>
            
            <div class="print-group full-width">
                <div class="print-group-title">Histórico de Intervenções e Atendimentos</div>
                <div style="padding-top:8px;">
                    ${timelineHtml || 'Sem atendimentos registrados.'}
                </div>
            </div>
        </div>
        
        <div class="print-signatures" style="margin-top: 40px;">
            <div class="print-signature-box">
                <div class="print-line"></div>
                <div style="font-size: 9pt;">${family.responsavel}</div>
                <div style="font-size: 8pt; color: #555;">Assinatura do Usuário</div>
            </div>
            <div class="print-signature-box">
                <div class="print-line"></div>
                <div style="font-size: 9pt;">Técnico Responsável</div>
                <div style="font-size: 8pt; color: #555;">CRAS / SUAS</div>
            </div>
        </div>
        
        <div class="print-footer">
            <strong>${s.crasUnidade}</strong> • Endereço: ${s.endereco} • Contato: ${s.telefone} • E-mail: ${s.email}<br>
            <span style="font-size: 7.5pt; color: #999;">Documento gerado eletronicamente via SUAS Digital em ${new Date().toLocaleDateString("pt-BR")}.</span>
        </div>
    `;
    
    document.getElementById("cras-print-document").innerHTML = htmlContent;
    window.print();
}

// 2. Imprimir Guia Oficial de Encaminhamento (Referência)
function printReferral(refId) {
    const referrals = getReferrals();
    const ref = referrals.find(r => r.id === refId);
    if (!ref) return;
    
    const s = getSettings();
    const families = getFamilies();
    const family = families.find(f => f.id === ref.familiaId);
    
    let logoHtml = s.logoUrl && s.logoUrl.trim() !== "" 
        ? `<img src="${s.logoUrl}" alt="Logo">` 
        : `<i class="fa-solid fa-people-roof" style="font-size:32pt; color:#134e5e;"></i>`;
        
    const profs = getProfessionals();
    const findProfDetails = (techStr) => {
        const nameOnly = techStr.split(" (")[0].trim();
        const found = profs.find(p => p.nome.toLowerCase() === nameOnly.toLowerCase());
        if (found) {
            return {
                nome: found.nome,
                cargo: found.cargo,
                conselho: found.conselho ? ` • ${found.conselho}` : ""
            };
        }
        let cargo = "";
        if (techStr.includes("(") && techStr.includes(")")) {
            cargo = techStr.substring(techStr.indexOf("(")+1, techStr.indexOf(")"));
        }
        return {
            nome: nameOnly,
            cargo: cargo,
            conselho: ""
        };
    };
    
    const refDetails = findProfDetails(ref.tecnico);

    const htmlContent = `
        <div class="print-header">
            ${logoHtml}
            <div class="print-header-text">
                <h3>${s.municipio.toUpperCase()}</h3>
                <h4>${s.secretaria.toUpperCase()}</h4>
                <h5>CENTRO DE REFERÊNCIA DA ASSISTÊNCIA SOCIAL</h5>
                <h6>${s.crasUnidade.toUpperCase()}</h6>
            </div>
        </div>
        <div class="print-title">Guia de Encaminhamento Socioassistencial<br><span style="font-size: 9pt; font-weight: normal; text-transform: none;">(Proteção Social Básica / SUAS)</span></div>
        
        <div class="print-grid">
            <div class="print-group full-width">
                <div class="print-group-title">Dados do Beneficiário</div>
                <div class="print-field"><strong>Nome Completo:</strong> ${ref.beneficiario}</div>
                <div class="print-field"><strong>Unidade Familiar (Responsável):</strong> ${family ? family.responsavel : 'Não cadastrado'} (Cód: ${family ? family.codFamiliar : '---'})</div>
                <div class="print-field"><strong>Endereço da Família:</strong> ${family ? `${family.logradouro}, nº ${family.numero} - ${family.bairro}` : 'Não informado'}</div>
            </div>
            
            <div class="print-group">
                <div class="print-group-title">Origem / Emissor</div>
                <div class="print-field"><strong>Unidade Emissora:</strong> ${s.crasUnidade}</div>
                <div class="print-field"><strong>Técnico Responsável:</strong> ${refDetails.nome}</div>
                <div class="print-field"><strong>Data de Emissão:</strong> ${formatDate(ref.dataEnvio)}</div>
            </div>
            
            <div class="print-group">
                <div class="print-group-title">Destino / Encaminhado Para</div>
                <div class="print-field"><strong>Instituição/Órgão:</strong> ${ref.destino}</div>
                <div class="print-field"><strong>Status Atual:</strong> ${ref.status}</div>
            </div>
            
            <div class="print-group full-width">
                <div class="print-group-title">Finalidade / Justificativa Profissional</div>
                <div class="print-field" style="margin-top: 6px; min-height: 100px; padding: 10px; border: 1px dotted #ccc; background-color: #fafafa; border-radius: 4px;">
                    ${ref.motivo}
                </div>
            </div>
 
            <div class="print-group full-width" style="margin-top: 15px; border: 2px dashed #999;">
                <div class="print-group-title" style="color: #444;"><i class="fa-solid fa-reply"></i> Espaço Reservado para Contrarreferência (Retorno da Instituição Destinatária)</div>
                <p style="font-size: 8pt; color: #555; margin-bottom: 20px;">Por favor, descreva abaixo as providências tomadas, a data de atendimento e devolva esta guia assinada e carimbada ao CRAS de origem para consolidação de prontuário.</p>
                <div style="min-height: 120px; border-bottom: 1px solid #ccc; margin-bottom: 20px;"></div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 8.5pt;">
                    <div>Data do atendimento: ______/______/__________</div>
                    <div style="text-align: center; width: 250px;">
                        <div style="border-top: 1px solid #000; margin-bottom: 4px;"></div>
                        Assinatura e Carimbo do Profissional
                    </div>
                </div>
            </div>
        </div>
        
        <div class="print-signatures" style="margin-top: 35px;">
            <div class="print-signature-box" style="grid-column: span 2; align-items: flex-end; padding-right: 40px;">
                <div class="print-line" style="width: 250px;"></div>
                <div style="font-size: 9.5pt; font-weight: 700; width: 250px;">${refDetails.nome}</div>
                <div style="font-size: 8.5pt; color: #555; width: 250px;">${refDetails.cargo}${refDetails.conselho}</div>
            </div>
        </div>
        
        <div class="print-footer">
            <strong>${s.crasUnidade}</strong> • Endereço: ${s.endereco} • Contato: ${s.telefone} • E-mail: ${s.email}<br>
            <span style="font-size: 7.5pt; color: #999;">Guia emitida eletronicamente via SUAS Digital. Código interno: ${ref.id}.</span>
        </div>
    `;
    
    document.getElementById("cras-print-document").innerHTML = htmlContent;
    window.print();
}

// 3. Imprimir Relatório Oficial de Atendimento/Visita
function printAppointment(familyId, appId) {
    const families = getFamilies();
    const family = families.find(f => f.id === familyId);
    if (!family) return;
    
    const at = family.historicoAtendimentos.find(a => a.id === appId);
    if (!at) return;
    
    const s = getSettings();
    
    let logoHtml = s.logoUrl && s.logoUrl.trim() !== "" 
        ? `<img src="${s.logoUrl}" alt="Logo">` 
        : `<i class="fa-solid fa-people-roof" style="font-size:32pt; color:#134e5e;"></i>`;
        
    // Data por extenso
    const dateObj = new Date(at.data + "T00:00:00");
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateInFull = dateObj.toLocaleDateString('pt-BR', options);
    const city = s.municipio.replace("Prefeitura Municipal de ", "").replace("PM ", "") || "Salvador";
    const signatureDate = `${city}, ${dateInFull}`;
    
    let labelVisitados = "Membro Visitado/Atendido";
    let valorVisitados = at.usuarioVisitado || family.responsavel;
    if (at.tipo === "Visita Domiciliar") {
        labelVisitados = "Participantes Familiares (Presentes)";
        valorVisitados = (at.participantesFamiliares && at.participantesFamiliares.length > 0) 
            ? at.participantesFamiliares.join(", ") 
            : (at.usuarioVisitado || family.responsavel);
    }
    
    // Gerar assinaturas de forma dinâmica com Cargo e Conselho
    let signaturesHtml = "";
    const profs = getProfessionals();
    const findProfDetails = (techStr) => {
        const nameOnly = techStr.split(" (")[0].trim();
        const found = profs.find(p => p.nome.toLowerCase() === nameOnly.toLowerCase());
        if (found) {
            return {
                nome: found.nome,
                cargo: found.cargo,
                conselho: found.conselho ? ` • ${found.conselho}` : ""
            };
        }
        let cargo = "";
        if (techStr.includes("(") && techStr.includes(")")) {
            cargo = techStr.substring(techStr.indexOf("(")+1, techStr.indexOf(")"));
        }
        return {
            nome: nameOnly,
            cargo: cargo,
            conselho: ""
        };
    };

    if (at.tipo === "Visita Domiciliar") {
        // Apenas assinaturas do corpo técnico
        const mainDetails = findProfDetails(at.tecnico);
        signaturesHtml += `
            <div class="print-signature-box">
                <div class="print-line"></div>
                <div style="font-size: 9.5pt; font-weight: 700;">${mainDetails.nome}</div>
                <div style="font-size: 8.5pt; color: #555;">${mainDetails.cargo}${mainDetails.conselho}</div>
            </div>
        `;
        
        if (at.compartilhada === "Sim" && at.profissionaisParticipantes) {
            const coTechs = at.profissionaisParticipantes.split(",").map(t => t.trim());
            coTechs.forEach(techStr => {
                if (techStr) {
                    const coDetails = findProfDetails(techStr);
                    signaturesHtml += `
                        <div class="print-signature-box">
                            <div class="print-line"></div>
                            <div style="font-size: 9.5pt; font-weight: 700;">${coDetails.nome}</div>
                            <div style="font-size: 8.5pt; color: #555;">${coDetails.cargo}${coDetails.conselho}</div>
                        </div>
                    `;
                }
            });
        }
    } else {
        // Atendimento normal: assinatura do técnico e do usuário
        const mainDetails = findProfDetails(at.tecnico);
        signaturesHtml += `
            <div class="print-signature-box">
                <div class="print-line"></div>
                <div style="font-size: 9.5pt; font-weight: 700;">${mainDetails.nome}</div>
                <div style="font-size: 8.5pt; color: #555;">${mainDetails.cargo}${mainDetails.conselho}</div>
            </div>
            <div class="print-signature-box">
                <div class="print-line"></div>
                <div style="font-size: 9.5pt; font-weight: 700;">${at.usuarioVisitado || family.responsavel}</div>
                <div style="font-size: 8.5pt; color: #555;">Assinatura do Usuário</div>
            </div>
        `;
    }
    
    const htmlContent = `
        <div class="print-header">
            ${logoHtml}
            <div class="print-header-text">
                <h3>${s.municipio.toUpperCase()}</h3>
                <h4>${s.secretaria.toUpperCase()}</h4>
                <h5>CENTRO DE REFERÊNCIA DA ASSISTÊNCIA SOCIAL</h5>
                <h6>${s.crasUnidade.toUpperCase()}</h6>
            </div>
        </div>
        <div class="print-title">Relatório de ${at.tipo || 'Atendimento / Visita'}</div>
        
        <div class="print-grid">
            <div class="print-group full-width">
                <div class="print-group-title">Qualificação da Família</div>
                <div class="print-field"><strong>Responsável Familiar:</strong> ${family.responsavel}</div>
                <div class="print-field"><strong>Código Familiar (CadÚnico/SUAS):</strong> ${family.codFamiliar}</div>
                <div class="print-field"><strong>Endereço:</strong> ${family.logradouro}, nº ${family.numero} - Bairro: ${family.bairro}</div>
                <div class="print-field"><strong>${labelVisitados}:</strong> ${valorVisitados}</div>
            </div>
            
            <div class="print-group">
                <div class="print-group-title">Informações do Registro</div>
                <div class="print-field"><strong>Tipo de Ação:</strong> ${at.tipo || 'Atendimento'}</div>
                <div class="print-field"><strong>Data/Hora:</strong> ${formatDate(at.data)} às ${at.hora || '---'}</div>
                <div class="print-field"><strong>Local:</strong> ${at.local || 'CRAS'}</div>
            </div>
            
            <div class="print-group">
                <div class="print-group-title">Corpo Técnico</div>
                <div class="print-field"><strong>Técnico Responsável:</strong> ${at.tecnico}</div>
                ${at.compartilhada === "Sim" ? `<div class="print-field"><strong>Parceiros:</strong> ${at.profissionaisParticipantes}</div>` : `<div class="print-field"><strong>Visita Compartilhada:</strong> Não</div>`}
            </div>
            
            <div class="print-group full-width">
                <div class="print-group-title">Relato Técnico / Anotações</div>
                <div class="print-field" style="margin-top: 6px; min-height: 120px; padding: 12px; border: 1px dotted #ccc; background-color: #fafafa; border-radius: 4px; line-height: 1.4;">
                    ${at.relato}
                </div>
            </div>
            
            <div class="print-group full-width">
                <div class="print-group-title">Providências Adotadas</div>
                <div class="print-field" style="margin-top: 6px; min-height: 80px; padding: 12px; border: 1px dotted #ccc; background-color: #fafafa; border-radius: 4px; line-height: 1.4;">
                    ${at.providencias || at.encaminhamento || 'Nenhuma providência registrada.'}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: right; font-size: 10pt; font-weight: bold; color: #333;">
            ${signatureDate}
        </div>
        
        <div class="print-signatures" style="margin-top: 50px;">
            ${signaturesHtml}
        </div>
        
        <div class="print-footer">
            <strong>${s.crasUnidade}</strong> • Endereço: ${s.endereco} • Contato: ${s.telefone} • E-mail: ${s.email}<br>
            <span style="font-size: 7.5pt; color: #999;">Documento emitido eletronicamente via SUAS Digital. Código interno: ${at.id}.</span>
        </div>
    `;
    
    document.getElementById("cras-print-document").innerHTML = htmlContent;
    window.print();
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
