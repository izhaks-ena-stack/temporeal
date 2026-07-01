const API = 'http://localhost:3000'

// tarefas.html guarda a data como DD/MM/AAAA; o dashboard trabalha em ISO (AAAA-MM-DD)
function paraISO(dataBR) {
  if (!dataBR) return ''
  const p = dataBR.split('/')
  if (p.length !== 3) return dataBR
  return p[2] + '-' + p[1] + '-' + p[0]
}

// converte uma tarefa (schema de tarefas.html: titulo, tipo, data BR, duracaoHoras, duracaoMinutos)
// para o formato que o dashboard de monitoramento usa (titulo, categoria, horas decimais, data ISO)
function normalizar(tarefa) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    categoria: tarefa.tipo,
    horas: Number(tarefa.duracaoHoras || 0) + Number(tarefa.duracaoMinutos || 0) / 60,
    data: paraISO(tarefa.data)
  }
}

async function carregarAtividades() {
  const resposta = await fetch(API + '/tarefas')
  const tarefas = await resposta.json()
  const atividades = tarefas.map(normalizar)

  const hoje = new Date().toISOString().split('T')[0]

  const atividadesHoje = atividades.filter(a => a.data === hoje)
  const horasHoje = atividadesHoje.reduce((s, a) => s + Number(a.horas || 0), 0)
  const metaDiaria = 4
  const percentual = Math.min(Math.round((horasHoje / metaDiaria) * 100), 100)

  const elTempo = document.getElementById('tempoHoje')
  const elPercentual = document.getElementById('percentual')
  const elBarra = document.getElementById('barraProgresso')

  if (elTempo) elTempo.textContent = horasHoje.toFixed(1) + 'h'
  if (elPercentual) elPercentual.textContent = percentual + '%'
  if (elBarra) elBarra.style.width = percentual + '%'

  const totalHoras = atividades.reduce((s, a) => s + Number(a.horas || 0), 0)
  const mediaSemanal = atividades.length > 0
    ? (totalHoras / Math.max(1, Math.ceil(atividades.length / 5))).toFixed(1)
    : 0

  const elMedia = document.getElementById('mediaSemanal')
  if (elMedia) elMedia.textContent = mediaSemanal + 'h'

  const elSequencia = document.getElementById('sequencia')
  if (elSequencia) elSequencia.textContent = calcularSequencia(atividades) + ' dias'

  const elTotal = document.getElementById('totalHoras')
  if (elTotal) elTotal.textContent = totalHoras.toFixed(1)

  renderizarLista(atividades)
}

function calcularSequencia(atividades) {
  const diasComAtividade = new Set(atividades.map(a => a.data))
  let sequencia = 0
  const hoje = new Date()

  for (let i = 0; i < 30; i++) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    const dataStr = d.toISOString().split('T')[0]
    if (diasComAtividade.has(dataStr)) {
      sequencia++
    } else if (i > 0) {
      break
    }
  }
  return sequencia
}

function renderizarLista(atividades) {
  const pesquisa = document.getElementById('pesquisa')
  const termo = pesquisa ? pesquisa.value.toLowerCase() : ''

  const filtradas = atividades.filter(a =>
    a.titulo.toLowerCase().includes(termo) ||
    (a.categoria || '').toLowerCase().includes(termo)
  )

  const el = document.getElementById('listaAtividades')
  if (!el) return

  if (filtradas.length === 0) {
    el.innerHTML = '<p class="text-secondary">Nenhuma atividade encontrada.</p>'
    return
  }

  el.innerHTML = filtradas.map(a => `
    <div class="col-md-6">
      <div class="card p-3 shadow-sm">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <strong>${a.titulo}</strong>
            <p class="text-secondary mb-1 small">${a.categoria} · ${a.horas.toFixed(1)}h · ${formatarData(a.data)}</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-danger" onclick="deletarAtividade('${a.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('')
}

async function deletarAtividade(id) {
  if (!confirm('Quer mesmo apagar essa atividade? (isso também remove a tarefa em Tarefas)')) return
  await fetch(API + '/tarefas/' + id, { method: 'DELETE' })
  carregarAtividades()
}

const pesquisa = document.getElementById('pesquisa')
if (pesquisa) {
  pesquisa.addEventListener('input', carregarAtividades)
}

function formatarData(dataISO) {
  if (!dataISO) return '—'
  const [ano, mes, dia] = dataISO.split('-')
  return dia + '/' + mes + '/' + ano
}

carregarAtividades()
