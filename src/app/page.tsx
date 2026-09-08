'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { parseResponseJson } from '@/utils/safeFetch'

type Tela = 'login' | 'cadastro' | 'esqueci'

export default function Home() {
  const [tela, setTela] = useState<Tela>('login')
  const [crasName, setCrasName] = useState('CRAS Conceição do Tocantins')
  const [municipio, setMunicipio] = useState('Conceição do Tocantins - TO')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  
  useEffect(() => {
    // Carregar configurações locais se disponíveis
    const cached = localStorage.getItem('cras_settings')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed.crasUnidade) setCrasName(parsed.crasUnidade)
        if (parsed.municipio) setMunicipio(parsed.municipio)
        if (parsed.logoUrl) setLogoUrl(parsed.logoUrl)
      } catch (e) {}
    }

    // Buscar configurações mais recentes do servidor
    async function buscarConfiguracoes() {
      try {
        const res = await fetch('/api/configuracoes')
        const json = await parseResponseJson(res, 'Erro ao carregar configurações')
        if (json && json.ok && json.data) {
          if (json.data.cras_unidade) setCrasName(json.data.cras_unidade)
          if (json.data.municipio) setMunicipio(json.data.municipio)
          if (json.data.logo_url) setLogoUrl(json.data.logo_url)
          localStorage.setItem('cras_settings', JSON.stringify({
            crasUnidade: json.data.cras_unidade,
            municipio: json.data.municipio,
            secretaria: json.data.secretaria,
            logoUrl: json.data.logo_url
          }))
        }
      } catch (err) {}
    }
    buscarConfiguracoes()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #17252a 0%, #2b7a78 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Background overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 0, backdropFilter: 'blur(3px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="login-card"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ maxHeight: '60px', margin: '0 auto 12px', borderRadius: '4px', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '36px', color: '#2ec4b6', marginBottom: '8px' }}>
              <i className="fa-solid fa-people-roof"></i>
            </div>
          )}
          <h1 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', margin: '0', lineHeight: '1.4', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            CENTRO DE REFERÊNCIA E ASSISTÊNCIA SOCIAL<br />PEDRO DE SANTANA BRITO
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {tela === 'login' && <FormLogin key="login" irPara={setTela} />}
          {tela === 'cadastro' && <FormCadastro key="cadastro" irPara={setTela} />}
          {tela === 'esqueci' && <FormEsqueci key="esqueci" irPara={setTela} />}
        </AnimatePresence>
      </motion.div>

      <p style={{
        position: 'relative',
        zIndex: 1,
        marginTop: '24px',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '11px',
        textAlign: 'center'
      }}>
        © 2026 SUAS Digital — Todos os direitos reservados
      </p>
    </div>
  )
}

