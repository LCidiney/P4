$(document).ready(function() {
    $('.imprimir').click(function(e) {
        e.preventDefault();
        const tipo = $(this).data('tipo');
        const printContainer = $('#print-container');

        // Carregar o template HTML correspondente
        $.get(`./assets/${tipo}.html`, function(template) {
            // Inserir o template no container
            printContainer.html(template);
            
            // Preencher os dados se for uma prova
            if (tipo === 'prova') {
                const provas = JSON.parse(localStorage.getItem('provas') || '[]');
                if (provas.length === 0) {
                    alert('Nenhuma prova encontrada!');
                    return;
                }
                
                const prova = provas[provas.length - 1];
                
                // Aguardar o DOM ser atualizado
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
                    
                    // Imprimir após preencher
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
