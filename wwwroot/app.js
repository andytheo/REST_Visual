const grid = document.getElementById('productGrid');
const dialog = document.getElementById('productDialog');
const dialogContent = document.getElementById('dialogContent');
const closeDialog = document.getElementById('closeDialog');

async function loadProducts() {
  const response = await fetch('/api/products');
  const products = await response.json();

  grid.innerHTML = products.map(product => `
    <article class="product-card" data-id="${product.id}" tabindex="0" role="button" aria-label="View ${product.name}">
      <div class="product-image-wrap">
        <img src="${product.imageUrl}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="product-content">
        <div class="product-meta">
          <span class="product-category">${product.category}</span>
          <span class="product-price">$${product.price.toFixed(2)}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="photo-credit">Photo by <a href="${product.photographerUrl}" target="_blank" rel="noreferrer">${product.photographer}</a> on <a href="${product.photoUrl}" target="_blank" rel="noreferrer">Unsplash</a></div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => showProduct(card.dataset.id));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showProduct(card.dataset.id);
      }
    });
  });
}

async function showProduct(id) {
  dialogContent.innerHTML = '<div class="dialog-copy"><p>Loading product…</p></div>';
  dialog.showModal();

  const response = await fetch(`/api/products/${id}`, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    dialogContent.innerHTML = `<div class="dialog-copy"><p class="eyebrow">API response</p><h3>${response.status} ${response.statusText}</h3><div class="api-result">GET /api/products/${id}</div></div>`;
    return;
  }

  const product = await response.json();
  dialogContent.innerHTML = `
    <div class="dialog-layout">
      <img src="${product.imageUrl}" alt="${product.name}" />
      <div class="dialog-copy">
        <p class="eyebrow">${product.category}</p>
        <h3>${product.name}</h3>
        <div class="price">$${product.price.toFixed(2)}</div>
        <p>${product.description}</p>
        <div class="api-result">GET /api/products/${product.id}<br><strong>${response.status} ${response.statusText}</strong><br>Content-Type: ${response.headers.get('content-type') ?? 'application/json'}</div>
        <div class="photo-credit">Photo by <a href="${product.photographerUrl}" target="_blank" rel="noreferrer">${product.photographer}</a> on <a href="${product.photoUrl}" target="_blank" rel="noreferrer">Unsplash</a></div>
      </div>
    </div>`;
}

closeDialog.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});

loadProducts().catch(error => {
  grid.innerHTML = `<p>Could not load products. ${error.message}</p>`;
});
