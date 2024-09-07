let score = 0;  // Variável para armazenar a pontuação do usuário
let userAnswers = [];  // Para armazenar as respostas do usuário

// Adicionar evento ao botão de pesquisa
document.getElementById('searchBtn').addEventListener('click', function() {
  realizarPesquisa();
});

// Adicionar evento para permitir pesquisa via tecla "Enter"
document.getElementById('skillInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Impede o comportamento padrão do Enter (como enviar um formulário)
    realizarPesquisa(); // Chama a função de pesquisa
  }
});

// Função para realizar a pesquisa
function realizarPesquisa() {
  const skillInput = document.getElementById('skillInput').value.trim().toLowerCase(); 
  const availableSkills = Object.keys(quizDados); 

  const resultDiv = document.getElementById('skillResult');
  const quizSection = document.getElementById('quizSection');
  const quizSkill = document.getElementById('quizSkill');
  const suggestedSkillsDiv = document.getElementById('suggestedSkills');
  const mainContent = document.querySelector('main');
  const searchCard = document.querySelector('.card.mt-4.p-4');  
  const headline = document.querySelector('h1');  
  const buttonsDiv = document.getElementById('suggestedSkills');  // Usado para ocultar o contêiner de botões de habilidades

  // Limpa resultados anteriores
  resultDiv.innerHTML = '';
  suggestedSkillsDiv.innerHTML = '';

  // Verifica se o campo de pesquisa está vazio
  if (skillInput === '') {
    resultDiv.innerHTML = `<p class="text-danger">Por favor, insira o nome de uma habilidade para pesquisar.</p>`;
    return;
  }

  // Lista de habilidades relacionadas à pesquisa por palavra-chave
  let relatedSkills = [];

  // Checa se a palavra inserida corresponde a uma habilidade ou a uma palavra-chave
  for (const skill in quizDados) {
    const keywords = quizDados[skill].keywords;
    if (skill.includes(skillInput) || keywords.includes(skillInput)) {
      relatedSkills.push(skill);  // Adiciona as habilidades encontradas na lista de habilidades relacionadas
    }
  }

  if (relatedSkills.length > 0) {
    // Exibe as habilidades encontradas para o usuário escolher
    resultDiv.innerHTML = `<p class="text-success">Habilidade(s) encontrada(s): Selecione a habilidade que deseja avaliar:</p>`;
    relatedSkills.forEach(function(skill) {
      const skillButton = document.createElement('button');
      skillButton.classList.add('btn', 'btn-secondary', 'm-2');
      skillButton.textContent = formatSkillName(skill);
      skillButton.addEventListener('click', function() {
        // Oculta a headline e os botões de habilidades ao iniciar o quiz
        headline.style.display = 'none';  
        buttonsDiv.style.display = 'none';  // Oculta os botões de habilidades
        searchCard.style.display = 'none';  
        resultDiv.style.display = 'none';

        // Ocultar os botões de habilidades ao iniciar o quiz
        suggestedSkillsDiv.classList.add('d-none');

        // Exibir o nome da habilidade e a subheadline
        quizSection.classList.remove('d-none');
        quizSkill.innerHTML = `Avaliação Habilidade: <strong>${formatSkillName(skill)}</strong>`;
        quizSection.innerHTML = `
          <h2>Avaliação Habilidade: ${formatSkillName(skill)}</h2>
          <h3>Responda às perguntas para avaliarmos o seu nível de habilidade</h3>
        `;

        // Iniciar o quiz com a primeira pergunta
        displayQuiz(skill, 0); // Começa na primeira pergunta (índice 0)
      });
      suggestedSkillsDiv.appendChild(skillButton);
    });
  } else {
    // Caso não haja nenhuma habilidade correspondente
    resultDiv.innerHTML = `<p class="text-danger">A habilidade pesquisada não foi encontrada. Aqui estão algumas habilidades que você pode avaliar:</p>`;

    // Exibe todas as skills disponíveis como sugestão
    availableSkills.forEach(function(availableSkill) {
      const skillButton = document.createElement('button');
      skillButton.classList.add('btn', 'btn-secondary', 'm-2');
      skillButton.textContent = formatSkillName(availableSkill);
      skillButton.addEventListener('click', function() {
        headline.style.display = 'none';  // Oculta a headline
        buttonsDiv.style.display = 'none';  // Oculta os botões de habilidades
        resultDiv.innerHTML = `Skill selecionada: <strong>${formatSkillName(availableSkill)}</strong>`;
        quizSection.classList.remove('d-none');
        quizSkill.innerHTML = `Avaliação Habilidade: ${formatSkillName(availableSkill)}`;

        // Reiniciar a pontuação
        score = 0;
        userAnswers = [];

        // Esconder elementos da home quando o quiz começar
        searchCard.style.display = 'none';  
        resultDiv.style.display = 'none';

        // Começar o quiz com a skill selecionada
        displayQuiz(availableSkill, 0);
      });
      suggestedSkillsDiv.appendChild(skillButton);
    });
  }
}

