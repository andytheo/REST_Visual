const grid = document.getElementById('productGrid');
const dialog = document.getElementById('productDialog');
const dialogContent = document.getElementById('dialogContent');
const closeDialog = document.getElementById('closeDialog');
const cartButton = document.getElementById('cartButton');
const cartCount = document.getElementById('cartCount');
const checkoutDialog = document.getElementById('checkoutDialog');
const checkoutContent = document.getElementById('checkoutContent');
const closeCheckout = document.getElementById('closeCheckout');

const cart = [];

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
        <button class="primary-button add-cart-button" id="addToCart">Add to cart</button>
        <div class="api-result">GET /api/products/${product.id}<br><strong>${response.status} ${response.statusText}</strong><br>Content-Type: ${response.headers.get('content-type') ?? 'application/json'}</div>
        <div class="photo-credit">Photo by <a href="${product.photographerUrl}" target="_blank" rel="noreferrer">${product.photographer}</a> on <a href="${product.photoUrl}" target="_blank" rel="noreferrer">Unsplash</a></div>
      </div>
    </div>`;

  document.getElementById('addToCart').addEventListener('click', () => addToCart(product));
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartCount();
  dialog.close();
  openCheckout();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = count;
  cartButton.classList.toggle('has-items', count > 0);
}

function getCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function openCheckout() {
  const total = getCartTotal();

  if (cart.length === 0) {
    checkoutContent.innerHTML = `
      <div class="checkout-empty">
        <p class="eyebrow">Your cart</p>
        <h3>Your cart is empty</h3>
        <p>Add a gadget before checking out.</p>
      </div>`;
    checkoutDialog.showModal();
    return;
  }

  checkoutContent.innerHTML = `
    <div class="checkout-shell">
      <p class="eyebrow">Checkout</p>
      <h3>Complete your order</h3>

      <div class="checkout-items">
        ${cart.map(item => `
          <div class="checkout-item">
            <img src="${item.imageUrl}" alt="${item.name}" />
            <div>
              <strong>${item.name}</strong>
              <span>Qty ${item.quantity}</span>
            </div>
            <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        `).join('')}
      </div>

      <div class="checkout-total">
        <span>Total</span>
        <strong>$${total.toFixed(2)}</strong>
      </div>

      <div class="payment-option selected">
        <div class="paypal-wordmark">PayPal</div>
        <div>
          <strong>PayPal</strong>
          <span>Simulated payment for this demo</span>
        </div>
        <span class="payment-check">✓</span>
      </div>

      <button class="paypal-button" id="payNow">Pay $${total.toFixed(2)} with PayPal</button>
      <p class="demo-note">Demo only — no real payment or PayPal account is used.</p>
    </div>`;

  document.getElementById('payNow').addEventListener('click', payWithPayPal);
  checkoutDialog.showModal();
}

async function payWithPayPal() {
  const payButton = document.getElementById('payNow');
  payButton.disabled = true;
  payButton.textContent = 'Processing…';

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Checkout failed.');
    }

    checkoutContent.innerHTML = `
      <div class="payment-success">
        <div class="success-icon">✓</div>
        <p class="eyebrow">Payment successful</p>
        <h3>Order complete</h3>
        <p><strong>$${result.total.toFixed(2)}</strong> paid with ${result.provider}.</p>
        <div class="transaction-card">
          <span>Demo transaction</span>
          <code>${result.transactionId}</code>
        </div>
        <p class="demo-note">This is a simulated payment created for the Dependency Injection demo. No money was transferred.</p>
        <button class="primary-button" id="doneButton">Done</button>
      </div>`;

    cart.splice(0, cart.length);
    updateCartCount();
    document.getElementById('doneButton').addEventListener('click', () => checkoutDialog.close());
  } catch (error) {
    payButton.disabled = false;
    payButton.textContent = 'Try payment again';
    const note = checkoutContent.querySelector('.demo-note');
    note.textContent = error.message;
  }
}

cartButton.addEventListener('click', openCheckout);
closeDialog.addEventListener('click', () => dialog.close());
closeCheckout.addEventListener('click', () => checkoutDialog.close());

dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
checkoutDialog.addEventListener('click', event => {
  if (event.target === checkoutDialog) checkoutDialog.close();
});

loadProducts().catch(error => {
  grid.innerHTML = `<p>Could not load products. ${error.message}</p>`;
});
