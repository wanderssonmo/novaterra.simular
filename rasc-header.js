// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o aviso de cookies
  initCookieConsent();

  // 🎯 Rolagem suave para links do menu
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 🔍 Lógica básica para o envio da barra de busca
  const searchForm = document.querySelector('#search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = e.target.type?.value;
      const propertyType = e.target['property-type']?.value;
      const location = e.target.location?.value;
      console.log(`Busca: ${type} - ${propertyType} em ${location}`);
      // 🔧 Adicione lógica real de busca aqui
    });
  }
});

// 📤 BOTÃO COMPARTILHAR - HEADER
// Função que aguarda o botão aparecer no DOM
function waitForElement(selector, callback) {
  const el = document.querySelector(selector);
  if (el) {
    callback(el);
  } else {
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        callback(el);
        observer.disconnect(); // para de observar quando encontra
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Aplica a lógica de compartilhamento ao botão quando ele aparecer
waitForElement('#btn-top-compartilhar', (botao) => {
  botao.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nova Terra Adm - Lotes e Chácaras',
          text: 'Simulação oline de forma prática e rápida.',
          url: window.location.href
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      alert('Seu navegador não suporta compartilhamento automático. Copie o link: ' + window.location.href);
    }
  });
});