// Função para remover o _ e formatar o nome da habilidade
function formatSkillName(skill) {
  return skill.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function displayQuiz(skill, questionIndex) {
  const quizContainer = document.getElementById('quizSection');
  const skillQuiz = quizDados[skill];
  const questionObj = skillQuiz.questions[questionIndex];
  const totalQuestions = skillQuiz.questions.length;

  let quizContent = `
    <h2 class="quiz-header">Avaliação Habilidade: ${formatSkillName(skill)}</h2>
    <h3 class="quiz-subheader">${questionIndex + 1}/${totalQuestions}</h3>
    <div class="quiz-question">
      <p class="question-text"><strong>${questionObj.question}</strong></p>`;

  questionObj.options.forEach((option, i) => {
    quizContent += `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="question${questionIndex}" id="option${i}" value="${i}">
        <label class="form-check-label" for="option${i}">
          ${option}
        </label>
      </div>`;
  });

  quizContent += `<button id="nextBtn" class="btn btn-primary mt-3 d-none">Próxima Pergunta</button></div>`;
  quizContainer.innerHTML = quizContent;

  // Quando o usuário responder, habilitar o botão para avançar
  const options = document.querySelectorAll(`input[name="question${questionIndex}"]`);
  options.forEach(option => {
    option.addEventListener('change', (e) => {
      document.getElementById('nextBtn').classList.remove('d-none');
      const selectedAnswer = parseInt(e.target.value, 10);

      // Armazenar a resposta do usuário
      userAnswers[questionIndex] = {
        selected: selectedAnswer,
        correct: questionObj.correct,
        explanation: questionObj.explanation,
        question: questionObj.question,
        options: questionObj.options
      };

      // Verificar se a resposta está correta
      if (selectedAnswer === questionObj.correct) {
        score++;  // Incrementa a pontuação se a resposta estiver correta
      }
    });
  });

  // Botão para a próxima pergunta
  document.getElementById('nextBtn').addEventListener('click', function() {
    if (questionIndex + 1 < totalQuestions) {
      displayQuiz(skill, questionIndex + 1); // Ir para a próxima pergunta
    } else {
      // Finalizar o quiz e exibir resultado
      showQuizResults(skill);
    }
  });
}

function showQuizResults(skill) {
  const quizSection = document.getElementById('quizSection');
  const totalQuestions = quizDados[skill].questions.length;
  
  // Definir o nível de acordo com o número de acertos
  let levelMessage = '';
  let imagePath = ''; // Caminho para a imagem correspondente ao nível
  if (score <= 2) {
    levelMessage = `Seu nível é iniciante, recomendamos avaliar e buscar mais conhecimento sobre a habilidade '${formatSkillName(skill)}'. Continue estudando e praticando para melhorar suas competências.`;
    imagePath = 'src/Iniciante.webp';  // Caminho para a imagem de iniciante
  } else if (score >= 3 && score <= 5) {
    levelMessage = `Seu nível é básico, você tem algum conhecimento sobre a habilidade '${formatSkillName(skill)}', mas há espaço para progresso. Continue praticando e aprofundando seus estudos para avançar.`;
    imagePath = 'src/básico.webp';  // Caminho para a imagem de básico
  } else if (score >= 6 && score <= 8) {
    levelMessage = `Seu nível é intermediário, você demonstrou uma boa compreensão da habilidade '${formatSkillName(skill)}'. Para alcançar a excelência, continue praticando e aplicando o conhecimento adquirido.`;
    imagePath = 'src/intermediário.webp';  // Caminho para a imagem de intermediário
  } else {
    levelMessage = `Seu nível é avançado! Você possui um forte domínio da habilidade '${formatSkillName(skill)}'. Continue praticando para manter e aprimorar esse alto nível de competência.`;
    imagePath = 'src/avançado.webp';  // Caminho para a imagem de avançado
  }

  // Exibir o resultado final com a imagem correspondente e o texto de nível
  quizSection.innerHTML = `
    <h2>Você completou o quiz!</h2>
    <img src="${imagePath}" alt="Imagem do nível atingido" class="img-fluid mt-3" style="max-width: 300px;"/>  <!-- Adicionando a imagem -->
    <p>Pontuação final: ${score} de ${totalQuestions}</p>
    <p><strong>${levelMessage}</strong></p>
    <div class="d-flex justify-content-between">
      <button id="detailsBtn" class="btn btn-success mt-3">Detalhes</button>
      <button id="backBtn" class="btn btn-danger mt-3">Voltar ao Início</button>
    </div>
    <div id="detailsSection" class="mt-4 d-none"></div>
  `;

  // Botão de detalhes com funcionalidade de abrir e retrair
  const detailsSection = document.getElementById('detailsSection');
  document.getElementById('detailsBtn').addEventListener('click', function() {
    detailsSection.classList.toggle('d-none'); // Alternar entre abrir e fechar os detalhes

    if (!detailsSection.classList.contains('d-none')) {
      showQuizDetails();
      // Mostrar o botão de exportar imagem dentro dos detalhes
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn btn-secondary mt-3';
      exportBtn.innerText = 'Exportar Resultado como Imagem';
      detailsSection.appendChild(exportBtn);

      exportBtn.addEventListener('click', function() {
        exportAsImage();  // Chama a função para exportar como imagem
      });
    }
  });

  // Botão de voltar
  document.getElementById('backBtn').addEventListener('click', function() {
    location.reload();  // Recarregar a página para voltar ao início
  });
}

function showQuizDetails() {
  const detailsSection = document.getElementById('detailsSection');

  let detailsContent = '<h3>Detalhes do Quiz</h3>';

  userAnswers.forEach((answer, index) => {
    const wasCorrect = answer.selected === answer.correct ? "Correto" : "Errado";
    detailsContent += `
      <div class="quiz-details">
        <p><strong>Questão ${index + 1}: ${answer.question}</strong></p>
        <p>Sua resposta: ${answer.options[answer.selected]} (${wasCorrect})</p>
        <p>Resposta correta: ${answer.options[answer.correct]}</p>
        <p>Explicação: ${answer.explanation}</p>
        <hr />
      </div>
    `;
  });

  detailsSection.innerHTML = detailsContent;
}

// Função para exportar o resultado como imagem
function exportAsImage() {
  html2canvas(document.getElementById('quizSection')).then(function(canvas) {
    let link = document.createElement('a');
    link.download = 'resultado_quiz.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}
