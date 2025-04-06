document.addEventListener('DOMContentLoaded', function() {
    const MAX_ASSUNTOS = 4;
    const MAX_QUESTOES_POR_ASSUNTO = 10;
    const adicionarBtn = document.getElementById('adicionar');
    const removerBtn = document.getElementById('remover');
    const assuntosContainer = document.getElementById('inputs-assuntos');
    const questoesContainer = document.getElementById('inputs-questoes');
    const pesoContainer = document.getElementById('inputs-peso');
    const totalQuestoesElement = document.getElementById('total-questoes');
    const totalPesoElement = document.getElementById('total-peso');
    const avancarBtn = document.querySelector('.avancar');
    let inputSelecionado = null;
    let idCounter = 0;

    function atualizarNumeracao() {
        // Atualiza a numeração dos assuntos
        const inputGroupsAssunto = document.querySelectorAll('#inputs-assuntos .input-group');
        inputGroupsAssunto.forEach((group, index) => {
            const label = group.querySelector('.numero-assunto');
            if (label) {
                label.textContent = `${index + 1}. `;
            }
        });
    }

    function atualizarTotais() {
        let totalQuestoes = 0;
        let totalPeso = 0;
    
        const inputsQuestoes = document.querySelectorAll('#inputs-questoes input');
        const inputsPeso = document.querySelectorAll('#inputs-peso input');
        
        // Correção: usar índices separados para iterar sobre questões e pesos
        inputsQuestoes.forEach((input, index) => {
            const numQuestoes = parseInt(input.value) || 0;
            totalQuestoes += numQuestoes;
            
            // Verificar se existe um peso correspondente na mesma posição
            if (inputsPeso[index]) {
                const pesoBase = parseFloat(inputsPeso[index].value) || 0.0;
                const pesoParcial = pesoBase * numQuestoes;
                totalPeso += pesoParcial;
            }
        });
    
        totalQuestoesElement.textContent = `Total de questões: ${totalQuestoes}`;
        totalPesoElement.textContent = `Peso total da prova: ${totalPeso.toFixed(1)}`;
    }

    adicionarBtn.addEventListener('click', function() {
        // Verificar limite de assuntos
        if (document.querySelectorAll('#inputs-assuntos .input-group').length >= MAX_ASSUNTOS) {
            mostrarErro(`Não é possível adicionar mais que ${MAX_ASSUNTOS} assuntos.`);
            return;
        }

        const uniqueId = idCounter++;
        const inputGroupAssunto = document.createElement('div');
        inputGroupAssunto.className = 'input-group';
        inputGroupAssunto.dataset.id = uniqueId;

        // Adicionar label de numeração
        const numeroLabel = document.createElement('span');
        numeroLabel.className = 'numero-assunto';
        numeroLabel.textContent = `${document.querySelectorAll('#inputs-assuntos .input-group').length + 1}. `;

        const inputAssunto = document.createElement('input');
        inputAssunto.type = 'text';
        inputAssunto.placeholder = 'Digite o assunto...';

        const selectBtn = document.createElement('button');
        selectBtn.className = 'select-btn';
        selectBtn.textContent = 'Selecionar';

        selectBtn.addEventListener('click', function() {
            document.querySelectorAll('.input-group').forEach(el => {
                el.classList.remove('selected');
            });

            document.querySelectorAll(`.input-group[data-id="${uniqueId}"]`).forEach(el => {
                el.classList.add('selected');
            });

            removerBtn.disabled = false;
            inputSelecionado = uniqueId;
        });

        inputGroupAssunto.appendChild(numeroLabel);
        inputGroupAssunto.appendChild(inputAssunto);
        inputGroupAssunto.appendChild(selectBtn);
        assuntosContainer.appendChild(inputGroupAssunto);

        const inputGroupQuestoes = document.createElement('div');
        inputGroupQuestoes.className = 'input-group';
        inputGroupQuestoes.dataset.id = uniqueId;

        const labelQuestoes = document.createElement('label');
        labelQuestoes.textContent = 'Questões: ';

        const inputQuestoes = document.createElement('input');
        inputQuestoes.type = 'number';
        inputQuestoes.value = '0';
        inputQuestoes.min = '0';
        inputQuestoes.max = MAX_QUESTOES_POR_ASSUNTO.toString();
        inputQuestoes.className = 'input-number';
        inputQuestoes.addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            if (value > MAX_QUESTOES_POR_ASSUNTO) {
                e.target.value = MAX_QUESTOES_POR_ASSUNTO;
                mostrarErro(`Máximo de ${MAX_QUESTOES_POR_ASSUNTO} questões por assunto.`);
            }
            atualizarTotais();
        });
        inputGroupQuestoes.appendChild(labelQuestoes);
        inputGroupQuestoes.appendChild(inputQuestoes);
        questoesContainer.appendChild(inputGroupQuestoes);

        const inputGroupPeso = document.createElement('div');
        inputGroupPeso.className = 'input-group';
        inputGroupPeso.dataset.id = uniqueId;

        const labelPeso = document.createElement('label');
        labelPeso.textContent = 'Peso: ';

        const inputPeso = document.createElement('input');
        inputPeso.type = 'number';
        inputPeso.step = '0.1';
        inputPeso.value = '1.0';
        inputPeso.min = '0';
        inputPeso.className = 'input-number';
        inputPeso.addEventListener('input', atualizarTotais);
        inputGroupPeso.appendChild(labelPeso);
        inputGroupPeso.appendChild(inputPeso);
        pesoContainer.appendChild(inputGroupPeso);

        atualizarTotais();
    });

    removerBtn.addEventListener('click', function() {
        if (inputSelecionado !== null) {
            document.querySelectorAll(`.input-group[data-id="${inputSelecionado}"]`).forEach(el => {
                el.parentNode.removeChild(el);
            });

            inputSelecionado = null;
            removerBtn.disabled = true;
            
            // Atualizar a numeração após remover um item
            atualizarNumeracao();
            atualizarTotais();
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
        const assuntos = document.querySelectorAll('#inputs-assuntos .input-group');
        if (assuntos.length === 0) {
            camposInvalidos.push('Pelo menos um assunto deve ser adicionado');
            return { valido: false, camposInvalidos };
        }

        // Verificar se todos os assuntos estão preenchidos
        const assuntosInputs = document.querySelectorAll('#inputs-assuntos input[type="text"]');
        let assuntosVazios = false;
        assuntosInputs.forEach((input, index) => {
            if (!input.value.trim()) {
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
        const assuntosInputs = document.querySelectorAll('#inputs-assuntos .input-group');
        
        assuntosInputs.forEach((grupo) => {
            const id = grupo.dataset.id;
            const assunto = grupo.querySelector('input[type="text"]').value.trim();
            const questoesInput = document.querySelector(`#inputs-questoes .input-group[data-id="${id}"] input`);
            const pesoInput = document.querySelector(`#inputs-peso .input-group[data-id="${id}"] input`);
            
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
                <h3>Atenção</h3>
                <p>${mensagem}</p>
                <button class="fechar-erro">Fechar</button>
            </div>
        `;
        document.body.appendChild(mensagemErro);

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

    // Adicionar evento de clique ao botão Avançar
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
    });
});