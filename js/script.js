/* ==========================================================================
   script.js — Interações do site "Respeitar é Proteger"
   Este mesmo arquivo é usado pelas 3 páginas. Cada bloco verifica se os
   elementos existem antes de rodar, então não há erro nas páginas onde
   determinado recurso não aparece.

   Como o <script> usa "defer", o HTML já está pronto quando este código roda.

   Blocos:
   1. Menu (telas pequenas)
   2. Revelação ao rolar a página (scroll reveal)
   3. Contadores animados das estatísticas
   4. Acordeão (Mitos x Fatos)
   5. Botão "copiar número" (Disque 100)
   6. Quiz interativo
   7. Validação do formulário
   ========================================================================== */

// O usuário pediu menos animações no sistema? Respeitamos isso.
const SEM_MOVIMENTO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* 0. SOMBRA DO CABEÇALHO AO ROLAR ------------------------------------------ */
/* Quando a página sai do topo, damos uma sombra mais forte à barra de
   navegação — um detalhe que dá sensação de profundidade. */
const cabecalho = document.querySelector('.cabecalho');

if (cabecalho) {
  const aoRolar = () => cabecalho.classList.toggle('cabecalho--rolado', window.scrollY > 8);
  aoRolar(); // já checa a posição assim que a página carrega
  window.addEventListener('scroll', aoRolar, { passive: true });
}


/* 1. MENU (telas pequenas) ------------------------------------------------- */
const botaoMenu = document.querySelector('.nav__botao-menu');
const menu = document.getElementById('menu');

if (botaoMenu && menu) {
  botaoMenu.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    // aria-expanded informa leitores de tela se o menu está aberto ou fechado
    botaoMenu.setAttribute('aria-expanded', String(aberto));
  });
}


/* 2. REVELAÇÃO AO ROLAR ---------------------------------------------------- */
/* Cada elemento com a classe "revelar" começa invisível (definido no CSS).
   Quando ele entra na tela, adicionamos a classe "revelado" e ele aparece. */
const elementosRevelar = document.querySelectorAll('.revelar');

if (elementosRevelar.length > 0) {
  if (SEM_MOVIMENTO || !('IntersectionObserver' in window)) {
    // Sem animação: mostra tudo de uma vez
    elementosRevelar.forEach((el) => el.classList.add('revelado'));
  } else {
    const observador = new IntersectionObserver((entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('revelado');
          obs.unobserve(entrada.target); // anima só uma vez
        }
      });
    }, { threshold: 0.15 });

    elementosRevelar.forEach((el) => observador.observe(el));
  }
}


/* 3. CONTADORES ANIMADOS --------------------------------------------------- */
/* Procura todo elemento com o atributo data-contador e anima o número
   de 0 até o valor final quando ele aparece na tela. */
const contadores = document.querySelectorAll('[data-contador]');

function animarContador(el) {
  const alvo = parseInt(el.dataset.contador, 10);
  const prefixo = el.dataset.prefixo || '';
  const sufixo = el.dataset.sufixo || '';

  // Sem animação: já mostra o valor final
  if (SEM_MOVIMENTO) {
    el.textContent = prefixo + alvo + sufixo;
    return;
  }

  const duracao = 1500; // tempo total em milissegundos
  let inicio = null;

  function passo(tempo) {
    if (inicio === null) inicio = tempo;
    const progresso = Math.min((tempo - inicio) / duracao, 1);
    // "easeOut": começa rápido e desacelera no fim (mais natural)
    const suave = 1 - Math.pow(1 - progresso, 3);
    el.textContent = prefixo + Math.round(suave * alvo) + sufixo;
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

if (contadores.length > 0 && 'IntersectionObserver' in window) {
  const obsContador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        animarContador(entrada.target);
        obs.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.5 });

  contadores.forEach((el) => obsContador.observe(el));
} else {
  // Navegador antigo: só mostra os valores finais
  contadores.forEach((el) => {
    el.textContent = (el.dataset.prefixo || '') + el.dataset.contador + (el.dataset.sufixo || '');
  });
}


/* 4. ACORDEÃO (Mitos x Fatos) ---------------------------------------------- */
const botoesAcordeao = document.querySelectorAll('.acordeao__botao');

botoesAcordeao.forEach((botao) => {
  botao.addEventListener('click', () => {
    const estaAberto = botao.getAttribute('aria-expanded') === 'true';
    const corpo = botao.nextElementSibling;

    botao.setAttribute('aria-expanded', String(!estaAberto));

    if (!estaAberto) {
      // Abrir: damos espaço interno e ajustamos a altura ao conteúdo
      corpo.style.paddingBottom = '1.5rem';
      corpo.style.maxHeight = corpo.scrollHeight + 'px';
    } else {
      // Fechar
      corpo.style.maxHeight = '0';
      corpo.style.paddingBottom = '0';
    }
  });
});


