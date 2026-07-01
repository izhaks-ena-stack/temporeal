function carregarNoticiasJS() {
    const tituloEl = document.querySelector('#titulo')
    const descricaoEl = document.querySelector('#descricao')
    const dataEl = document.querySelector('#data')
    const horaEl = document.querySelector('#hora')
    const siteEl = document.querySelector('#site')
    const linkEl = document.querySelector('#link')

    const APINoticias = "http://localhost:3000/noticias"

    // função para calcular o tempo de publicação
    function calculaTempoPublicacao(dataPublicacao) {
        let hoje = new Date();
        return Math.floor(
            (hoje - dataPublicacao) / (1000 * 60 * 60 * 24)
        );
    }

    // função para dividir data em partes e retorná-la no objeto Date
    function converterData(noticia) {
        let partes = noticia.dataPublicacao.split("/");
        return new Date(partes[2], partes[1] - 1, partes[0]);
    }

    // função para exibir as notícias do json
    function exibirNoticias(noticiasJson) {
        let tabela = document.getElementById("noticias");
        tabela.innerHTML = "";

        noticiasJson.forEach(noticia => {
            let tempo = calculaTempoPublicacao(converterData(noticia));
            tabela.innerHTML += `
            <tr>
                <td>${noticia.titulo}</td>
                <td>${noticia.descricao}</td>

                <td>
                    <a href="${noticia.link}" target="_blank">${noticia.nomeSite}</a>
                </td>

                <td>${tempo} dias</td>

                <td>
                    <button onclick="deletarNoticia('${noticia.id}')">Excluir</button>
                </td>
            </tr>
        `;
        });
    }

    // função assíncrona para carregar as notícias
    async function carregarNoticias() {
        const requisicao = await fetch(APINoticias);
        const noticias = await requisicao.json();
        exibirNoticias(noticias)
    }

    carregarNoticias();

    // função para deletar as notícias
    async function deletarNoticia(id) {

        await fetch(`${APINoticias}{id}`,
            {
                method: "DELETE"
            }
        );

        await carregarNoticias();
    }

    // função para adicionar as notícias
    async function adicionarNoticia(event) {

        event.preventDefault();

        let titulo = tituloEl.value;
        let descricao = descricaoEl.value;
        let data = dataEl.value;
        let hora = horaEl.value;
        let site = siteEl.value;
        let link = linkEl.value;

        const resposta = await fetch(APINoticias);
        const noticias = await resposta.json();

        let maiorId = 0;

        noticias.forEach(noticia => {
            let idAtual = parseInt(noticia.id);

            if (!isNaN(idAtual) && idAtual > maiorId) {
                maiorId = idAtual;
            }
        });

        let novoId = maiorId + 1;

        let partes = data.split("-");
        data = `${partes[2]}/${partes[1]}/${partes[0]}`;

        await fetch("http://localhost:3000/noticias",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    id: novoId,
                    titulo,
                    descricao,
                    dataPublicacao: data,
                    horaPublicacao: hora,
                    nomeSite: site,
                    link
                })
            }
        );

        tituloEl.value = "";
        descricaoEl.value = "";
        dataEl.value = "";
        horaEl.value = "";
        siteEl.value = "";
        linkEl.value = "";

        await carregarNoticias();
    }
}