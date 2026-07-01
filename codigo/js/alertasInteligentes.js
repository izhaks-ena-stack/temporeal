function carregarAlertasInteligentesJS() {
    const API = "http://localhost:3000";
    const META_DIARIA_HORAS = 4;
    const FREQUENCIA_MINIMA = 75;

    function gerarAlertasInteligentes(aluno, atividades) {
        const alertasGerados = [];
        const hoje = new Date().toISOString().slice(0, 10); // "2026-06-30"

        const atividadesHoje = atividades.filter(a => a.data === hoje);
        const horasHoje = atividadesHoje.reduce((acc, a) => acc + Number(a.horas || 0), 0);

        if (Number(aluno.nota) < 7) {
            alertasGerados.push({
                aluno: aluno.nome,
                tipo: "desempenho",
                nivel: "atencao",
                titulo: "Desempenho em queda",
                mensagem: `Sua nota atual (${aluno.nota}) está abaixo da média. Que tal revisar o conteúdo recente?`,
                origem: "sistema"
            });
        }

        if (Number(aluno.frequencia) < FREQUENCIA_MINIMA) {
            alertasGerados.push({
                aluno: aluno.nome,
                tipo: "frequencia",
                nivel: "critico",
                titulo: "Frequência abaixo do esperado",
                mensagem: `Sua frequência está em ${aluno.frequencia}%, abaixo do mínimo recomendado (${FREQUENCIA_MINIMA}%).`,
                origem: "sistema"
            });
        }

        if (horasHoje < META_DIARIA_HORAS) {
            alertasGerados.push({
                aluno: aluno.nome,
                tipo: "produtividade",
                nivel: "baixo",
                titulo: "Meta diária não atingida",
                mensagem: `Você registrou ${horasHoje}h de foco hoje, de uma meta de ${META_DIARIA_HORAS}h.`,
                origem: "sistema"
            });
        }

        if (Number(aluno.nota) < 7 && horasHoje < META_DIARIA_HORAS) {
            alertasGerados.push({
                aluno: aluno.nome,
                tipo: "correlacao",
                nivel: "critico",
                titulo: "Atenção: padrão de risco identificado",
                mensagem: "Notamos queda no desempenho junto com pouco tempo de foco nos últimos dias.",
                origem: "sistema"
            });
        }

        return alertasGerados;
    }

    async function carregarAlertasDoAluno(nomeAluno) {
        try {
            const [respAlunos, respAtividades, respAlertas] = await Promise.all([
                fetch(`${API}/alunos`),
                fetch(`${API}/atividades`),
                fetch(`${API}/alertas`)
            ]);

            const alunos = await respAlunos.json();
            const atividades = await respAtividades.json();
            const alertasManuais = await respAlertas.json();

            const aluno = alunos.find(a => a.nome === nomeAluno);
            if (!aluno) {
                console.warn("Aluno não encontrado em /alunos:", nomeAluno);
                exibirAlertas([]);
                return;
            }

            const alertasSistema = gerarAlertasInteligentes(aluno, atividades);
            const alertasDoAluno = alertasManuais.filter(a => a.aluno === nomeAluno);

            const todosAlertas = [...alertasSistema, ...alertasDoAluno];

            exibirAlertas(todosAlertas);
        } 
        catch (erro) {
            console.error("Erro ao carregar alertas:", erro);
            exibirAlertas([]);
        }
    }

    function exibirAlertas(alertas) {
        const container = document.getElementById("alertasHoje");
        if (!container) return;

        if (alertas.length === 0) {
            container.innerHTML = `<p class="text-muted mb-0">Nenhum alerta para hoje 🎉</p>`;
            return;
        }

        const corPorNivel = {
            baixo: "alert-info",
            atencao: "alert-warning",
            critico: "alert-danger"
        };

        container.innerHTML = alertas.map(a => `
            <div class="alert ${corPorNivel[a.nivel] || "alert-secondary"} d-flex align-items-start gap-2 mb-2">
                <i class="bi ${a.origem === "sistema" ? "bi-stars" : "bi-bell"}"></i>
            <div>
            <strong>${a.titulo}</strong>
            <p class="mb-0">${a.mensagem}</p>
            </div></div>`).join("");
    }

    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');
    if (usuarioLogado) 
        carregarAlertasDoAluno(usuarioLogado.nome);
}

carregarAlertasInteligentesJS()