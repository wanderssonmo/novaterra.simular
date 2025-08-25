const formatarMoeda = valor => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
};

// 🔹 Função para formatar enquanto digita
function aplicarMascaraMoeda(input) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, ""); // mantém só números
    if (valor === "") {
      input.value = "";
      return;
    }
    valor = (parseInt(valor) / 100).toFixed(2); // adiciona casas decimais
    valor = valor.replace(".", ","); // vírgula nos centavos
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // pontos de milhar
    input.value = valor;
  });
}

// aplica máscara nos campos de valores
aplicarMascaraMoeda(document.getElementById("valor-financiado"));
aplicarMascaraMoeda(document.getElementById("entrada-input"));

document.getElementById('financiamento-form').addEventListener('submit', function(event) {
  event.preventDefault();

  // 🔹 Convertendo valores formatados de volta para número
  const valorFinanciado = parseFloat(document.getElementById('valor-financiado').value.replace(/\./g, "").replace(",", "."));
  const entrada = parseFloat(document.getElementById('entrada-input').value.replace(/\./g, "").replace(",", "."));
  const numParcelas = parseInt(document.getElementById('parcelas').value);

  if (isNaN(valorFinanciado) || valorFinanciado <= 0 || 
      isNaN(entrada) || entrada < 0 || entrada >= valorFinanciado || 
      isNaN(numParcelas) || numParcelas <= 0 || numParcelas > 420) {
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

//
document.getElementById('compartilhar').addEventListener('click', () => {
  // 🔹 Captura e trata o valor atual
  const valorAtualInput = document.getElementById('valor-financiado').value.trim();
  const valorAtual = parseFloat(valorAtualInput.replace(/\./g, "").replace(",", ".")) || 0;

  // 🔹 Formata para BRL (R$ 10.000,00)
  const valorAtualFormatado = formatarMoeda(valorAtual);

  // 🔹 Captura dados da simulação
  const entrada = document.getElementById('entrada-resultado').textContent.trim();
  const entradaPorc = document.getElementById('entrada-porcentagem').textContent.trim();
  const semJuros = `${document.getElementById('parcelas-sem-juros-qtd').textContent.trim()} ${document.getElementById('parcelas-sem-juros').textContent.trim()}`;
  const comJuros = `${document.getElementById('parcelas-com-juros-qtd').textContent.trim()} ${document.getElementById('parcelas-com-juros').textContent.trim()}`;
  const total = document.getElementById('total-pago').textContent.trim();

  // 🔹 Monta mensagem com \n (apenas)
  let mensagem = ` Simulação de Parcelamento:\n💲 Valor Atual: ${valorAtualFormatado}\n\n📥 Entrada: ${entrada} (${entradaPorc}%)\n➡️ Parcelas sem juros: ${semJuros}`;

  if (comJuros && comJuros !== "Não possui!") {
    mensagem += `\n➡️ Parcelas com juros: ${comJuros}`;
  }

  mensagem += `\n\n✅ Total a pagar: ${total}`;

  // mensagem += `\n\n📑 Esta simulação foi gerada através do portal oficial da Nova Terra.\n👉 Acesse aqui: https://novaterra-simular.vercel.app/`;

  // 🔹 Codifica para WhatsApp (mantém emojis intactos)
  const mensagemWhatsApp = encodeURIComponent(mensagem);

  // 🔹 Email: substitui apenas quebras de linha por %0A (mais legível no corpo)
  const mensagemEmail = mensagem.replace(/\n/g, "%0A");

  // 🔹 Define os links
  document.getElementById("share-whatsapp").href = `https://wa.me/?text=${mensagemWhatsApp}`;
  document.getElementById("share-email").href = `mailto:?subject=Simulação de Parcelamento&body=${mensagemEmail}`;

  // 🔹 Exibe modal de compartilhamento
  document.getElementById("modal-compartilhar").style.display = "flex";
});

//


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
