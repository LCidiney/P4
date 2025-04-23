// Função para gerar estrutura HTML baseada nos dados do localStorage
function gerarQuestoes() {
    const provas = JSON.parse(localStorage.getItem("provas") || '[]');
    if (provas.length === 0) {
        mostrarErro('Nenhuma prova encontrada');
        window.location.href = '../../index.html';
        return;
    }

    const dadosProva = provas[provas.length - 1]; // Get the last exam
    const container = document.getElementById("questoes-container");

    let numeroQuestao = 1;

    dadosProva.assuntos.forEach((assunto) => {
        // Adiciona um título para o assunto
        const tituloAssunto = document.createElement("h5");
        tituloAssunto.classList.add("assunto-titulo", "center-align", "col", "s12");
        tituloAssunto.textContent = `Assunto: ${assunto.assunto}`;
        container.appendChild(tituloAssunto);

        // Gera as questões para o assunto atual
        for (let i = 0; i < assunto.numeroQuestoes; i++) {
            const questaoDiv = document.createElement("div");
            questaoDiv.classList.add("question", "col", 'l12');

            questaoDiv.innerHTML = `
                <div class="enunciado col l12">
                    <p class="number-question col l1 green">${numeroQuestao}</p>
                    <textarea class="col l11" name="enunciado" placeholder="Descreva o enunciado da questão sobre ${assunto.assunto} (Peso: ${assunto.peso})"></textarea>
                </div>
                <div class="alternatives col l12">
                    <label class="col l1">
                    <input type="radio" id="correct-A-${numeroQuestao}" name="correct-${numeroQuestao}" value="A"/>
                    <span>A</span>
                    </label>
                    <input type="text" id="A-${numeroQuestao}" name="A" class="alternatives col l11" placeholder="Descreva a alternativa"/>
                </div>
                <div class="alternatives col l12">
                    <label class="col l1">
                    <input  type="radio" id="correct-B-${numeroQuestao}" name="correct-${numeroQuestao}" value="B"/>
                    <span>B</span>
                    </label>
                    <input type="text" id="B-${numeroQuestao}" name="B" class="alternatives col l11" placeholder="Descreva a alternativa"/>
                </div>
                <div class="alternatives col l12">
                    <label class="col l1">
                    <input  type="radio" id="correct-C-${numeroQuestao}" name="correct-${numeroQuestao}" value="C"/>
                    <span>C</span>
                    </label>
                    <input type="text" id="C-${numeroQuestao}" name="C" class="alternatives col l11" placeholder="Descreva a alternativa"/>
                </div>
                <div class="alternatives col l12">
                    <label class="col l1">
                    <input  type="radio" id="correct-D-${numeroQuestao}" name="correct-${numeroQuestao}" value="D"/>
                    <span>D</span>
                    </label>
                    <input type="text" id="D-${numeroQuestao}" name="D" class="alternative col l11" placeholder="Descreva a alternativa"/>
                </div>
                <div class="alternatives col l12">
                    <label class="col l1">
                    <input  type="radio" id="correct-E-${numeroQuestao}" name="correct-${numeroQuestao}" value="E"/>
                    <span>E</span>
                    </label>
                    <input type="text" id="E-${numeroQuestao}" name="E" class="alternative col l11" placeholder="Descreva a alternativa"/>
                </div>
            `;

            container.appendChild(questaoDiv);
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
    let hasErrors = false;
    let firstError = null;

    questions.forEach((question, index) => {
        // Reset previous error styles
        question.querySelectorAll('textarea, input[type="text"], input[type="radio"]').forEach(field => {
            field.style.borderColor = '#ccc';
        });

        // Check all required fields
        const enunciado = question.querySelector('textarea[name="enunciado"]');
        const alternatives = question.querySelectorAll('input[type="text"]');
        const radioSelected = question.querySelector(`input[name="correct-${index + 1}"]:checked`);

        if (!enunciado.value.trim() || 
            ![...alternatives].every(alt => alt.value.trim()) || 
            !radioSelected) {
            
            // Mark empty fields
            if (!enunciado.value.trim()) enunciado.style.borderColor = '#ff3333';
            alternatives.forEach(alt => {
                if (!alt.value.trim()) alt.style.borderColor = '#ff3333';
            });
            if (!radioSelected) {
                question.querySelectorAll('input[type="radio"]').forEach(radio => {
                    radio.style.borderColor = '#ff3333';
                });
            }

            hasErrors = true;
            if (!firstError) firstError = enunciado;
        }
    });

    if (hasErrors) {
        mostrarErro('Por favor, preencha todos os campos e marque a alternativa correta em cada questão.');
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Se não houver erros, mostrar confirmação antes de prosseguir
    mostrarConfirmacao((confirmado) => {
        if (!confirmado) return;

        // Get provas array and last exam
        const provas = JSON.parse(localStorage.getItem("provas") || '[]');
        if (provas.length === 0) {
            mostrarErro('Erro: Prova não encontrada');
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

        // Show success message before redirecting
        mostrarSucesso(() => {
            window.location.href = '../files/index.html';
        });
    });
});

// Função para mostrar mensagem de erro
function mostrarErro(mensagem) {
    const mensagemErro = document.createElement('div');
    mensagemErro.className = 'mensagem-erro';
    mensagemErro.innerHTML = `
        <div class="erro-conteudo">
            <h4><i class="material-icons left red-text">error</i>Atenção</h4>
            <div>${mensagem}</div>
            <button class="fechar-erro waves-effect waves-light btn-small red">Fechar</button>
        </div>
    `;
    
    // Aplicar estilos
    const styles = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000'
    };
    
    Object.assign(mensagemErro.style, styles);
    
    // Estilos para o conteúdo
    const erroConteudo = mensagemErro.querySelector('.erro-conteudo');
    Object.assign(erroConteudo.style, {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        maxWidth: '500px',
        width: '90%'
    });

    document.body.appendChild(mensagemErro);

    const fecharBtn = mensagemErro.querySelector('.fechar-erro');
    fecharBtn.addEventListener('click', () => document.body.removeChild(mensagemErro));
}

$(document).ready(function() {
    // Inicializar modais
    $('.modal').modal();
    
    // Handler do botão avançar
    $('#avancar').click(function() {
        const validacao = validarFormulario();
        
        if (!validacao.valido) {
            // Mostrar modal de erro
            const mensagem = `Por favor, preencha os seguintes campos:<br><ul>
                ${validacao.camposVazios.map(campo => `<li>${campo}</li>`).join('')}
            </ul>`;
            $('#errorMessage').html(mensagem);
            $('#modalError').modal('open');
            return;
        }

        // Mostrar modal de confirmação
        $('#modalConfirm').modal('open');
    });

    // Handler do botão confirmar
    $('#confirmAction').click(function() {
        // Coletar e salvar dados
        const dadosProva = {
            cabecalho: {
                escola: $('input[name="escola"]').val(),
                professor: $('input[name="professor"]').val(),
                materia: $('input[name="materia"]').val(),
                anoEscolar: $('input[name="anoEscolar"]').val(),
                descricao: $('textarea[name="descricao"]').val()
            },
            assuntos: []
        };

        $('#table-body tr').each(function() {
            dadosProva.assuntos.push({
                assunto: $(this).find('.assunto').val(),
                numeroQuestoes: parseInt($(this).find('.questoes').val()),
                peso: parseFloat($(this).find('.peso').val())
            });
        });

        // Salvar no localStorage
        let provas = JSON.parse(localStorage.getItem('provas') || '[]');
        provas.push(dadosProva);
        localStorage.setItem('provas', JSON.stringify(provas));

        // Mostrar modal de sucesso e redirecionar
        $('#modalSuccess').modal('open');
        $('#successAction').click(function() {
            window.location.href = './pages/questions/index.html';
        });
    });
});