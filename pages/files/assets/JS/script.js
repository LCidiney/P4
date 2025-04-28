$(document).ready(function() {
    function distribuirQuestoesEmColunas(questions, maxQuestionsPerColumn = 10) {
        const columns = [];
        let currentColumn = [];
        
        questions.forEach((question, index) => {
            if (currentColumn.length >= maxQuestionsPerColumn) {
                columns.push(currentColumn);
                currentColumn = [];
            }
            currentColumn.push(question);
        });
        
        if (currentColumn.length > 0) {
            columns.push(currentColumn);
        }
        
        return columns;
    }

    $('.imprimir').click(function(e) {
        e.preventDefault();
        const tipo = $(this).data('tipo');
        const printContainer = $('#print-container');

        // Função auxiliar para formatar o número da questão
        const formatQuestionNumber = (num) => num < 10 ? `0${num}` : num;

        // Carregar o template HTML correspondente
        $.get(`./assets/${tipo}.html`, function(template) {
            printContainer.html(template);
            
            // Carregar dados do localStorage
            const provas = JSON.parse(localStorage.getItem('provas') || '[]');
            if (provas.length === 0) {
                alert('Nenhuma prova encontrada!');
                return;
            }
            
            const prova = provas[provas.length - 1];
            
            if (tipo === 'folhaResposta' || tipo === 'gabarito') {
                setTimeout(() => {
                    // Preencher cabeçalho
                    $('#escola', printContainer).text(prova.cabecalho.escola);
                    $('#materia', printContainer).text(prova.cabecalho.materia);
                    $('#professor', printContainer).text(prova.cabecalho.professor);
                    $('#anoEscolar', printContainer).text(prova.cabecalho.anoEscolar);
                    $('#descricao', printContainer).text(prova.cabecalho.descricao);

                    // Criar array com todas as questões
                    const allQuestions = [];
                    let questionNumber = 1;

                    // Coletar todas as questões em ordem
                    Object.values(prova.questoes).forEach(questoesAssunto => {
                        questoesAssunto.forEach(questao => {
                            allQuestions.push({
                                number: questionNumber++,
                                correta: tipo === 'gabarito' ? questao.alternativaCorreta : null
                            });
                        });
                    });

                    // Distribuir questões em colunas
                    const columns = distribuirQuestoesEmColunas(allQuestions);
                    const questionsGrid = $('#questions-grid', printContainer);
                    questionsGrid.empty();

                    columns.forEach(columnQuestions => {
                        const column = $('<div class="questions-column"></div>');
                        
                        columnQuestions.forEach(question => {
                            const questionHtml = `
                                <div class="question">
                                    ${formatQuestionNumber(question.number)}. 
                                    <div class="options">
                                        <span class="circle${question.correta === 'A' ? ' correct' : ''}">A</span>
                                        <span class="circle${question.correta === 'B' ? ' correct' : ''}">B</span>
                                        <span class="circle${question.correta === 'C' ? ' correct' : ''}">C</span>
                                        <span class="circle${question.correta === 'D' ? ' correct' : ''}">D</span>
                                        <span class="circle${question.correta === 'E' ? ' correct' : ''}">E</span>
                                    </div>
                                </div>
                            `;
                            column.append(questionHtml);
                        });
                        
                        questionsGrid.append(column);
                    });

                    // Imprimir
                    const content = printContainer.html();
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(content);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }, 100);
            } else if (tipo === 'prova') {
                setTimeout(() => {
                    // Preencher cabeçalho
                    $('#escola', printContainer).text(prova.cabecalho.escola);
                    $('#materia', printContainer).text(prova.cabecalho.materia);
                    $('#professor', printContainer).text(prova.cabecalho.professor);
                    $('#anoEscolar', printContainer).text(prova.cabecalho.anoEscolar);
                    $('#descricao', printContainer).text(prova.cabecalho.descricao);
                    
                    // Preencher questões
                    const questoesContainer = $('#questoes', printContainer);
                    let numeroQuestao = 1;
                    
                    prova.assuntos.forEach(assunto => {
                        questoesContainer.append(`<div class="assunto">Assunto: ${assunto.assunto}</div>`);
                        const questoesDoAssunto = prova.questoes[assunto.assunto];
                        questoesDoAssunto.forEach(questao => {
                            const html = `
                                <div class="questao">
                                    <div>
                                        <strong>${numeroQuestao}.</strong> ${questao.enunciado}
                                        <span class="peso">(Peso: ${questao.peso})</span>
                                    </div>
                                    <div class="alternativas">
                                        <p>a) ${questao.alternativas.A}</p>
                                        <p>b) ${questao.alternativas.B}</p>
                                        <p>c) ${questao.alternativas.C}</p>
                                        <p>d) ${questao.alternativas.D}</p>
                                        <p>e) ${questao.alternativas.E}</p>
                                    </div>
                                </div>
                            `;
                            questoesContainer.append(html);
                            numeroQuestao++;
                        });
                    });
                    
                    // Imprimir em uma nova janela
                    const content = printContainer.html();
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(content);
                    printWindow.document.close();
                    printWindow.focus();

                    // Aguardar o carregamento completo antes de imprimir
                    printWindow.onload = function() {
                        printWindow.print();
                        printWindow.close();
                    };
                }, 100);
            }
        });
    });

    // Botão voltar
    $('.voltar').click(function() {
        window.history.back();
    });
});
