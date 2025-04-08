// Função para gerar estrutura HTML baseada nos dados do localStorage
function gerarQuestoes() {
    const provas = JSON.parse(localStorage.getItem("provas") || '[]');
    if (provas.length === 0) {
        showAlert('Nenhuma prova encontrada');
        window.location.href = '../../index.html';
        return;
    }

    const dadosProva = provas[provas.length - 1]; // Get the last exam
    const container = document.getElementById("questoes-container");

    let numeroQuestao = 1;

    dadosProva.assuntos.forEach((assunto) => {
        // Adiciona um título para o assunto
        const tituloAssunto = document.createElement("p");
        tituloAssunto.classList.add("assunto-titulo");
        tituloAssunto.textContent = `Assunto: ${assunto.assunto}`;
        container.appendChild(tituloAssunto);

        // Gera as questões para o assunto atual
        for (let i = 0; i < assunto.numeroQuestoes; i++) {
            const questaoSection = document.createElement("section");
            questaoSection.classList.add("question");

            questaoSection.innerHTML = `
                <div class="enunciado">
                    <p class="number-question">${numeroQuestao}</p>
                    <textarea name="enunciado" placeholder="Descreva o enunciado da questão sobre ${assunto.assunto} (Peso: ${assunto.peso})"></textarea>
                </div>
                <div class="alternatives">
                    <input type="radio" id="correct-A-${numeroQuestao}" name="correct-${numeroQuestao}" value="A">
                    <input type="text" id="A-${numeroQuestao}" name="A" class="alternatives" placeholder="Descreva a alternativa">
                </div>
                <div class="alternatives">
                    <input type="radio" id="correct-B-${numeroQuestao}" name="correct-${numeroQuestao}" value="B">
                    <input type="text" id="B-${numeroQuestao}" name="B" class="alternatives" placeholder="Descreva a alternativa">
                </div>
                <div class="alternatives">
                    <input type="radio" id="correct-C-${numeroQuestao}" name="correct-${numeroQuestao}" value="C">
                    <input type="text" id="C-${numeroQuestao}" name="C" class="alternatives" placeholder="Descreva a alternativa">
                </div>
                <div class="alternatives">
                    <input type="radio" id="correct-D-${numeroQuestao}" name="correct-${numeroQuestao}" value="D">
                    <input type="text" id="D-${numeroQuestao}" name="D" class="alternatives" placeholder="Descreva a alternativa">
                </div>
                <div class="alternatives">
                    <input type="radio" id="correct-E-${numeroQuestao}" name="correct-${numeroQuestao}" value="E">
                    <input type="text" id="E-${numeroQuestao}" name="E" class="alternatives" placeholder="Descreva a alternativa">
                </div>
            `;

            container.appendChild(questaoSection);
            numeroQuestao++;
        }
    });
}

// Chamar a função para gerar as questões
gerarQuestoes();

// Add event listener for radio buttons
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function () {
        // Reset error styling for all radio buttons in this question group
        const questionDiv = this.closest('.question');
        questionDiv.querySelectorAll('input[type="radio"]').forEach(r => {
            r.style.borderColor = '#999';
        });
    });
});

// Add event listener for back button
document.querySelector('.voltar').addEventListener('click', function() {
    window.location.href = '../../index.html';
});

document.querySelector('.avancar').addEventListener('click', function (e) {
    e.preventDefault();

    const questions = document.querySelectorAll('.question');
    let isValid = true;
    let firstError = null;

    questions.forEach((question, index) => {
        const questionNumber = index + 1;

        // Reset previous error styles
        question.querySelectorAll('textarea, input[type="text"]').forEach(field => {
            field.style.borderColor = '#ccc';
        });

        // Validate enunciado
        const enunciado = question.querySelector('textarea[name="enunciado"]');
        if (!enunciado.value.trim()) {
            enunciado.style.borderColor = '#ff3333';
            isValid = false;
            if (!firstError) firstError = enunciado;
        }

        // Validate alternatives
        const alternatives = question.querySelectorAll('input[type="text"]');
        alternatives.forEach((alt) => {
            if (!alt.value.trim()) {
                alt.style.borderColor = '#ff3333';
                isValid = false;
                if (!firstError) firstError = alt;
            }
        });

        // Validate radio selection
        const radioSelected = question.querySelector(`input[name="correct-${questionNumber}"]:checked`);
        if (!radioSelected) {
            question.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.style.borderColor = '#ff3333';
            });
            isValid = false;
            if (!firstError) firstError = question.querySelector('input[type="radio"]');
        }
    });

    if (!isValid) {
        showAlert('Por favor, preencha todos os campos obrigatórios e selecione as alternativas corretas antes de prosseguir.');
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Get provas array and last exam
    const provas = JSON.parse(localStorage.getItem("provas") || '[]');
    if (provas.length === 0) {
        showAlert('Erro: Prova não encontrada');
        window.location.href = '../../index.html';
        return;
    }

    // Add questions to the last exam
    const lastExam = provas[provas.length - 1];
    const questionsData = {};
    lastExam.assuntos.forEach(assunto => {
        questionsData[assunto.assunto] = [];
    });

    // Track current subject and question count
    let currentSubjectIndex = 0;
    let questionCountInCurrentSubject = 0;

    questions.forEach((question, index) => {
        const questionNumber = index + 1;

        // Check if we need to move to next subject
        while (currentSubjectIndex < lastExam.assuntos.length) {
            if (questionCountInCurrentSubject < lastExam.assuntos[currentSubjectIndex].numeroQuestoes) {
                break;
            }
            currentSubjectIndex++;
            questionCountInCurrentSubject = 0;
        }
        console.log("lastExam", lastExam);
        console.log("currentSubjectIndex", currentSubjectIndex);
        const currentSubject = lastExam.assuntos[currentSubjectIndex].assunto;

        const questionData = {
            enunciado: question.querySelector('textarea[name="enunciado"]').value,
            alternativas: {
                A: question.querySelector(`#A-${questionNumber}`).value,
                B: question.querySelector(`#B-${questionNumber}`).value,
                C: question.querySelector(`#C-${questionNumber}`).value,
                D: question.querySelector(`#D-${questionNumber}`).value,
                E: question.querySelector(`#E-${questionNumber}`).value
            },
            alternativaCorreta: question.querySelector(`input[name="correct-${questionNumber}"]:checked`).value,
            peso: lastExam.assuntos[currentSubjectIndex].peso
        };

        questionsData[currentSubject].push(questionData);
        questionCountInCurrentSubject++;
    });

    // Update the last exam with questions
    lastExam.questoes = questionsData;

    // Save back to localStorage
    localStorage.setItem('provas', JSON.stringify(provas));

    // Redirect to review page
    window.location.href = '../files/index.html';
});

function showAlert(message) {
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('customAlert').style.display = 'block';
}

function closeAlert() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('customAlert').style.display = 'none';
}