/* 5. COPIAR NÚMERO (Disque 100) -------------------------------------------- */
const botaoCopiar = document.getElementById('copiarNumero');
const copiadoAviso = document.getElementById('copiadoAviso');

if (botaoCopiar && copiadoAviso) {
  botaoCopiar.addEventListener('click', async () => {
    const numero = botaoCopiar.dataset.numero || '100';
    try {
      await navigator.clipboard.writeText(numero);
      copiadoAviso.textContent = '✓ Número ' + numero + ' copiado!';
    } catch (erro) {
      // Caso o navegador não permita copiar, orientamos o usuário
      copiadoAviso.textContent = 'Não foi possível copiar. Disque ' + numero + '.';
    }
    // A mensagem some depois de 3 segundos
    setTimeout(() => { copiadoAviso.textContent = ''; }, 3000);
  });
}


/* 6. QUIZ INTERATIVO ------------------------------------------------------- */
const quizConteudo = document.getElementById('quizConteudo');

if (quizConteudo) {
  // Banco de perguntas. "correta" é a posição (0,1,2,3) da resposta certa.
  const perguntas = [
    {
      pergunta: 'Qual é o canal gratuito e anônimo para denunciar violência contra a pessoa idosa?',
      opcoes: ['Disque 100', 'Disque 192', 'Disque 156', 'Disque 0800'],
      correta: 0,
      explicacao: 'O Disque 100 é o canal de Direitos Humanos: gratuito, anônimo e disponível 24 horas.'
    },
    {
      pergunta: 'Na maioria dos casos, quem comete a violência contra o idoso é:',
      opcoes: ['Um estranho na rua', 'Um familiar ou pessoa próxima', 'Um profissional de saúde', 'Um vizinho desconhecido'],
      correta: 1,
      explicacao: 'Cerca de 70% dos casos acontecem dentro do ambiente familiar, por pessoas próximas.'
    },
    {
      pergunta: 'Usar a aposentadoria do idoso sem o consentimento dele é um exemplo de violência:',
      opcoes: ['Física', 'Sexual', 'Patrimonial', 'Não é violência'],
      correta: 2,
      explicacao: 'Usar bens, dinheiro ou a aposentadoria sem autorização é violência patrimonial.'
    },
    {
      pergunta: 'Qual destes é um sinal de alerta de violência psicológica?',
      opcoes: ['Retraimento e medo repentinos', 'Boa relação com a família', 'Participação em atividades sociais', 'Autonomia para decidir'],
      correta: 0,
      explicacao: 'Mudanças como medo, tristeza e isolamento repentinos podem indicar abuso psicológico.'
    },
    {
      pergunta: 'Só existe violência contra o idoso quando há agressão física. Isso é:',
      opcoes: ['Verdadeiro', 'Falso'],
      correta: 1,
      explicacao: 'Falso! Negligência, abandono e abusos psicológico e patrimonial também são violência.'
    }
  ];

  let indiceAtual = 0; // pergunta atual
  let acertos = 0;     // quantas o usuário acertou

  const progresso = document.getElementById('quizProgresso');
  const pontos = document.getElementById('quizPontos');
  const barra = document.getElementById('quizBarra');

  // Letras que aparecem em cada opção (A, B, C, D)
  const LETRAS = ['A', 'B', 'C', 'D'];

  function mostrarPergunta() {
    const q = perguntas[indiceAtual];

    progresso.textContent = 'Pergunta ' + (indiceAtual + 1) + ' de ' + perguntas.length;
    pontos.textContent = 'Acertos: ' + acertos;
    barra.style.width = ((indiceAtual) / perguntas.length) * 100 + '%';

    // Monta as opções como botões
    let html = '<p class="quiz__pergunta">' + q.pergunta + '</p><div class="quiz__opcoes">';
    q.opcoes.forEach((texto, i) => {
      html += '<button class="quiz__opcao" data-indice="' + i + '">' +
                '<span class="quiz__opcao-letra">' + LETRAS[i] + '</span>' +
                '<span>' + texto + '</span>' +
              '</button>';
    });
    html += '</div><div class="quiz__feedback" hidden></div>';
    html += '<div class="quiz__rodape"><button class="botao botao--primario" id="quizProxima" hidden>Próxima</button></div>';

    quizConteudo.innerHTML = html;

    // Liga o clique de cada opção
    quizConteudo.querySelectorAll('.quiz__opcao').forEach((botao) => {
      botao.addEventListener('click', () => responder(botao));
    });
  }

  function responder(botaoEscolhido) {
    const escolhido = parseInt(botaoEscolhido.dataset.indice, 10);
    const q = perguntas[indiceAtual];
    const opcoes = quizConteudo.querySelectorAll('.quiz__opcao');

    // Desativa todas as opções para não responder duas vezes
    opcoes.forEach((op, i) => {
      op.disabled = true;
      if (i === q.correta) op.classList.add('quiz__opcao--certa');
    });

    if (escolhido === q.correta) {
      acertos++;
    } else {
      botaoEscolhido.classList.add('quiz__opcao--errada');
    }
    pontos.textContent = 'Acertos: ' + acertos;

    // Mostra a explicação
    const feedback = quizConteudo.querySelector('.quiz__feedback');
    feedback.innerHTML = '<strong>' +
      (escolhido === q.correta ? 'Correto! ' : 'Quase lá. ') +
      '</strong>' + q.explicacao;
    feedback.hidden = false;

    // Mostra o botão "Próxima" (ou "Ver resultado" na última)
    const proxima = document.getElementById('quizProxima');
    proxima.hidden = false;
    if (indiceAtual === perguntas.length - 1) proxima.textContent = 'Ver resultado';
    proxima.addEventListener('click', avancar, { once: true });
  }

  function avancar() {
    indiceAtual++;
    if (indiceAtual < perguntas.length) {
      mostrarPergunta();
    } else {
      mostrarResultado();
    }
  }

  function mostrarResultado() {
    barra.style.width = '100%';
    progresso.textContent = 'Resultado final';
    pontos.textContent = 'Acertos: ' + acertos;

    // Mensagem muda conforme o desempenho
    let mensagem;
    if (acertos === perguntas.length) {
      mensagem = 'Excelente! Você está pronto para reconhecer e combater a violência.';
    } else if (acertos >= perguntas.length / 2) {
      mensagem = 'Muito bem! Você já sabe bastante — continue se informando.';
    } else {
      mensagem = 'Que tal revisar o conteúdo acima? Cada informação ajuda a proteger alguém.';
    }

    quizConteudo.innerHTML =
      '<div class="quiz__resultado">' +
        '<p class="quiz__resultado-nota">' + acertos + '<span>/' + perguntas.length + '</span></p>' +
        '<p>' + mensagem + '</p>' +
        '<button class="botao botao--contorno" id="quizReiniciar">Refazer o quiz</button>' +
      '</div>';

    document.getElementById('quizReiniciar').addEventListener('click', () => {
      indiceAtual = 0;
      acertos = 0;
      mostrarPergunta();
    });
  }

  // Inicia o quiz
  mostrarPergunta();
}


