// script.js - Login, Cadastro e Logout

const API_USUARIOS = "http://localhost:3000/usuarios";

//  Proteção de rotas 
// Páginas que NÃO precisam de login
const PAGINAS_PUBLICAS = ["index.html", "cadastro.html"];

(function protegerRota() {
  const pagina = window.location.pathname.split("/").pop() || "index.html";
  const publica = PAGINAS_PUBLICAS.some(p => pagina === p);
  const logado = sessionStorage.getItem("usuarioLogado");

  if (!publica && !logado) {
    window.location.href = "index.html";
  }

  if (publica && logado && pagina === "index.html") {
    // já logado tentando abrir o login: redireciona pra home
    window.location.href = "home.html";
  }
})();

//  Preenche elementos comuns (nome, tipo) em qualquer página 
const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));
if (usuarioLogado) {
  const elNome = document.getElementById("nomeUsuario");
  if (elNome) elNome.textContent = usuarioLogado.nome;

  const elTipo = document.getElementById("tipoUsuario");
  if (elTipo) elTipo.textContent = usuarioLogado.tipo || usuarioLogado.categoria || "";

  const elMensagem = document.getElementById("mensagem");
  if (elMensagem) elMensagem.innerHTML = "Bem-vindo, " + usuarioLogado.nome + "!";
}

// login 
async function login() {
  const email = document.getElementById("emailLogin").value.trim();
  const senha = document.getElementById("senhaLogin").value;
  const erroEl = document.getElementById("erroLogin");

  if (!email || !senha) {
    mostrarErro(erroEl, "Preencha email e senha.");
    return;
  }

  try {
    const resposta = await fetch(`${API_USUARIOS}?email=${encodeURIComponent(email)}`);
    const usuarios = await resposta.json();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
      mostrarErro(erroEl, "Email ou senha incorretos.");
      return;
    }

    sessionStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    window.location.href = "home.html";
  } catch (e) {
    mostrarErro(erroEl, "Erro ao conectar. Verifique se o json-server está rodando.");
  }
}

// cadastro
async function cadastrar() {
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  const erroEl = document.getElementById("erroCadastro");

  if (senha !== confirmarSenha) {
    mostrarErro(erroEl, "As senhas não coincidem.");
    return;
  }

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const categoria = document.getElementById("categoria").value;

  if (!nome || !email || !categoria || !senha) {
    mostrarErro(erroEl, "Preencha todos os campos obrigatórios.");
    return;
  }

  // Verifica se email já existe
  try {
    const check = await fetch(`${API_USUARIOS}?email=${encodeURIComponent(email)}`);
    const existentes = await check.json();
    if (existentes.length > 0) {
      mostrarErro(erroEl, "Este email já está cadastrado.");
      return;
    }
  } catch (e) {
    mostrarErro(erroEl, "Erro ao conectar ao servidor.");
    return;
  }

  const usuario = {
    nome,
    telefone: document.getElementById("telefone").value,
    cidade: document.getElementById("cidade").value,
    tipo: categoria.toLowerCase(),
    categoria,
    escola: document.getElementById("escola").value,
    email,
    senha,
    dashboard: categoria.toLowerCase()
  };

  try {
    const resposta = await fetch(API_USUARIOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });
    if (!resposta.ok) throw new Error();
    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  } catch (e) {
    mostrarErro(erroEl, "Erro ao cadastrar. Tente novamente.");
  }
}

//  Logout 
function logout() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

//  Utilitário 
function mostrarErro(el, msg) {
  if (!el) { alert(msg); return; }
  el.textContent = msg;
  el.style.display = "block";
}