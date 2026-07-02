'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

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
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 2px' }}>
            {crasName.toUpperCase()}
          </h1>
          <p style={{ color: '#def2f1', fontSize: '11px', margin: 0, opacity: 0.8 }}>
            {municipio} • Gestão SUAS Digital
          </p>
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
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setErro(data.error || 'Usuário ou senha incorretos.')
        setCarregando(false)
        return
      }
      localStorage.setItem('cras_user', JSON.stringify(data))
      router.push('/painel')
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
        <label className="label-modern">Usuário (CPF)</label>
        <input
          className="input-modern"
          type="text"
          value={usuario}
          onChange={e => setUsuario(aplicarMascaraCPF(e.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
          required
        />
      </div>
      <div>
        <label className="label-modern">Senha</label>
        <input
          className="input-modern"
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      {erro && <div className="status-err">{erro}</div>}
      <button type="submit" disabled={carregando} className="btn-primary" style={{ width: '100%', marginTop: '4px' }}>
        {carregando ? 'Verificando...' : 'ENTRAR'}
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
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
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setErro(data.error || 'Erro ao realizar cadastro.')
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
        <label className="label-modern">Nome Completo</label>
        <input className="input-modern" value={form.nome} required
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          placeholder="Ex: Cláudia Santos" />
      </div>

      <div>
        <label className="label-modern">CPF (será seu login)</label>
        <input className="input-modern" value={form.cpf} inputMode="numeric" required
          onChange={e => setForm(f => ({ ...f, cpf: mascaraCPF(e.target.value) }))}
          placeholder="000.000.000-00" />
      </div>

      <div>
        <label className="label-modern">Cargo / Função</label>
        <select className="input-modern" value={form.cargo} required style={{ background: '#1e293b' }}
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
        <label className="label-modern">Registro/Conselho Profissional</label>
        <input className="input-modern" value={form.conselho}
          onChange={e => setForm(f => ({ ...f, conselho: e.target.value }))}
          placeholder="Ex: CRESS/TO 1234, CRP-23/5678" />
      </div>

      <div>
        <label className="label-modern">Telefone</label>
        <input className="input-modern" value={form.telefone} inputMode="numeric" required
          onChange={e => setForm(f => ({ ...f, telefone: mascaraTel(e.target.value) }))}
          placeholder="(00) 00000-0000" />
      </div>

      <div>
        <label className="label-modern">E-mail</label>
        <input className="input-modern" type="email" value={form.email} required
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="exemplo@cras.gov.br" />
      </div>

      <div>
        <label className="label-modern">Senha</label>
        <input className="input-modern" type="password" value={form.senha} required
          onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
          placeholder="Mínimo 6 caracteres" />
      </div>

      <div>
        <label className="label-modern">Confirmar Senha</label>
        <input className="input-modern" type="password" value={form.confirmar} required
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
  const [etapa, setEtapa] = useState(1) // 1: solicitar, 2: redefinir
  const [form, setForm] = useState({ cpf: '', codigo: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [carregando, setCarregando] = useState(false)

  function mascaraCPF(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  async function handleSolicitar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const res = await fetch('/api/auth/recuperar-senha/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: form.cpf })
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setErro(data.error || 'CPF não localizado.')
        setCarregando(false)
        return
      }
      setEtapa(2)
    } catch (err) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  async function handleConfirmar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem.'); return }
    if (form.senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setCarregando(true)
    try {
      const res = await fetch('/api/auth/recuperar-senha/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: form.cpf,
          codigo: form.codigo, // e-mail ou telefone cadastrado
          novaSenha: form.senha
        })
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setErro(data.error || 'Informações de validação incorretas.')
        setCarregando(false)
        return
      }
      setSucesso(true)
    } catch (err) {
      setErro('Erro ao processar alteração.')
    } finally {
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
      <p style={{ fontWeight: '700', fontSize: '15px', margin: 0 }}>Senha redefinida!</p>
      <p style={{ color: '#def2f1', fontSize: '13px', margin: 0 }}>
        Sua senha foi redefinida com sucesso. Você já pode acessar a plataforma.
      </p>
      <button className="btn-primary" onClick={() => irPara('login')} style={{ width: '100%', padding: '12px' }}>
        FAZER LOGIN
      </button>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
    >
      {etapa === 1 ? (
        <form onSubmit={handleSolicitar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff', margin: 0 }}>Recuperar Senha</p>
          <p style={{ color: '#def2f1', fontSize: '12px', margin: 0, opacity: 0.8 }}>
            Insira o seu CPF cadastrado. Na próxima etapa, você precisará confirmar seu e-mail ou telefone para redefinir.
          </p>
          <div>
            <label className="label-modern">CPF do Técnico</label>
            <input className="input-modern" value={form.cpf} inputMode="numeric" required
              onChange={e => setForm(f => ({ ...f, cpf: mascaraCPF(e.target.value) }))}
              placeholder="000.000.000-00" />
          </div>
          {erro && <div className="status-err">{erro}</div>}
          <button type="submit" disabled={carregando} className="btn-primary" style={{ width: '100%' }}>
            {carregando ? 'Buscando...' : 'PROSSEGUIR'}
          </button>
          <button type="button" onClick={() => irPara('login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '13px', textAlign: 'center' }}>
            ← Voltar ao login
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirmar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff', margin: 0 }}>Validação de Segurança</p>
          
          <div>
            <label className="label-modern">Confirme E-mail ou Telefone</label>
            <input className="input-modern" value={form.codigo} required
              onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
              placeholder="Digite o email ou telefone cadastrado" />
          </div>

          <div>
            <label className="label-modern">Nova Senha</label>
            <input className="input-modern" type="password" value={form.senha} required
              onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              placeholder="Mínimo 6 caracteres" />
          </div>

          <div>
            <label className="label-modern">Confirmar Nova Senha</label>
            <input className="input-modern" type="password" value={form.confirmar} required
              onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
              placeholder="Repita a nova senha" />
          </div>

          {erro && <div className="status-err">{erro}</div>}

          <button type="submit" disabled={carregando} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            {carregando ? 'Redefinindo...' : 'REDEFINIR SENHA'}
          </button>

          <button type="button" onClick={() => setEtapa(1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '13px', textAlign: 'center' }}>
            ← Alterar CPF
          </button>
        </form>
      )}
    </motion.div>
  )
}
