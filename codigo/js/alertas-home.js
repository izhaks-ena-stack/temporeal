const API_ALERTAS = "http://localhost:3000/alertas"

const ICONES_TIPO = {
    produtividade: "bi-graph-up",
    faltas: "bi-calendar-x",
    tarefas: "bi-check2-square",
    redesSociais: "bi-phone"
}

const LABELS_TIPO = {
    produtividade: "Produtividade",
    faltas: "Faltas",
    tarefas: "Tarefas",
    redesSociais: "Redes Sociais"
}

const CORES_NIVEL = {
    alto:  { badge: "danger",  texto: "Alto" },
    medio: { badge: "warning", texto: "Médio" },
    baixo: { badge: "success", texto: "Baixo" }
}

async function carregarAlertasHome() {
    const container = document.querySelector("#listaAlertas")
    if (!container) return

    try {
        const resposta = await fetch(API_ALERTAS)

        if (!resposta.ok) throw new Error("Servidor não respondeu")

        const alertas = await resposta.json()

        if (alertas.length === 0) {
            container.innerHTML = `
                <p class="text-secondary">
                    <i class="bi bi-check-circle text-success"></i>
                    Nenhum alerta no momento.
                </p>
            `
            return
        }

//  Os 3 alertas mais novos
        const recentes = alertas.slice(-3).reverse()

        container.innerHTML = recentes.map(alerta => {
            const icone = ICONES_TIPO[alerta.tipo] || "bi-bell"
            const labelTipo = LABELS_TIPO[alerta.tipo] || alerta.tipo
            const cor = CORES_NIVEL[alerta.nivel] || { badge: "secondary", texto: alerta.nivel }

            return `
                <div class="mb-3 p-3 rounded-3 border-start border-4 border-${cor.badge} bg-white shadow-sm card-alerta">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>
                                <i class="bi ${icone} me-1"></i>
                                ${alerta.titulo}
                            </strong>
                            <p class="m-0 text-secondary small">${alerta.mensagem}</p>
                            <small class="text-muted">${alerta.aluno} · ${labelTipo}</small>
                        </div>
                        <span class="badge bg-${cor.badge} ms-2">${cor.texto}</span>
                    </div>
                </div>
            `
        }).join("")

//pag completa de alertas
        container.innerHTML += `
            <a href="alertas.html" class="btn btn-outline-primary btn-sm mt-1 w-100">
                Ver todos os alertas
            </a>
        `

    } catch (erro) {
        container.innerHTML = `
            <p class="text-danger small">
                <i class="bi bi-exclamation-triangle"></i>
                Não foi possível carregar os alertas.<br>
                Verifique se o json-server está rodando.
            </p>
        `
        console.warn("Erro ao carregar alertas:", erro)
    }
}

carregarAlertasHome()
