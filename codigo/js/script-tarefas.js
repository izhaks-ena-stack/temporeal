const url = 'http://localhost:3000/tarefas'

const formulario = document.getElementById('form-tarefa')
const caixaTitulo = document.getElementById('titulo')
const caixaDescricao = document.getElementById('descricao')
const caixaTipo = document.getElementById('tipo')
const caixaData = document.getElementById('data')
const caixaDuracao = document.getElementById('duracao')

let idParaEditar = null

function parsearDuracao(texto) {
  let horas = 0
  let minutos = 0
  let matchHoras = texto.match(/(\d+)\s*h/)
  if (matchHoras) horas = parseInt(matchHoras[1])
  let matchMinutos = texto.match(/(\d+)\s*min/)
  if (matchMinutos) minutos = parseInt(matchMinutos[1])
  return { horas, minutos }
}

function formatarDuracao(horas, minutos) {
  horas = parseInt(horas) || 0
  minutos = parseInt(minutos) || 0
  if (horas === 0 && minutos === 0) return 'não informado'
  if (horas === 0) return `${minutos}min`
  if (minutos === 0) return `${horas}h`
  return `${horas}h ${minutos}min`
}

var mesSelecionado = new Date().getMonth()
var anoSelecionado = new Date().getFullYear()
var diaSelecionado = null
var todasTarefas = []

var nomesMeses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function carregarTarefas() {
  fetch(url)
    .then(function(r) { return r.json() })
    .then(function(tarefas) {
      todasTarefas = tarefas
      desenharCalendario()
      if (diaSelecionado !== null) mostrarTarefasDoDia(diaSelecionado)
    })
}

function desenharCalendario() {
  document.getElementById('mes-ano').textContent = nomesMeses[mesSelecionado] + ' ' + anoSelecionado

  var grade = document.getElementById('grade-dias')
  grade.innerHTML = ''

  var primeiroDia = new Date(anoSelecionado, mesSelecionado, 1).getDay()
  var totalDias = new Date(anoSelecionado, mesSelecionado + 1, 0).getDate()

  for (var i = 0; i < primeiroDia; i++) {
    var vazia = document.createElement('div')
    vazia.className = 'celula vazia'
    grade.appendChild(vazia)
  }

  for (var dia = 1; dia <= totalDias; dia++) {
    var celula = document.createElement('div')
    celula.className = 'celula'
    if (dia === diaSelecionado) celula.classList.add('selecionado')

    celula.textContent = dia

    var dataStr = formatarDataBR(anoSelecionado, mesSelecionado + 1, dia)
    var tarefasDoDia = todasTarefas.filter(function(t) { return t.data === dataStr })

    if (tarefasDoDia.length > 0) {
      var pontos = document.createElement('div')
      pontos.className = 'pontos'
      for (var t = 0; t < tarefasDoDia.length; t++) {
        var ponto = document.createElement('span')
        ponto.className = 'ponto ' + tarefasDoDia[t].tipo
        pontos.appendChild(ponto)
      }
      celula.appendChild(pontos)
    }

    celula.addEventListener('click', criarClique(dia))
    grade.appendChild(celula)
  }
}

function criarClique(dia) {
  return function() {
    diaSelecionado = dia
    var mesStr = String(mesSelecionado + 1).padStart(2, '0')
    var diaStr = String(dia).padStart(2, '0')
    document.getElementById('data').value = anoSelecionado + '-' + mesStr + '-' + diaStr
    desenharCalendario()
    mostrarTarefasDoDia(dia)
  }
}

