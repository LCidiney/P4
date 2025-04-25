document.addEventListener('DOMContentLoaded', function() {
    const MAX_ASSUNTOS = 4;
    const MAX_QUESTOES_POR_ASSUNTO = 10;
    const adicionarBtn = document.getElementById('adicionar');
    const removerBtn = document.getElementById('remover');
    const tableBody = document.getElementById('table-body');
    const totalQuestoesElement = document.getElementById('total-questoes');
    const totalPesoElement = document.getElementById('total-peso');
    let idCounter = 0;
    let selectedRowId = null;

    function atualizarTotais() {
        let totalQuestoes = 0;
        let totalPeso = 0;
    
        const rows = tableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const questoes = parseInt(row.querySelector('input[type="number"].questoes').value) || 0;
            const peso = parseFloat(row.querySelector('input[type="number"].peso').value) || 0;
            
            // Formatar peso para sempre mostrar 2 casas decimais
            const pesoInput = row.querySelector('input[type="number"].peso');
            pesoInput.value = peso.toFixed(2);
            
            totalQuestoes += questoes;
            totalPeso += questoes * peso;
        });
    
        totalQuestoesElement.textContent = `Total de questões: ${totalQuestoes}`;
        totalPesoElement.textContent = `Peso total da prova: ${totalPeso.toFixed(2)}`;
    }

    function criarLinha() {
        if (tableBody.children.length >= MAX_ASSUNTOS) {
            const mensagem = `Não é possível adicionar mais que ${MAX_ASSUNTOS} assuntos.`;
            $('#errorMessage').html(mensagem);
            $('#modalError').modal('open');
            return;
        }

        const uniqueId = `row-${idCounter++}`;
        const tr = document.createElement('tr');
        tr.dataset.id = uniqueId;
        
        tr.innerHTML = `
            <td>
                <input type="text" placeholder="Digite o assunto..." class="assunto">
            </td>
            <td>
                <input type="number" value="0" min="0" max="${MAX_QUESTOES_POR_ASSUNTO}" class="questoes">
            </td>
            <td>
                <input type="number" value="1.00" min="0" step="0.05" class="peso">
            </td>
            <td style="text-align: right;">
                <button class="select-btn waves-effect waves-light btn-small">
                    <i class="material-icons">check</i>
                </button>
            </td>
        `;

        tableBody.appendChild(tr);

        // Adicionar event listeners
        const questoesInput = tr.querySelector('.questoes');
        questoesInput.addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            if (value > MAX_QUESTOES_POR_ASSUNTO) {
                e.target.value = MAX_QUESTOES_POR_ASSUNTO;
                mostrarErro(`Máximo de ${MAX_QUESTOES_POR_ASSUNTO} questões por assunto.`);
            }
            atualizarTotais();
        });

        const pesoInput = tr.querySelector('.peso');
        pesoInput.addEventListener('input', atualizarTotais);

        const selectBtn = tr.querySelector('.select-btn');
        selectBtn.addEventListener('click', function() {
            document.querySelectorAll('tr').forEach(row => row.classList.remove('selected'));
            tr.classList.add('selected');
            selectedRowId = uniqueId;
            removerBtn.disabled = false;
        });

        atualizarTotais();
    }

    adicionarBtn.addEventListener('click', criarLinha);

    removerBtn.addEventListener('click', function() {
        if (selectedRowId) {
            const row = document.querySelector(`tr[data-id="${selectedRowId}"]`);
            if (row) {
                row.remove();
                selectedRowId = null;
                removerBtn.disabled = true;
                atualizarTotais();
            }
        }
    });

    // Função para validar campos do formulário
    function validarFormulario() {
        // Validar campos do cabeçalho
        const escola = document.querySelector('input[name="escola"]').value.trim();
        const materia = document.querySelector('input[name="materia"]').value.trim();
        const professor = document.querySelector('input[name="professor"]').value.trim();
        const anoEscolar = document.querySelector('input[name="anoEscolar"]').value.trim();
        const descricao = document.querySelector('textarea[name="descricao"]').value.trim();

        let camposInvalidos = [];

        if (!escola) camposInvalidos.push('Nome da escola');
        if (!materia) camposInvalidos.push('Nome da matéria');
        if (!professor) camposInvalidos.push('Nome do professor');
        if (!anoEscolar) camposInvalidos.push('Ano escolar');
        if (!descricao) camposInvalidos.push('Descrição da prova');

        // Verificar se existe pelo menos um assunto
        const assuntos = tableBody.getElementsByTagName('tr');
        if (assuntos.length === 0) {
            camposInvalidos.push('Pelo menos um assunto deve ser adicionado');
            return { valido: false, camposInvalidos };
        }

        // Verificar se todos os assuntos estão preenchidos
        let assuntosVazios = false;
        Array.from(assuntos).forEach(row => {
            const assuntoInput = row.querySelector('input[type="text"].assunto');
            if (!assuntoInput.value.trim()) {
                assuntosVazios = true;
            }
        });

        if (assuntosVazios) {
            camposInvalidos.push('Todos os assuntos devem ser preenchidos');
        }

        // Verificar se o total de questões é maior que zero
        const totalQuestoes = parseInt(totalQuestoesElement.textContent.match(/\d+/)[0]);
        if (totalQuestoes <= 0) {
            camposInvalidos.push('O número total de questões deve ser maior que zero');
        }

        return { valido: camposInvalidos.length === 0, camposInvalidos };
    }

    // Função para coletar dados do formulário
    function coletarDados() {
        // Coletar dados do cabeçalho
        const cabecalho = {
            escola: document.querySelector('input[name="escola"]').value.trim(),
            materia: document.querySelector('input[name="materia"]').value.trim(),
            professor: document.querySelector('input[name="professor"]').value.trim(),
            anoEscolar: document.querySelector('input[name="anoEscolar"]').value.trim(),
            descricao: document.querySelector('textarea[name="descricao"]').value.trim()
        };

        // Coletar dados dos assuntos, questões e pesos
        const assuntos = [];
        const rows = tableBody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const id = row.dataset.id;
            const assunto = row.querySelector('input[type="text"].assunto').value.trim();
            const questoesInput = row.querySelector('input[type="number"].questoes');
            const pesoInput = row.querySelector('input[type="number"].peso');
            
            const numeroQuestoes = parseInt(questoesInput.value) || 0;
            const peso = parseFloat(pesoInput.value) || 0;
            
            assuntos.push({
                id,
                assunto,
                numeroQuestoes,
                peso
            });
        });

        // Coletar totais
        const totalQuestoes = parseInt(totalQuestoesElement.textContent.match(/\d+/)[0]);
        const totalPeso = parseFloat(totalPesoElement.textContent.match(/[\d.]+/)[0]);

        // Construir objeto completo de dados
        const dadosProva = {
            cabecalho,
            assuntos,
            totalQuestoes,
            totalPeso,
            dataCriacao: new Date().toISOString()
        };

        return dadosProva;
    }

    // Função para mostrar mensagem de erro
    function mostrarErro(mensagem) {
        const mensagemErro = document.createElement('div');
        mensagemErro.className = 'mensagem-erro';
        mensagemErro.innerHTML = `
            <div class="erro-conteudo">
                <h4><i class="material-icons left red-text">error</i>Atenção</h4>
                <p>${mensagem}</p>
            </div>
        `;
        document.body.appendChild(mensagemErro);
/*
        // Adicionar estilos para a mensagem de erro
        mensagemErro.style.position = 'fixed';
        mensagemErro.style.top = '0';
        mensagemErro.style.left = '0';
        mensagemErro.style.width = '100%';
        mensagemErro.style.height = '100%';
        mensagemErro.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        mensagemErro.style.display = 'flex';
        mensagemErro.style.justifyContent = 'center';
        mensagemErro.style.alignItems = 'center';
        mensagemErro.style.zIndex = '1000';

        const erroConteudo = mensagemErro.querySelector('.erro-conteudo');
        erroConteudo.style.backgroundColor = 'white';
        erroConteudo.style.padding = '20px';
        erroConteudo.style.borderRadius = '5px';
        erroConteudo.style.maxWidth = '400px';
        erroConteudo.style.width = '90%';

        const fecharBtn = mensagemErro.querySelector('.fechar-erro');
        fecharBtn.style.backgroundColor = '#0066cc';
        fecharBtn.style.color = 'white';
        fecharBtn.style.border = 'none';
        fecharBtn.style.padding = '8px 16px';
        fecharBtn.style.borderRadius = '4px';
        fecharBtn.style.cursor = 'pointer';
        fecharBtn.style.marginTop = '15px';
*/
        fecharBtn.addEventListener('click', function() {
            document.body.removeChild(mensagemErro);
        });
    }

    // Função para mostrar mensagem de confirmação
    function mostrarConfirmacao(callback) {
        const confirmacao = document.createElement('div');
        confirmacao.className = 'confirmacao';
        confirmacao.innerHTML = `
            <div class="confirmacao-conteudo">
                <h3>Confirmação</h3>
                <p>Deseja avançar com os dados preenchidos?</p>
                <div class="botoes-confirmacao">
                    <button class="confirmar">Sim</button>
                    <button class="cancelar">Não</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmacao);

        // Adicionar estilos para a mensagem de confirmação
        confirmacao.style.position = 'fixed';
        confirmacao.style.top = '0';
        confirmacao.style.left = '0';
        confirmacao.style.width = '100%';
        confirmacao.style.height = '100%';
        confirmacao.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        confirmacao.style.display = 'flex';
        confirmacao.style.justifyContent = 'center';
        confirmacao.style.alignItems = 'center';
        confirmacao.style.zIndex = '1000';

        const confirmacaoConteudo = confirmacao.querySelector('.confirmacao-conteudo');
        confirmacaoConteudo.style.backgroundColor = 'white';
        confirmacaoConteudo.style.padding = '20px';
        confirmacaoConteudo.style.borderRadius = '5px';
        confirmacaoConteudo.style.maxWidth = '400px';
        confirmacaoConteudo.style.width = '90%';

        const botoesContainer = confirmacao.querySelector('.botoes-confirmacao');
        botoesContainer.style.display = 'flex';
        botoesContainer.style.justifyContent = 'space-around';
        botoesContainer.style.marginTop = '15px';

        const confirmarBtn = confirmacao.querySelector('.confirmar');
        confirmarBtn.style.backgroundColor = '#0066cc';
        confirmarBtn.style.color = 'white';
        confirmarBtn.style.border = 'none';
        confirmarBtn.style.padding = '8px 16px';
        confirmarBtn.style.borderRadius = '4px';
        confirmarBtn.style.cursor = 'pointer';

        const cancelarBtn = confirmacao.querySelector('.cancelar');
        cancelarBtn.style.backgroundColor = '#f44336';
        cancelarBtn.style.color = 'white';
        cancelarBtn.style.border = 'none';
        cancelarBtn.style.padding = '8px 16px';
        cancelarBtn.style.borderRadius = '4px';
        cancelarBtn.style.cursor = 'pointer';

        confirmarBtn.addEventListener('click', function() {
            document.body.removeChild(confirmacao);
            callback(true);
        });

        cancelarBtn.addEventListener('click', function() {
            document.body.removeChild(confirmacao);
            callback(false);
        });
    }

    // Função para mostrar mensagem de sucesso
    function mostrarSucesso() {
        const sucesso = document.createElement('div');
        sucesso.className = 'sucesso';
        sucesso.innerHTML = `
            <div class="sucesso-conteudo">
                <h3>Sucesso!</h3>
                <p>Dados salvos com sucesso!</p>
                <button class="fechar-sucesso">OK</button>
            </div>
        `;
        document.body.appendChild(sucesso);

        // Adicionar estilos para a mensagem de sucesso
        sucesso.style.position = 'fixed';
        sucesso.style.top = '0';
        sucesso.style.left = '0';
        sucesso.style.width = '100%';
        sucesso.style.height = '100%';
        sucesso.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        sucesso.style.display = 'flex';
        sucesso.style.justifyContent = 'center';
        sucesso.style.alignItems = 'center';
        sucesso.style.zIndex = '1000';

        const sucessoConteudo = sucesso.querySelector('.sucesso-conteudo');
        sucessoConteudo.style.backgroundColor = 'white';
        sucessoConteudo.style.padding = '20px';
        sucessoConteudo.style.borderRadius = '5px';
        sucessoConteudo.style.maxWidth = '400px';
        sucessoConteudo.style.width = '90%';

        const fecharBtn = sucesso.querySelector('.fechar-sucesso');
        fecharBtn.style.backgroundColor = '#4CAF50';
        fecharBtn.style.color = 'white';
        fecharBtn.style.border = 'none';
        fecharBtn.style.padding = '8px 16px';
        fecharBtn.style.borderRadius = '4px';
        fecharBtn.style.cursor = 'pointer';
        fecharBtn.style.marginTop = '15px';

        fecharBtn.addEventListener('click', function() {
            document.body.removeChild(sucesso);
            // Redirecionar para a próxima página ou recarregar
            // window.location.href = 'proxima-pagina.html';
        });
    }

    // Função para mostrar alerta personalizado
    function showAlert(message) {
        document.getElementById('alertMessage').textContent = message;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('customAlert').style.display = 'block';
    }

    function closeAlert() {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('customAlert').style.display = 'none';
    }

    /* Adicionar evento de clique ao botão Avançar
    avancarBtn.addEventListener('click', function() {
        // Validar formulário
        const { valido, camposInvalidos } = validarFormulario();
        
        if (!valido) {
            // Mostrar mensagem de erro com os campos inválidos
            const mensagemErro = `Por favor, preencha os seguintes campos obrigatórios:<br>
                <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
                    ${camposInvalidos.map(campo => `<li>${campo}</li>`).join('')}
                </ul>`;
            mostrarErro(mensagemErro);
            return;
        }
        
        // Se for válido, mostrar mensagem de confirmação
        mostrarConfirmacao(function(confirmado) {
            if (confirmado) {
                // Coletar dados do formulário
                const dadosProva = coletarDados();
                
                // Carregar array de provas existente ou criar novo
                let provas = JSON.parse(localStorage.getItem('provas') || '[]');
                provas.push(dadosProva);
                
                // Salvar no localStorage
                localStorage.setItem('provas', JSON.stringify(provas));
                
                // Mostrar mensagem de sucesso
                mostrarSucesso();
                window.location.href = './pages/questions/index.html';
            }
        });
    });*/
});

$(document).ready(function() {
    // Inicializar modais
    $('.modal').modal();
    
    // Validar campos obrigatórios
    function validarFormulario() {
        const campos = {
            escola: $('input[name="escola"]').val(),
            professor: $('input[name="professor"]').val(),
            materia: $('input[name="materia"]').val(),
            anoEscolar: $('input[name="anoEscolar"]').val(),
            descricao: $('textarea[name="descricao"]').val()
        };

        const assuntos = [];
        $('#table-body tr').each(function() {
            assuntos.push({
                assunto: $(this).find('.assunto').val(),
                questoes: $(this).find('.questoes').val(),
                peso: $(this).find('.peso').val()
            });
        });

        const camposVazios = [];
        
        // Validar campos do cabeçalho
        Object.entries(campos).forEach(([campo, valor]) => {
            if (!valor || valor.trim() === '') {
                camposVazios.push(campo.charAt(0).toUpperCase() + campo.slice(1));
            }
        });

        // Validar assuntos
        if (assuntos.length === 0) {
            camposVazios.push('Pelo menos um assunto');
        } else {
            assuntos.forEach((assunto, index) => {
                if (!assunto.assunto || assunto.assunto.trim() === '') {
                    camposVazios.push(`Assunto ${index + 1}`);
                }
                if (!assunto.questoes || assunto.questoes <= 0) {
                    camposVazios.push(`Quantidade de questões do assunto ${index + 1}`);
                }
            });
        }

        return {
            valido: camposVazios.length === 0,
            camposVazios: camposVazios
        };
    }

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