/* ─── FORMULÁRIO DE LOGIN ─────────────────────────────────────────── */
function FormLogin({ irPara }: { irPara: (t: Tela) => void }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario.trim(), senha: senha.trim() })
      })
      const data = await parseResponseJson(res, 'Erro no login')
      if (!res.ok || !data?.ok) {
        setErro(data?.error || 'Usuário ou senha incorretos.')
        setCarregando(false)
        return
      }
      localStorage.setItem('cras_user', JSON.stringify(data))
      window.location.href = '/painel'
    } catch (err) {
      setErro('Erro de conexão. Tente novamente.')
      setCarregando(false)
    }
  }

  function aplicarMascaraCPF(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  return (
    <motion.form
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      onSubmit={fazerLogin}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div>
        <label className="login-label">Usuário (CPF)</label>
        <input
          className="login-input"
          type="text"
          value={usuario}
          onChange={e => setUsuario(aplicarMascaraCPF(e.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
          required
        />
      </div>
      <div>
        <label className="login-label">Senha</label>
        <input
          className="login-input"
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      {erro && (
        <div className="status-err" style={{ fontSize: '11px', lineHeight: '1.4', padding: '10px', borderRadius: '8px', background: 'rgba(231, 29, 54, 0.15)', border: '1px solid rgba(231, 29, 54, 0.4)', color: '#ff8080' }}>
          {erro}
        </div>
      )}
      <button type="submit" disabled={carregando} className="btn-primary" style={{ width: '100%', marginTop: '4px' }}>
        {carregando ? 'Verificando...' : 'ENTRAR'}
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <button type="button" onClick={() => irPara('cadastro')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2ec4b6', fontSize: '12px', padding: 0 }}>
          Solicitar acesso
        </button>
        <button type="button" onClick={() => irPara('esqueci')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#def2f1', fontSize: '12px', padding: 0, opacity: 0.8 }}>
          Esqueci a senha
        </button>
      </div>
    </motion.form>
  )
}

/* ─── FORMULÁRIO DE CADASTRO / SOLICITAÇÃO ───────────────────────── */
function FormCadastro({ irPara }: { irPara: (t: Tela) => void }) {
  const [form, setForm] = useState({ nome: '', cpf: '', cargo: '', conselho: '', telefone: '', email: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  function mascaraCPF(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  function mascaraTel(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '')
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '')
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem.'); return }
    if (form.senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setCarregando(true)
    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          cpf: form.cpf,
          cargo: form.cargo,
          conselho: form.conselho || 'Não aplicável',
          telefone: form.telefone,
          email: form.email.trim(),
          senha: form.senha
        })
      })
      const data = await parseResponseJson(res, 'Erro ao realizar cadastro')
      if (!res.ok || !data?.ok) {
        setErro(data?.error || 'Erro ao realizar cadastro.')
        setCarregando(false)
        return
      }
      setSucesso(true)
    } catch (err) {
      setErro('Erro de conexão. Tente novamente.')
      setCarregando(false)
    }
  }

  if (sucesso) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', color: '#ffffff' }}
    >
      <div style={{ fontSize: '40px', color: '#2ec4b6' }}>
        <i className="fa-solid fa-circle-check"></i>
      </div>
      <p style={{ fontWeight: '700', fontSize: '15px', margin: 0 }}>Solicitação enviada!</p>
      <p style={{ color: '#def2f1', fontSize: '13px', margin: 0, opacity: 0.9 }}>
        Sua conta de técnico foi criada e está aguardando ativação pelo coordenador/administrador do CRAS.
      </p>
      <button className="btn-primary" onClick={() => irPara('login')} style={{ width: '100%', padding: '12px' }}>
        VOLTAR AO LOGIN
      </button>
    </motion.div>
  )

  return (
    <motion.form
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      onSubmit={cadastrar}
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}
    >
      <p style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff', margin: '0 0 4px' }}>Solicitar Acesso Técnico</p>
      
      <div>
        <label className="login-label">Nome Completo</label>
        <input className="login-input" value={form.nome} required
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          placeholder="Ex: Cláudia Santos" />
      </div>

      <div>
        <label className="login-label">CPF (será seu login)</label>
        <input className="login-input" value={form.cpf} inputMode="numeric" required
          onChange={e => setForm(f => ({ ...f, cpf: mascaraCPF(e.target.value) }))}
          placeholder="000.000.000-00" />
      </div>

      <div>
        <label className="login-label">Cargo / Função</label>
        <select className="login-input" value={form.cargo} required style={{ background: '#1e293b' }}
          onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}>
          <option value="" disabled>Selecione...</option>
          <option value="Assistente Social">Assistente Social</option>
          <option value="Psicólogo(a)">Psicólogo(a)</option>
          <option value="Orientador(a) Social">Orientador(a) Social</option>
          <option value="Coordenador(a)">Coordenador(a)</option>
          <option value="Cadastrador(a) CadÚnico">Cadastrador(a) CadÚnico</option>
          <option value="Outro Técnico">Outro Técnico</option>
        </select>
      </div>

      <div>
        <label className="login-label">Registro/Conselho Profissional</label>
        <input className="login-input" value={form.conselho}
          onChange={e => setForm(f => ({ ...f, conselho: e.target.value }))}
          placeholder="Ex: CRESS/TO 1234, CRP-23/5678" />
      </div>

      <div>
        <label className="login-label">Telefone</label>
        <input className="login-input" value={form.telefone} inputMode="numeric" required
          onChange={e => setForm(f => ({ ...f, telefone: mascaraTel(e.target.value) }))}
          placeholder="(00) 00000-0000" />
      </div>

      <div>
        <label className="login-label">E-mail</label>
        <input className="login-input" type="email" value={form.email} required
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="exemplo@cras.gov.br" />
      </div>

      <div>
        <label className="login-label">Senha</label>
        <input className="login-input" type="password" value={form.senha} required
          onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
          placeholder="Mínimo 6 caracteres" />
      </div>

      <div>
        <label className="login-label">Confirmar Senha</label>
        <input className="login-input" type="password" value={form.confirmar} required
          onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
          placeholder="Repita a senha" />
      </div>

      {erro && <div className="status-err">{erro}</div>}

      <button type="submit" disabled={carregando} className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
        {carregando ? 'Solicitando...' : 'ENVIAR SOLICITAÇÃO'}
      </button>

      <button type="button" onClick={() => irPara('login')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '13px', textAlign: 'center', margin: '4px 0' }}>
        ← Voltar ao login
      </button>
    </motion.form>
  )
}

/* ─── RECUPERAR SENHA ────────────────────────────────────────────── */
function FormEsqueci({ irPara }: { irPara: (t: Tela) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', color: '#ffffff' }}
    >
      <div style={{ fontSize: '36px', color: '#38bdf8', margin: '4px 0' }}>
        <i className="fa-solid fa-shield-halved"></i>
      </div>
      <p style={{ fontWeight: '800', fontSize: '15px', margin: 0, letterSpacing: '0.02em' }}>
        Segurança de Acesso e LGPD
      </p>
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', padding: '14px', textAlign: 'left' }}>
        <p style={{ color: '#e2e8f0', fontSize: '12px', margin: '0 0 8px 0', lineHeight: '1.5' }}>
          Para resguardar o sigilo de prontuários familiares e dados protegidos pelo SUAS, a redefinição de senhas é gerenciada sob custódia de acesso.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
          Solicite ao Coordenador(a) ou Administrador de sua unidade CRAS a redefinição de suas credenciais através do módulo interno de Gestão de Usuários.
        </p>
      </div>
      <button
        type="button"
        className="btn-primary"
        onClick={() => irPara('login')}
        style={{ width: '100%', padding: '12px' }}
      >
        VOLTAR AO LOGIN
      </button>
    </motion.div>
  )
}