function mostrarTarefasDoDia(dia) {
  var dataStr = formatarDataBR(anoSelecionado, mesSelecionado + 1, dia)
  var tarefasDoDia = todasTarefas.filter(function(t) { return t.data === dataStr })

  document.getElementById('painel-titulo').textContent =
    'Tarefas para ' + dia + ' de ' + nomesMeses[mesSelecionado]

  var lista = document.getElementById('lista-dia')
  lista.innerHTML = ''

  if (tarefasDoDia.length === 0) {
    lista.innerHTML = '<li>Nenhuma tarefa neste dia.</li>'
    return
  }

  for (var i = 0; i < tarefasDoDia.length; i++) {
    var t = tarefasDoDia[i]
    var li = document.createElement('li')

    var duracao = formatarDuracao(t.duracaoHoras, t.duracaoMinutos)
    var texto = '[' + t.tipo + '] ' + t.titulo
    if (t.descricao) texto += ' — ' + t.descricao
    if (duracao && duracao !== 'não informado') texto += ' (' + duracao + ')'

    var spanTexto = document.createElement('span')
    spanTexto.textContent = texto

    var divBotoes = document.createElement('div')
    divBotoes.className = 'botoes-item'

    var btnEditar = document.createElement('button')
    btnEditar.textContent = 'editar'
    btnEditar.className = 'btn-editar'
    btnEditar.addEventListener('click', criarEditar(t.id))

    var btnApagar = document.createElement('button')
    btnApagar.textContent = 'apagar'
    btnApagar.className = 'btn-apagar'
    btnApagar.addEventListener('click', criarApagar(t.id))

    divBotoes.appendChild(btnEditar)
    divBotoes.appendChild(btnApagar)
    li.appendChild(spanTexto)
    li.appendChild(divBotoes)
    lista.appendChild(li)
  }
}

function criarEditar(id) {
  return function() {
    fetch(url + '/' + id)
      .then(function(r) { return r.json() })
      .then(function(tarefa) {
        document.getElementById('titulo').value = tarefa.titulo
        document.getElementById('descricao').value = tarefa.descricao
        document.getElementById('tipo').value = tarefa.tipo
        document.getElementById('data').value = converterParaISO(tarefa.data)
        document.getElementById('duracao').value = formatarDuracao(tarefa.duracaoHoras, tarefa.duracaoMinutos) === 'não informado' ? '' : formatarDuracao(tarefa.duracaoHoras, tarefa.duracaoMinutos)
        idParaEditar = id
        document.getElementById('titulo-form').textContent = 'Editando Tarefa'
        document.getElementById('form-tarefa').scrollIntoView()
      })
  }
}

async function apagar(id) {
  var temCerteza = confirm('Quer mesmo apagar essa tarefa?')
  if (!temCerteza) return
  var resposta = await fetch(url + '/' + id, { method: 'DELETE' })
  if (resposta.ok) {
    carregarTarefas()
  } else {
    alert('Erro ao apagar. Status: ' + resposta.status)
  }
}

function criarApagar(id) {
  return function() { apagar(id) }
}

document.getElementById('btn-anterior').addEventListener('click', function() {
  mesSelecionado--
  if (mesSelecionado < 0) { mesSelecionado = 11; anoSelecionado-- }
  diaSelecionado = null
  document.getElementById('painel-titulo').textContent = 'Clique em um dia para ver as tarefas'
  document.getElementById('lista-dia').innerHTML = ''
  desenharCalendario()
})

document.getElementById('btn-proximo').addEventListener('click', function() {
  mesSelecionado++
  if (mesSelecionado > 11) { mesSelecionado = 0; anoSelecionado++ }
  diaSelecionado = null
  document.getElementById('painel-titulo').textContent = 'Clique em um dia para ver as tarefas'
  document.getElementById('lista-dia').innerHTML = ''
  desenharCalendario()
})

document.getElementById('form-tarefa').addEventListener('submit', function(evento) {
  evento.preventDefault()

  var duracao = parsearDuracao(document.getElementById('duracao').value)

  var pacote = {
    titulo: document.getElementById('titulo').value,
    descricao: document.getElementById('descricao').value,
    tipo: document.getElementById('tipo').value,
    data: converterParaBR(document.getElementById('data').value),
    duracaoHoras: duracao.horas,
    duracaoMinutos: duracao.minutos
  }

  if (idParaEditar !== null) {
    fetch(url + '/' + idParaEditar, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pacote)
    }).then(function() {
      idParaEditar = null
      document.getElementById('titulo-form').textContent = 'Adicionar Tarefa'
      document.getElementById('form-tarefa').reset()
      carregarTarefas()
    })
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pacote)
    }).then(function() {
      document.getElementById('form-tarefa').reset()
      carregarTarefas()
    })
  }
})

function formatarDataBR(ano, mes, dia) {
  return String(dia).padStart(2, '0') + '/' + String(mes).padStart(2, '0') + '/' + ano
}

function converterParaBR(dataISO) {
  var p = dataISO.split('-')
  if (p.length !== 3) return dataISO
  return p[2] + '/' + p[1] + '/' + p[0]
}

function converterParaISO(dataBR) {
  var p = dataBR.split('/')
  if (p.length !== 3) return dataBR
  return p[2] + '-' + p[1] + '-' + p[0]
}

carregarTarefas()
