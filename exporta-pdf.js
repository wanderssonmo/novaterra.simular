/**
 * Inicializa a funcionalidade de exportação de PDF quando o DOM estiver carregado.
 */
document.addEventListener("DOMContentLoaded", () => {
  const btnExportar = document.getElementById("btn-exportar-pdf");
  if (!btnExportar) {
    console.error("Botão de exportação não encontrado.");
    return;
  }

  btnExportar.addEventListener("click", generatePDF);
});

/**
 * Configurações do PDF
 */
const PDF_CONFIG = {
  filename: `simulacao-novaterra-${new Date().toISOString().slice(0, 10)}.pdf`,
  margin: [10, 10, 10, 10],
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 3, useCORS: true, logging: true },
  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  labels: {
    title: "Simulação de Parcelamento",
    entrada: "Entrada",
    valorAtual: "Valor do terreno",
    parcelas: "Parcelas",
    total: "Total do parcelamento",
    valor: "Valor",
    porcentagem: "Porcentagem",
    semJuros: "Sem juros",
    comJuros: "Com juros (1,5%)",
    totalPagar: "Total a pagar",
  },
};

/**
 * Sanitiza uma string para evitar XSS, mantendo caracteres especiais.
 * @param {string} str - String a ser sanitizada.
 * @returns {string} String sanitizada.
 */
const sanitizeString = (str) => {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

/**
 * Coleta valores dos elementos do DOM.
 * @returns {Object|null} Objeto com valores ou null se inválido.
 */
const collectFormData = () => {
  const elements = {
    valorAtual: document.getElementById("valor-financiado"),
    entrada: document.getElementById("entrada-resultado"),
    entradaPorc: document.getElementById("entrada-porcentagem"),
    semJurosQtd: document.getElementById("parcelas-sem-juros-qtd"),
    semJurosVal: document.getElementById("parcelas-sem-juros"),
    comJurosQtd: document.getElementById("parcelas-com-juros-qtd"),
    comJurosVal: document.getElementById("parcelas-com-juros"),
    total: document.getElementById("total-pago"),
  };

  const missingElements = Object.entries(elements)
    .filter(([key, el]) => !el)
    .map(([key]) => key);
  if (missingElements.length > 0) {
    console.error(`Elementos do DOM não encontrados: ${missingElements.join(", ")}`);
    showNotification("Erro: Alguns dados da simulação não foram encontrados.", "error");
    return null;
  }

  const data = {
    valorAtual: sanitizeString(elements.valorAtual.value.trim()),
    entrada: sanitizeString(elements.entrada.textContent.trim()),
    entradaPorc: sanitizeString(elements.entradaPorc.textContent.trim()),
    semJurosQtd: sanitizeString(elements.semJurosQtd.textContent.trim()),
    semJurosVal: sanitizeString(elements.semJurosVal.textContent.trim()),
    comJurosQtd: sanitizeString(elements.comJurosQtd.textContent.trim()),
    comJurosVal: sanitizeString(elements.comJurosVal.textContent.trim()),
    total: sanitizeString(elements.total.textContent.trim()),
  };

  if (!data.entrada || !data.valorAtual) {
    showNotification("Por favor, faça uma simulação e preencha o valor atual antes de exportar o PDF.", "error");
    return null;
  }

  return data;
};

/**
 * Formata valor numérico para moeda brasileira (R$).
 */
const formatarMoedaBR = (valor) => {
  if (!valor) return "R$ 0,00";
  const valorSemPontos = valor.replace(/\./g, "");
  const valorComPonto = valorSemPontos.replace(/,/g, ".");
  const numero = parseFloat(valorComPonto);
  if (isNaN(numero)) return "R$ 0,00";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

/**
 * Gera o HTML para o PDF.
 */
const generatePDFHtml = (data) => {
  const { labels } = PDF_CONFIG;
  const valorAtualFormatado = formatarMoedaBR(data.valorAtual);

  const html = `
    <div style="width: 190mm; min-height: 287mm; background: #fff; font-family: 'Montserrat', Arial, sans-serif; padding: 20px; box-sizing: border-box; position: relative;">
      <style>
        h2 {
          text-align: center;
          color: #1a1a1a;
          margin-bottom: 30px;
          font-weight: 600;
        }
        .section {
          border: 1px solid #ccc;
          padding: 10px;
          margin-top: 20px;
          border-radius: 8px;
          background: #f9f9f9;
        }
        .section.total {
          background: #f9f9f9;
          border: 1px solid #f70d054d;
        }
        h3 {
          margin-bottom: 5px;
          font-weight: 500;
        }
        p {
          margin: 5px 0;
          font-size: 14px;
        }
        .valor-atual {
          background: #f9f9f9;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 10px;
          border: 1px solid #f70d054d;
        }
        .watermark {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.07;
          background-image: url('imagens/marca-agua.png');
          background-repeat: repeat;
          background-size: 80px 80px; /* tamanho da marca d'água */
          z-index: 0;
        }
        footer {
          position: fixed;
          bottom: 5mm;
          left: 0;
          width: 100%;
          font-size: 10px;
          text-align: center;
          color: #555;
        }
      </style>
      
      <!-- Marca d'água em mosaico -->
      <div class="watermark"></div>

      <div style="position: relative; z-index: 1;">
        <h2>${labels.title}</h2>

        <div class="valor-atual">
          <h3><strong>${labels.valorAtual}:</strong> ${valorAtualFormatado}</h3>
        </div>

        <div class="section">
          <h3>${labels.entrada}</h3>
          <p><strong>${labels.valor}:</strong> ${data.entrada}</p>
          <p><strong>${labels.porcentagem}:</strong> ${data.entradaPorc}%</p>
        </div>

        <div class="section">
          <h3>${labels.parcelas}</h3>
          <p><strong>${labels.semJuros}:</strong> ${data.semJurosQtd} ${data.semJurosVal}</p>
          <p><strong>${labels.comJuros}:</strong> ${data.comJurosQtd ? `${data.comJurosQtd} ${data.comJurosVal}` : data.comJurosVal}</p>
        </div>

        <div class="section total">
          <h3>${labels.total}</h3>
          <p><strong>${labels.totalPagar}:</strong> ${data.total}</p>
        </div>
      </div>

      <footer stily="width: 0.7rem;">
        <p>Gerado em ${new Date().toLocaleString("pt-BR")} — <a href="https://novaterra-simular.vercel.app" target="_blank">novaterra-simular.vercel.app</a></p>
      </footer>
    </div>
  `;

  return html;
};


/**
 * Exibe uma notificação ao usuário.
 */
const showNotification = (message, type = "info") => {
  console.log(`[${type.toUpperCase()}] ${message}`);
  alert(message); // Sugestão: trocar por Toastify ou SweetAlert2
};

/**
 * Gera e exporta o PDF.
 */
const generatePDF = async () => {
  try {
    const data = collectFormData();
    if (!data) return;

    const html = generatePDFHtml(data);

    await html2pdf()
      .set(PDF_CONFIG)
      .from(html)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const blobUrl = pdf.output("bloburl");
        window.open(blobUrl, "_blank");
        pdf.save(PDF_CONFIG.filename);
        showNotification("PDF gerado com sucesso!", "success");
      });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    showNotification("Ocorreu um erro ao gerar o PDF. Tente novamente.", "error");
  }
};
