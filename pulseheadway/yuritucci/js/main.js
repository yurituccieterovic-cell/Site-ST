
```javascript
document.addEventListener('DOMContentLoaded', function() {
  const filtros = document.querySelectorAll('.filtro-btn');
  const cards = document.querySelectorAll('.card-jornal');

  filtros.forEach(btn => {
    btn.addEventListener('click', function() {
      filtros.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const category = this.dataset.category;

      cards.forEach(card => {
        if (category === 'todas' || card.dataset.category === category) {
          card.style.display = 'block';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s';
            card.style.opacity = '1';
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const searchInput = document.getElementById('pesquisa');

  searchInput.addEventListener('input', debounce(function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    cards.forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      const excerpt = card.querySelector('.resumo').textContent.toLowerCase();

      if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }, 300));

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```
