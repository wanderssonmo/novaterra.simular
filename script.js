const formatarMoeda = valor => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor);
};

document.getElementById('financiamento-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const valorFinanciado = parseFloat(document.getElementById('valor-financiado').value);
    const entrada = parseFloat(document.getElementById('entrada-input').value);
    const numParcelas = parseInt(document.getElementById('parcelas').value);

    if (isNaN(valorFinanciado) || valorFinanciado <= 0 ||
        isNaN(entrada) || entrada < 0 || entrada >= valorFinanciado ||
        isNaN(numParcelas) || numParcelas <= 0 || numParcelas > 120) {
        alert("Por favor, insira valores válidos. A entrada deve ser menor que o valor financiado.");
        return;
    }

    const restante = valorFinanciado - entrada;
    const parcelasSemJuros = restante / numParcelas;

    const entradaPercentual = (entrada / valorFinanciado) * 100;

    let parcelasComJuros = 0;
    let qtdParcelasSemJuros = Math.min(numParcelas, 50);
    let qtdParcelasComJuros = 0;

    if (numParcelas > 50) {
        qtdParcelasComJuros = numParcelas - 50;
        const juros = 1.5 / 100;
        const fator = Math.pow(1 + juros, qtdParcelasComJuros);
        parcelasComJuros = (restante * (juros * fator)) / (fator - 1);
    }

    document.getElementById('entrada-resultado').textContent = formatarMoeda(entrada);
    document.getElementById('entrada-porcentagem').textContent = entradaPercentual.toFixed(2);

    document.getElementById('parcelas-sem-juros-qtd').textContent = `${qtdParcelasSemJuros}x de `;
    document.getElementById('parcelas-sem-juros').textContent = formatarMoeda(parcelasSemJuros);

    if (numParcelas > 50) {
        document.getElementById('parcelas-com-juros-qtd').textContent = `${qtdParcelasComJuros}x de `;
        document.getElementById('parcelas-com-juros').textContent = formatarMoeda(parcelasComJuros);
    } else {
        document.getElementById('parcelas-com-juros-qtd').textContent = "";
        document.getElementById('parcelas-com-juros').textContent = "Não possui!";
    }

    const totalPago = entrada + (parcelasSemJuros * qtdParcelasSemJuros) + (parcelasComJuros * qtdParcelasComJuros);
    document.getElementById('total-pago').textContent = formatarMoeda(totalPago);

    document.getElementById('resultado').style.display = 'block';
});

document.getElementById('nova-simulacao').addEventListener('click', function() {
    document.getElementById('valor-financiado').value = "";
    document.getElementById('entrada-input').value = "";
    document.getElementById('parcelas').value = "";
    document.getElementById('resultado').style.display = 'none';
});

document.getElementById('compartilhar').addEventListener('click', () => {
    const entrada = document.getElementById('entrada-resultado').textContent;
    const entradaPorc = document.getElementById('entrada-porcentagem').textContent;
    const semJuros = document.getElementById('parcelas-sem-juros-qtd').textContent +
                     document.getElementById('parcelas-sem-juros').textContent;
    const comJuros = document.getElementById('parcelas-com-juros-qtd').textContent +
                     document.getElementById('parcelas-com-juros').textContent;
    const total = document.getElementById('total-pago').textContent;

    const mensagem = `💰 Simulação de Financiamento:%0A
📌 Entrada: ${entrada} (${entradaPorc}%)%0A
📌 Parcelas sem juros: ${semJuros}%0A
📌 Parcelas com juros: ${comJuros}%0A
✅ Total a pagar: ${total}`;

    document.getElementById("share-whatsapp").href = `https://wa.me/?text=${mensagem}`;
    document.getElementById("share-email").href = `mailto:?subject=Simulação de Financiamento&body=${mensagem}`;

    document.getElementById("modal-compartilhar").style.display = "flex";
});

document.getElementById('fechar-modal').addEventListener('click', () => {
    document.getElementById("modal-compartilhar").style.display = "none";
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById("modal-compartilhar");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Botão Compartilhar do Header - abre o mesmo modal
document.getElementById('btn-compartilhar-header').addEventListener('click', () => {
    document.getElementById("modal-compartilhar").style.display = "flex";
});
