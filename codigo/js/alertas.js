// Rafael Queiroz Vilaça - Alertas inteligentes
function carregarJS() {
    const APIAlertas = `http://localhost:3000/alertas`

    let grafico

    // função ppra carregar alertas puxando do json
    async function carregarAlertas() {
        const resposta = await fetch(APIAlertas)
        const alertas = await resposta.json()

        montarTabela(alertas)
        montarCards(alertas)
        montarGrafico(alertas)
    }

    window.onload = () => carregarAlertas()

    // salvar alerta no json
    async function salvarAlerta(event) {
        event.preventDefault()

        const resposta = await fetch(APIAlertas)
        const alertas = await resposta.json()

        const idEl = document.querySelector('#id')

        const alerta = {
            aluno: aluno.value,
            curso: curso.value,
            tipo: tipo.value,
            nivel: nivel.value,
            titulo: titulo.value,
            mensagem: mensagem.value
        }

        if (idEl.value) {
            await fetch(`${APIAlertas}/${idEl.value}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: Number(idEl.value),
                    ...alerta
                })
            })

        }
        else {
            const resposta = await fetch(APIAlertas)
            const alertas = await resposta.json()

            await fetch(APIAlertas, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(alerta)
            })
        }

        formAlertaEl.reset()
        idEl.value = ""

        carregarAlertas()
    }

    const formAlertaEl = document.querySelector("#formAlerta")
    formAlertaEl.addEventListener("submit", salvarAlerta)

    //excluir um alerta do json
    async function excluir(id) {
        const confirmar = confirm("Deseja excluir o alerta?")

        if (!confirmar)
            return

        await fetch(`${APIAlertas}/${id}`, {
            method: "DELETE"
        })

        carregarAlertas()
    }

    //montar tip excel, uma tabela com os alertas 
    function montarTabela(alertas) {
        const tabelaEl = document.querySelector("#tabelaAlertas")
        tabelaEl.innerHTML = ""

        alertas.forEach(alerta => {
            tabelaEl.innerHTML += `
                <tr>
                    <td>${alerta.id}</td>
                    <td>${alerta.aluno}</td>
                    <td>${alerta.tipo}</td>
                    <td>${alerta.nivel}</td>
                    <td>${alerta.titulo}</td>

                    <td>
                        <button
                            class="excluir btn btn-danger btn-sm">
                            Excluir
                        </button>
                    </td>
                </tr>
            `
        })

        const botoesExcluirEl = document.querySelectorAll('.excluir')

        // coloca event listeners de click em cada um dos botões 
        for (let botaoExcluirEl of botoesExcluirEl) {
            botaoExcluirEl.addEventListener('click', (e) => {
                const botaoEl = e.currentTarget
                const trEl = e.currentTarget.closest('tr')
                const id = trEl.children[0].textContent.trim()
                excluir(id)
            })
        }
    }

    //montar os cards com os alertas
    function montarCards(alertas) {
        const cardsEl = document.querySelector("#cardsAlertas")
        cardsEl.innerHTML = ""

        alertas.forEach(alerta => {
            cardsEl.innerHTML += `
            <div class="col-md-3 mb-3">
                <div class="card card-alerta ${alerta.nivel}">
                    <div class="card-body">
                        <h5>${alerta.titulo}</h5>
                        <p>
                            ${alerta.mensagem}
                        </p>
                        <strong>
                            ${alerta.aluno}
                        </strong>

                        <br>

                        <small>
                            ${alerta.curso}
                        </small>
                    </div>
                </div>
            </div>
            `
        })
    }

    //pesquisar um aluno na tabela de elementos
    function pesquisar() {
        const termo = pesquisa.value.toLowerCase()
        const linhasEl = tabelaAlertas.querySelectorAll("tr")

        linhasEl.forEach(linhaEl => {
            const texto = linhaEl.innerText.toLowerCase()
            linhaEl.style.display = texto.includes(termo) ? "" : "none"
        })
    }

    const pesquisaEl = document.querySelector("#pesquisa")
    pesquisaEl.addEventListener("keyup", pesquisar)

    //montar um gráfico baseado na produtividade de cada aluno
    function montarGrafico(alertas) {
        const tipos = {
            produtividade: 0,
            faltas: 0,
            tarefas: 0,
            redesSociais: 0
        }

        alertas.forEach(alerta => {
            tipos[alerta.tipo]++
        })

        const graficoEl = document.querySelector("#grafico")

        if (grafico)
            grafico.destroy()

        grafico = new Chart(graficoEl, {
            type: "bar",
            data: {
                labels: [
                    "Produtividade",
                    "Faltas",
                    "Tarefas",
                    "Redes Sociais"
                ],

                datasets: [{
                    label: "Quantidade",
                    data: [
                        tipos.produtividade,
                        tipos.faltas,
                        tipos.tarefas,
                        tipos.redesSociais
                    ]

                }]
            }
        })
    }
}

carregarJS()