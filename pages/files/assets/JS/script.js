$(document).ready(function() {
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
            
            if (tipo === 'folhaResposta') {
                setTimeout(() => {
                    // Preencher cabeçalho
                    $('#escola', printContainer).text(prova.cabecalho.escola);
                    $('#materia', printContainer).text(prova.cabecalho.materia);
                    $('#professor', printContainer).text(prova.cabecalho.professor);
                    $('#anoEscolar', printContainer).text(prova.cabecalho.anoEscolar);
                    $('#descricao', printContainer).text(prova.cabecalho.descricao);
                    
                    // Gerar grid de questões
                    const questionsGrid = $('#questions-grid', printContainer);
                    questionsGrid.empty();
                    
                    let questionNumber = 1;
                    const totalQuestions = prova.totalQuestoes;
                    const questionsPerColumn = Math.ceil(totalQuestions / 4); // Divide as questões em 4 colunas
                    
                    // Criar div para cada coluna
                    for (let col = 0; col < 4; col++) {
                        const column = $('<div class="questions-column"></div>');
                        
                        // Preencher questões na coluna atual
                        for (let row = 0; row < questionsPerColumn; row++) {
                            const currentQuestion = col * questionsPerColumn + row + 1;
                            if (currentQuestion <= totalQuestions) {
                                const questionHtml = `
                                    <div class="question">
                                        ${formatQuestionNumber(currentQuestion)}. 
                                        <div class="options">
                                            <span class="circle">A</span>
                                            <span class="circle">B</span>
                                            <span class="circle">C</span>
                                            <span class="circle">D</span>
                                            <span class="circle">E</span>
                                        </div>
                                    </div>
                                `;
                                column.append(questionHtml);
                            }
                        }
                        questionsGrid.append(column);
                    }

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
                                        <strong>${formatQuestionNumber(numeroQuestao)}.</strong> ${questao.enunciado}
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
                    
                    // Imprimir após preencher
                    const content = printContainer.html();
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(content);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }, 100);
            } else if (tipo === 'gabarito') {
                setTimeout(() => {
                    // Preencher cabeçalho
                    $('#escola', printContainer).text(prova.cabecalho.escola);
                    $('#materia', printContainer).text(prova.cabecalho.materia);
                    $('#professor', printContainer).text(prova.cabecalho.professor);
                    $('#anoEscolar', printContainer).text(prova.cabecalho.anoEscolar);
                    $('#descricao', printContainer).text(prova.cabecalho.descricao);
                    $('#totalQuestoes', printContainer).text(prova.totalQuestoes);
                    
                    // Gerar grid de questões
                    const questionsGrid = $('#questions-grid', printContainer);
                    questionsGrid.empty();
                    
                    let questionNumber = 1;
                    const questionsPerColumn = Math.ceil(prova.totalQuestoes / 4);
                    
                    // Criar array com todas as questões e suas respostas corretas
                    const allQuestions = [];
                    Object.values(prova.questoes).forEach(questoesAssunto => {
                        questoesAssunto.forEach(questao => {
                            allQuestions.push({
                                number: questionNumber++,
                                correta: questao.alternativaCorreta
                            });
                        });
                    });
                    
                    questionNumber = 1; // Reset para criar o grid
                    
                    // Criar div para cada coluna
                    for (let col = 0; col < 4; col++) {
                        const column = $('<div class="questions-column"></div>');
                        
                        // Preencher questões na coluna atual
                        for (let row = 0; row < questionsPerColumn; row++) {
                            const currentQuestion = col * questionsPerColumn + row;
                            if (currentQuestion < allQuestions.length) {
                                const question = allQuestions[currentQuestion];
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
                            }
                        }
                        questionsGrid.append(column);
                    }

                    // Imprimir
                    const content = printContainer.html();
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(content);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }, 100);
            }
        });
    });

    // Botão voltar
    $('.voltar').click(function() {
        window.history.back();
    });
});
