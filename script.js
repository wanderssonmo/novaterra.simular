const formatarMoeda = valor => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
};

// 🔹 Função para formatar enquanto digita
function aplicarMascaraMoeda(input) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, "");
    if (valor === "") {
      input.value = "";
      return;
    }
    valor = (parseInt(valor) / 100).toFixed(2);
    valor = valor.replace(".", ",");
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    input.value = valor;
  });
}

// Aplica máscara nos campos de valores
aplicarMascaraMoeda(document.getElementById("valor-financiado"));
aplicarMascaraMoeda(document.getElementById("entrada-input"));

document.getElementById("financiamento-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const valorFinanciado = parseFloat(document.getElementById("valor-financiado").value.replace(/\./g, "").replace(",", ".")) || 0;
  const entrada = parseFloat(document.getElementById("entrada-input").value.replace(/\./g, "").replace(",", ".")) || 0;
  const numParcelas = parseInt(document.getElementById("parcelas").value);

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

  document.getElementById("entrada-resultado").textContent = formatarMoeda(entrada);
  document.getElementById("entrada-porcentagem").textContent = entradaPercentual.toFixed(2);

  document.getElementById("parcelas-sem-juros-qtd").textContent = `${qtdParcelasSemJuros}x de `;
  document.getElementById("parcelas-sem-juros").textContent = formatarMoeda(parcelasSemJuros);

  if (numParcelas > 50) {
    document.getElementById("parcelas-com-juros-qtd").textContent = `${qtdParcelasComJuros}x de `;
    document.getElementById("parcelas-com-juros").textContent = formatarMoeda(parcelasComJuros);
  } else {
    document.getElementById("parcelas-com-juros-qtd").textContent = "";
    document.getElementById("parcelas-com-juros").textContent = "Não possui!";
  }

  const totalPago = entrada + (parcelasSemJuros * qtdParcelasSemJuros) + (parcelasComJuros * qtdParcelasComJuros);
  document.getElementById("total-pago").textContent = formatarMoeda(totalPago);
  document.getElementById("resultado").style.display = "block";

  // 🔹 Exibe botão PDF após simulação
  document.getElementById("share-pdf").style.display = "inline-block";
});

document.getElementById("nova-simulacao").addEventListener("click", function () {
  document.getElementById("valor-financiado").value = "";
  document.getElementById("entrada-input").value = "";
  document.getElementById("parcelas").value = "";
  document.getElementById("resultado").style.display = "none";

  // 🔹 Oculta botão PDF novamente
  document.getElementById("share-pdf").style.display = "none";
});

document.getElementById("compartilhar").addEventListener("click", () => {
  const valorAtualInput = document.getElementById("valor-financiado").value.trim();
  const valorAtual = parseFloat(valorAtualInput.replace(/\./g, "").replace(",", ".")) || 0;
  const valorAtualFormatado = formatarMoeda(valorAtual);

  const entrada = document.getElementById("entrada-resultado").textContent.trim();
  const entradaPorc = document.getElementById("entrada-porcentagem").textContent.trim();
  const semJuros = `${document.getElementById("parcelas-sem-juros-qtd").textContent.trim()}${document.getElementById("parcelas-sem-juros").textContent.trim()}`;
  const comJuros = `${document.getElementById("parcelas-com-juros-qtd").textContent.trim()}${document.getElementById("parcelas-com-juros").textContent.trim()}`;
  const total = document.getElementById("total-pago").textContent.trim();

  let mensagem = `*Simulação de Parcelamento:*\nValor Atual: ${valorAtualFormatado}\n\nEntrada: ${entrada} (${entradaPorc}%)\nParcelas sem juros: ${semJuros}`;

  if (comJuros && comJuros !== "Não possui!") {
    mensagem += `\nParcelas com juros: ${comJuros}`;
  }

  mensagem += `\n\nTotal a pagar: ${total}`;

  const mensagemWhatsApp = encodeURIComponent(mensagem);
  const mensagemEmail = mensagem.replace(/\n/g, "%0A");

  document.getElementById("share-whatsapp").href = `https://wa.me/?text=${mensagemWhatsApp}`;
  document.getElementById("share-email").href = `mailto:?subject=Simulação de Parcelamento&body=${mensagemEmail}`;

  document.getElementById("modal-compartilhar").style.display = "flex";
});

// 🔹 Exportar PDF
document.getElementById("share-pdf").addEventListener("click", () => {
  const elemento = document.getElementById("resultado");

  if (!elemento || elemento.style.display === "none") {
    alert("Por favor, faça a simulação antes de salvar em PDF.");
    return;
  }

  const agora = new Date();
  const dataHora = agora.toLocaleString("pt-BR");

  const opt = {
    margin: 10,
    filename: `simulacao-${agora.getTime()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().from(elemento).set(opt).toPdf().get("pdf").then((pdf) => {
    const totalPaginas = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= totalPaginas; i++) {
      pdf.setPage(i);

      pdf.setFontSize(20);
      pdf.setTextColor(200, 200, 200);
      pdf.setFont("helvetica", "bold");

      for (let y = 40; y < 297; y += 50) {
        pdf.text("Nova Terra - https://novaterra-simular.vercel.app", 30, y, { angle: 30 });
      }

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em: ${dataHora}`, 10, 290);
    }
  }).save();
});

document.getElementById("fechar-modal").addEventListener("click", () => {
  document.getElementById("modal-compartilhar").style.display = "none";
});

window.addEventListener("click", (event) => {
  const modal = document.getElementById("modal-compartilhar");
  if (event.target === modal) modal.style.display = "none";
});

document.getElementById("btn-compartilhar-header").addEventListener("click", () => {
  document.getElementById("modal-compartilhar").style.display = "flex";
});
