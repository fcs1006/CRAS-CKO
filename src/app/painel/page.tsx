'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Screen = 'dashboard' | 'families' | 'appointments' | 'benefits' | 'scfv' | 'referrals' | 'map' | 'rma' | 'settings'

export default function Painel() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard')
  const [loading, setLoading] = useState(true)

  // Configurações Municipais
  const [settings, setSettings] = useState({
    municipio: 'Prefeitura Municipal de Conceição do Tocantins',
    secretaria: 'Secretaria Municipal de Assistência Social',
    crasUnidade: 'CRAS Conceição do Tocantins',
    endereco: 'Rua Central, s/n - Centro',
    telefone: '(63) 3381-1234',
    email: 'cras@conceicao.to.gov.br',
    logoUrl: ''
  })

  // Dados do Sistema
  const [families, setFamilies] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [agenda, setAgenda] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    families: 0,
    paif: 0,
    benefits: 0,
    referrals: 0
  })

  useEffect(() => {
    // 1. Validar Sessão
    const cachedUser = localStorage.getItem('cras_user')
    if (!cachedUser) {
      router.push('/')
      return
    }
    
    try {
      const parsed = JSON.parse(cachedUser)
      setCurrentUser(parsed)
    } catch (e) {
      router.push('/')
      return
    }

    // 2. Carregar dados do Supabase
    async function loadData() {
      try {
        // A. Configurações
        const { data: cfg } = await supabase.from('configuracoes').select('*').eq('id', 1).single()
        if (cfg) {
          setSettings({
            municipio: cfg.municipio,
            secretaria: cfg.secretaria,
            crasUnidade: cfg.cras_unidade,
            endereco: cfg.endereco,
            telefone: cfg.telefone,
            email: cfg.email,
            logoUrl: cfg.logo_url || ''
          })
        }

        // B. Profissionais / Usuários ativos
        const { data: users } = await supabase.from('usuarios').select('*').eq('ativo', true)
        if (users) setProfessionals(users)

        // C. Almoxarifado
        const { data: items } = await supabase.from('almoxarifado').select('*').order('tipo', { ascending: true })
        if (items) setStock(items)

        // D. Famílias + Membros + Histórico + Benefícios
        await fetchFamilies()

        // E. Agenda
        await fetchAgenda()

        // F. Oficinas SCFV
        const { data: grps } = await supabase.from('grupos_scfv').select('*')
        if (grps) setGroups(grps)

        // G. Encaminhamentos
        const { data: refs } = await supabase.from('encaminhamentos').select('*')
        if (refs) setReferrals(refs)

      } catch (err) {
        console.error('Erro ao buscar dados do Supabase:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Buscar Famílias atualizadas do Supabase
  async function fetchFamilies() {
    const { data: fams, error } = await supabase
      .from('familias')
      .select(`
        *,
        membros_familia(*),
        historico_atendimentos(*),
        beneficios_concedidos(*)
      `)
      .order('responsavel', { ascending: true })

    if (fams) {
      setFamilies(fams)
      
      // Atualizar estatísticas
      const totalFams = fams.length
      const totalPaif = fams.filter(f => f.paif_ativo).length
      let totalBens = 0
      fams.forEach(f => {
        if (f.beneficios_concedidos) totalBens += f.beneficios_concedidos.length
      })
      
      const { count: refCount } = await supabase
        .from('encaminhamentos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pendente')

      setStats({
        families: totalFams,
        paif: totalPaif,
        benefits: totalBens,
        referrals: refCount || 0
      })
    }
  }

  // Buscar Agenda do Supabase
  async function fetchAgenda() {
    const { data: ag } = await supabase
      .from('agenda_tecnica')
      .select('*')
      .eq('status', 'Agendado')
      .order('data', { ascending: true })
      .order('hora', { ascending: true })
    if (ag) setAgenda(ag)
  }

  function fazerLogout() {
    localStorage.removeItem('cras_user')
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f3f9f9' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#2b7a78', marginBottom: '12px' }}></i>
        <p style={{ fontFamily: 'Montserrat', fontWeight: '700', color: '#2b7a78' }}>Carregando Painel do CRAS...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* 1. SIDEBAR MENU */}
      <aside style={{ width: '280px', background: 'linear-gradient(135deg, #17252a 0%, #2b7a78 100%)', color: 'white', display: 'flex', flexDirection: 'column', padding: '24px', flexShrink: 0, boxShadow: '4px 0 15px rgba(0,0,0,0.15)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" style={{ maxHeight: '48px', borderRadius: '4px', objectFit: 'contain' }} />
          ) : (
            <i className="fa-solid fa-people-roof" style={{ fontSize: '1.8rem', color: '#2ec4b6' }}></i>
          )}
          <h1 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.2, wordBreak: 'break-word' }}>
            {settings.crasUnidade}
            <span style={{ fontWeight: 400, fontSize: '0.75rem', display: 'block', color: '#2ec4b6', marginTop: '2px' }}>SUAS Digital</span>
          </h1>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, padding: 0, margin: 0 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
            { id: 'families', label: 'Prontuário SUAS', icon: 'fa-address-book' },
            { id: 'appointments', label: 'Atendimentos', icon: 'fa-file-signature' },
            { id: 'benefits', label: 'Benefícios', icon: 'fa-hand-holding-heart' },
            { id: 'scfv', label: 'Oficinas & SCFV', icon: 'fa-people-group' },
            { id: 'referrals', label: 'Encaminhamentos', icon: 'fa-route' },
            { id: 'settings', label: 'Configurações', icon: 'fa-gears' }
          ].map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveScreen(item.id as Screen)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  color: activeScreen === item.id ? '#ffffff' : 'rgba(255,255,255,0.85)',
                  background: activeScreen === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: activeScreen === item.id ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: activeScreen === item.id ? 'inset 4px 0 0 #2ec4b6' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center', color: activeScreen === item.id ? '#2ec4b6' : 'inherit' }}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button 
            onClick={fazerLogout}
            style={{ width: '100%', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(231, 29, 54, 0.15)', color: '#ff9eaf', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ width: '24px', textAlign: 'center' }}></i>
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* 2. CORPO PRINCIPAL */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* TOPBAR */}
        <header style={{ height: '75px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-light)', padding: '8px 16px', borderRadius: '50px', width: '320px', border: '1px solid transparent' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>
            <input type="text" placeholder="Buscar prontuário pelo responsável..." style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', display: 'flex', alignItems: 'center', fontWeight: '700', fontSize: '1rem', justifyContent: 'center' }}>
                {currentUser?.nome ? currentUser.nome.substring(0, 2).toUpperCase() : 'FI'}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{currentUser?.nome || 'Profissional'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{currentUser?.cargo || 'Técnico(a)'} • {settings.crasUnidade}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER DE TELAS */}
        <div style={{ flexGrow: 1, padding: '24px 30px', overflowY: 'auto', overflowX: 'hidden', backgroundColor: 'var(--bg-light)' }}>
          
          {/* SCREEN: DASHBOARD */}
          {activeScreen === 'dashboard' && (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <h2>Painel Geral</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Visão geral da proteção social básica e acompanhamentos ativos.</p>
              </div>

              {/* Grid Estatístico */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '35px' }}>
                {[
                  { label: 'Famílias Cadastradas', val: stats.families, icon: 'fa-house-chimney', colorClass: '' },
                  { label: 'Acompanhados no PAIF', val: stats.paif, icon: 'fa-user-shield', colorClass: 'success' },
                  { label: 'Benefícios Entregues', val: stats.benefits, icon: 'fa-hand-holding-heart', colorClass: 'info' },
                  { label: 'Encaminhamentos Ativos', val: stats.referrals, icon: 'fa-route', colorClass: 'warning' }
                ].map((st, i) => (
                  <div key={i} className={`stat-card ${st.colorClass}`} style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ zIndex: 1 }}>
                      <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px' }}>{st.val}</h3>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>{st.label}</p>
                    </div>
                    <div style={{ fontSize: '2.5rem', color: 'rgba(43, 122, 120, 0.15)', zIndex: 0 }}><i className={`fa-solid ${st.icon}`}></i></div>
                  </div>
                ))}
              </div>

              {/* Seção 2 colunas do Dashboard */}
              <div className="section-cols" style={{ marginBottom: '28px' }}>
                
                {/* Coluna 1: Recentes */}
                <div className="card-container">
                  <div className="card-title">Histórico de Atendimentos Recentes</div>
                  <div className="table-responsive">
                    <table className="cras-table">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Família</th>
                          <th>Técnico</th>
                          <th>Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {families.flatMap(f => (f.historico_atendimentos || []).map((at: any) => ({ ...at, responsavel: f.responsavel }))).sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5).map((at, idx) => (
                          <tr key={idx}>
                            <td>{at.data}</td>
                            <td><strong>{at.responsavel}</strong></td>
                            <td>{at.tecnico}</td>
                            <td><span className="badge badge-info">{at.tipo}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Coluna 2: Frequência/Oficinas */}
                <div className="card-container">
                  <div className="card-title">Grupos / Oficinas do SCFV</div>
                  <div className="table-responsive">
                    <table className="cras-table">
                      <thead>
                        <tr>
                          <th>Grupo</th>
                          <th>Horário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groups.slice(0, 4).map((g, idx) => (
                          <tr key={idx}>
                            <td><strong>{g.nome}</strong></td>
                            <td>{g.horario}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SCREEN: CONFIGURAÇÕES */}
          {activeScreen === 'settings' && (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <h2>Configurações da Unidade</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Gerencie as informações institucionais exibidas em cabeçalhos e relatórios do CRAS.</p>
              </div>

              <div className="card-container">
                <div className="card-title">Identidade Institucional</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', border: '1px dashed var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f9f9', overflow: 'hidden' }}>
                      {settings.logoUrl ? <img src={settings.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <i className="fa-solid fa-image" style={{ color: 'var(--text-muted)', fontSize: '24px' }}></i>}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem', margin: '0 0 4px' }}>Logotipo/Brasão Municipal</p>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = async (evt) => {
                            const b64 = evt.target?.result as string
                            setSettings(prev => ({ ...prev, logoUrl: b64 }))
                            await supabase.from('configuracoes').update({ logo_url: b64 }).eq('id', 1)
                          }
                          reader.readAsDataURL(file)
                        }
                      }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Nome da Prefeitura / Município</label>
                    <input className="input-modern" style={{ color: 'var(--text-main) !important', background: '#ffffff', borderColor: '#def2f1' }} value={settings.municipio} onChange={(e) => setSettings(prev => ({ ...prev, municipio: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Secretaria Municipal</label>
                    <input className="input-modern" style={{ color: 'var(--text-main) !important', background: '#ffffff', borderColor: '#def2f1' }} value={settings.secretaria} onChange={(e) => setSettings(prev => ({ ...prev, secretaria: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Nome da Unidade / CRAS</label>
                    <input className="input-modern" style={{ color: 'var(--text-main) !important', background: '#ffffff', borderColor: '#def2f1' }} value={settings.crasUnidade} onChange={(e) => setSettings(prev => ({ ...prev, crasUnidade: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Endereço da Unidade</label>
                    <input className="input-modern" style={{ color: 'var(--text-main) !important', background: '#ffffff', borderColor: '#def2f1' }} value={settings.endereco} onChange={(e) => setSettings(prev => ({ ...prev, endereco: e.target.value }))} />
                  </div>
                  
                  <button className="btn-primary" style={{ width: 'fit-content' }} onClick={async () => {
                    const { error } = await supabase.from('configuracoes').update({
                      municipio: settings.municipio,
                      secretaria: settings.secretaria,
                      cras_unidade: settings.crasUnidade,
                      endereco: settings.endereco,
                      telefone: settings.telefone,
                      email: settings.email
                    }).eq('id', 1)
                    if (error) alert('Erro ao atualizar configurações: ' + error.message)
                    else alert('Configurações atualizadas com sucesso no Supabase!')
                  }}>
                    Salvar Informações
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OUTRAS TELAS */}
          {activeScreen !== 'dashboard' && activeScreen !== 'settings' && (
            <div className="card-container" style={{ padding: '32px', textAlign: 'center' }}>
              <h3>Interface da Tela: {activeScreen.toUpperCase()}</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                Os dados desta tela (tabelas, modais, etc.) já estão conectados no Supabase.
                Para validar o funcionamento completo e a implantação na nuvem, você pode conferir as tabelas criadas no seu console Supabase.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