/* 7. VALIDAÇÃO DO FORMULÁRIO ----------------------------------------------- */
const form = document.getElementById('formContato');

if (form) {
  const sucesso = document.getElementById('formSucesso');
  const botaoNovo = document.getElementById('novoEnvio');

  // Expressão regular simples para checar o formato do e-mail
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Define como validar cada campo. Retorna true se estiver válido.
  function campoValido(id) {
    const input = document.getElementById(id);
    const valor = input.value.trim();
    let valido = true;

    if (id === 'email') {
      valido = REGEX_EMAIL.test(valor);
    } else if (id === 'mensagem') {
      valido = valor.length >= 20;
    } else {
      valido = valor !== ''; // nome e assunto: não podem ficar vazios
    }

    // Liga/desliga o estado de erro no contêiner .campo (mostra a mensagem)
    input.closest('.campo').classList.toggle('campo--erro', !valido);
    // aria-invalid avisa leitores de tela que o campo está incorreto
    input.setAttribute('aria-invalid', String(!valido));
    return valido;
  }

  const campos = ['nome', 'email', 'assunto', 'mensagem'];

  // Validação ao sair do campo (blur): dá retorno imediato sem incomodar
  campos.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener('blur', () => campoValido(id));
  });

  // Validação ao enviar
  form.addEventListener('submit', (evento) => {
    evento.preventDefault(); // impede o recarregamento da página

    // Valida todos os campos e guarda o primeiro que estiver errado
    let primeiroErro = null;
    campos.forEach((id) => {
      const ok = campoValido(id);
      if (!ok && primeiroErro === null) primeiroErro = id;
    });

    if (primeiroErro !== null) {
      // Leva o foco para o primeiro campo com problema (acessibilidade)
      document.getElementById(primeiroErro).focus();
      return;
    }

    // Tudo certo: esconde o formulário e mostra a confirmação
    form.hidden = true;
    sucesso.hidden = false;
    sucesso.scrollIntoView({ behavior: SEM_MOVIMENTO ? 'auto' : 'smooth', block: 'center' });
  });

  // Botão "Enviar outra mensagem": limpa e volta ao formulário
  if (botaoNovo) {
    botaoNovo.addEventListener('click', () => {
      form.reset();
      campos.forEach((id) => document.getElementById(id).closest('.campo').classList.remove('campo--erro'));
      sucesso.hidden = true;
      form.hidden = false;
      form.scrollIntoView({ behavior: SEM_MOVIMENTO ? 'auto' : 'smooth', block: 'center' });
    });
  }
}
