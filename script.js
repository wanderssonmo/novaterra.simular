// =============================
// 🔹 Funções Utilitárias
// =============================

// Formata valores em BRL (ex: R$ 1.500,00)
const formatarMoeda = valor => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
};

// Aplica máscara monetária em tempo real no input
function aplicarMascaraMoeda(input) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, ""); // mantém só números

    if (valor === "") {
      input.value = "";
      return;
    }

    valor = (parseInt(valor) / 100).toFixed(2);   // casas decimais
    valor = valor.replace(".", ",");              // vírgula nos centavos
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // pontos de milhar

    input.value = valor;
  });
}

// =============================
// 🔹 Aplicação da máscara nos campos
// =============================
aplicarMascaraMoeda(document.getElementById("valor-financiado"));
aplicarMascaraMoeda(document.getElementById("entrada-input"));

// =============================
// 🔹 Lógica principal do formulário
// =============================
document.getElementById('financiamento-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const valorFinanciado = parseFloat(document.getElementById('valor-financiado').value.replace(/\./g, "").replace(",", "."));
  const entrada = parseFloat(document.getElementById('entrada-input').value.replace(/\./g, "").replace(",", "."));
  const numParcelas = parseInt(document.getElementById('parcelas').value);

  if (isNaN(valorFinanciado) || valorFinanciado <= 0 || 
      isNaN(entrada) || entrada < 0 || entrada >= valorFinanciado || 
      isNaN(numParcelas) || numParcelas <= 0 || numParcelas > 420) {
    alert("Por favor, insira valores válidos. A entrada deve ser menor que o valor financiado.");
    return;
  }

  // =============================
  // 🔹 NOVA LÓGICA DE CÁLCULO (com arredondamento por parcela)
  // =============================

  // Função local de arredondamento para 2 casas
  const arredondar = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

  // 1. Restante após a entrada
  const restante = valorFinanciado - entrada;

  // 2. Parcela sem juros (dividindo pelo total de parcelas)
  //    OBS: dividimos pelo total de parcelas conforme sua regra
  const parcelaSemJuros = arredondar(restante / numParcelas);

  // 3. Total pago nas 50 primeiras parcelas sem juros (ou menos, se numParcelas < 50)
  const qtdParcelasSemJuros = Math.min(numParcelas, 50);
  const totalParcelasSemJuros = arredondar(parcelaSemJuros * qtdParcelasSemJuros);

  // 4. Saldo restante que será pago com juros
  let saldoComJuros = restante - totalParcelasSemJuros;
  // Evita saldo negativo por conta de arredondamento
  if (saldoComJuros < 0) saldoComJuros = 0;

  // 5. Parcelas com juros (PRICE) — sobre o saldoComJuros e quantidade acima de 50
  const qtdParcelasComJuros = numParcelas - qtdParcelasSemJuros;
  let parcelaComJuros = 0;
  let totalParcelasComJuros = 0;

  if (qtdParcelasComJuros > 0 && saldoComJuros > 0) {
    const juros = 0.015; // 1,5% ao mês
    const fator = Math.pow(1 + juros, qtdParcelasComJuros);
    const parcelaComJurosRaw = (saldoComJuros * (juros * fator)) / (fator - 1);
    parcelaComJuros = arredondar(parcelaComJurosRaw);
    totalParcelasComJuros = arredondar(parcelaComJuros * qtdParcelasComJuros);
  } else {
    // não há parcelas com juros
    parcelaComJuros = 0;
    totalParcelasComJuros = 0;
  }

  // 6. Percentual de entrada
  const entradaPercentual = (entrada / valorFinanciado) * 100;

  // 7. Total geral — calculado a partir da soma das parcelas arredondadas + entrada
  const totalPago = arredondar(entrada + totalParcelasSemJuros + totalParcelasComJuros);

  // =============================
  // 🔹 Atualização do DOM
  // =============================
  document.getElementById('entrada-resultado').textContent = formatarMoeda(entrada);
  document.getElementById('entrada-porcentagem').textContent = entradaPercentual.toFixed(2);

  document.getElementById('parcelas-sem-juros-qtd').textContent = `${qtdParcelasSemJuros}x de `;
  document.getElementById('parcelas-sem-juros').textContent = formatarMoeda(parcelaSemJuros);

  if (qtdParcelasComJuros > 0 && parcelaComJuros > 0) {
    document.getElementById('parcelas-com-juros-qtd').textContent = `${qtdParcelasComJuros}x de `;
    document.getElementById('parcelas-com-juros').textContent = formatarMoeda(parcelaComJuros);
  } else {
    document.getElementById('parcelas-com-juros-qtd').textContent = "";
    document.getElementById('parcelas-com-juros').textContent = "Não possui!";
  }

  document.getElementById('total-pago').textContent = formatarMoeda(totalPago);

  document.getElementById('resultado').style.display = 'block';
});

// =============================
// 🔹 Botão Nova Simulação
// =============================
document.getElementById('nova-simulacao').addEventListener('click', function() {
  document.getElementById('valor-financiado').value = "";
  document.getElementById('entrada-input').value = "";
  document.getElementById('parcelas').value = "";
  document.getElementById('resultado').style.display = 'none';
});

// =============================
// 🔹 Compartilhamento (WhatsApp / Email)
// =============================
document.getElementById('compartilhar').addEventListener('click', () => {
  const valorAtualInput = document.getElementById('valor-financiado').value.trim();
  const valorAtual = parseFloat(valorAtualInput.replace(/\./g, "").replace(",", ".")) || 0;
  const valorAtualFormatado = formatarMoeda(valorAtual);

  const entrada = document.getElementById('entrada-resultado').textContent.trim();
  const entradaPorc = document.getElementById('entrada-porcentagem').textContent.trim();
  const semJuros = `${document.getElementById('parcelas-sem-juros-qtd').textContent.trim()} ${document.getElementById('parcelas-sem-juros').textContent.trim()}`;
  const comJuros = `${document.getElementById('parcelas-com-juros-qtd').textContent.trim()} ${document.getElementById('parcelas-com-juros').textContent.trim()}`;
  const total = document.getElementById('total-pago').textContent.trim();

  let mensagem = `*Simulação de Parcelamento:*\n\n*Valor do terreno:* ${valorAtualFormatado}\n*Entrada:* ${entrada} (${entradaPorc}%)\n*Parcelas sem juros:* ${semJuros}`;

  if (comJuros && comJuros !== "Não possui!") {
    mensagem += `\n*Parcelas com juros:* ${comJuros}`;
  }

  mensagem += `\n\n*Total a pagar:* ${total}`;

  const mensagemWhatsApp = encodeURIComponent(mensagem);
  const mensagemEmail = mensagem.replace(/\n/g, "%0A");

  document.getElementById("share-whatsapp").href = `https://wa.me/?text=${mensagemWhatsApp}`;
  document.getElementById("share-email").href = `mailto:?subject=Simulação de Parcelamento&body=${mensagemEmail}`;

  document.getElementById("modal-compartilhar").style.display = "flex";
});

// =============================
// 🔹 Modal Compartilhamento
// =============================
document.getElementById('fechar-modal').addEventListener('click', () => {
  document.getElementById("modal-compartilhar").style.display = "none";
});

window.addEventListener('click', (event) => {
  const modal = document.getElementById("modal-compartilhar");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

document.getElementById('btn-compartilhar-header').addEventListener('click', () => {
  document.getElementById("modal-compartilhar").style.display = "flex";
});
