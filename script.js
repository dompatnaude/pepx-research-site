// PEPX store data and cart logic

const PRODUCTS = [
  { id: 1,  name: "GLP-3RT",        price: 80,00, category: "GLPS", bestSeller: true,  img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Earbuds" },
  { id: 2,  name: "Smart Fitness Band",           price: 24.99, category: "Electronics", bestSeller: true,  img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Fitness+Band" },
  { id: 3,  name: "LED Ring Light 10-inch",       price: 19.99, category: "Electronics", bestSeller: false, img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Ring+Light" },
  { id: 4,  name: "Portable Blender Bottle",       price: 22.50, category: "Home",        bestSeller: true,  img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Blender" },
  { id: 5,  name: "Memory Foam Neck Pillow",       price: 17.99, category: "Home",        bestSeller: false, img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Neck+Pillow" },
  { id: 6,  name: "Minimalist Wall Clock",         price: 15.00, category: "Home",        bestSeller: false, img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Wall+Clock" },
  { id: 7,  name: "Adjustable Phone Stand",        price: 12.99, category: "Accessories", bestSeller: true,  img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Phone+Stand" },
  { id: 8,  name: "Magnetic Cable Organizer Set",  price: 9.99,  category: "Accessories", bestSeller: false, img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Cable+Set" },
  { id: 9,  name: "Insulated Travel Mug",          price: 18.99, category: "Accessories", bestSeller: false, img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Travel+Mug" },
  { id: 10, name: "Compact Mini Projector",        price: 59.99, category: "Electronics", bestSeller: true,  img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Projector" },
  { id: 11, name: "Reusable Silicone Food Bags",   price: 14.99, category: "Home",        bestSeller: false, img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Food+Bags" },
  { id: 12, name: "Foldable Laptop Stand",         price: 21.99, category: "Accessories", bestSeller: false, img: "https://placehold.co/300x300/1a1a2e/ffffff?text=Laptop+Stand" }
];

const CART_KEY = "pepx_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart(cart);
  const product = PRODUCTS.find(p => p.id === id);
  if (product) {
    flashMessage(product.name + " added to cart");
  }
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCheckout();
}

function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  countEl.textContent = "(" + total + ")";
}

function flashMessage(text) {
  let el = document.getElementById("flash-msg");
  if (!el) {
    el = document.createElement("div");
    el.id = "flash-msg";
    el.style.position = "fixed";
    el.style.bottom = "24px";
    el.style.right = "24px";
    el.style.background = "#1a1a2e";
    el.style.color = "#fff";
    el.style.padding = "12px 20px";
    el.style.borderRadius = "8px";
    el.style.fontSize = "14px";
    el.style.fontWeight = "600";
    el.style.zIndex = "999";
    el.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.opacity = "1";
  clearTimeout(window.__flashTimeout);
  window.__flashTimeout = setTimeout(() => {
    el.style.transition = "opacity 0.4s";
    el.style.opacity = "0";
  }, 1800);
}

function renderProductGrid(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  list.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML =
      (product.bestSeller ? '<span class="badge">Best Seller</span>' : "") +
      '<img src="' + product.img + '" alt="' + product.name + '">' +
      '<div class="product-info">' +
        "<h3>" + product.name + "</h3>" +
        '<div class="price">$' + product.price.toFixed(2) + "</div>" +
        '<button class="add-cart-btn" data-id="' + product.id + '">Add to Cart</button>' +
      "</div>";
    container.appendChild(card);
  });
  container.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(parseInt(btn.getAttribute("data-id"), 10));
    });
  });
}

function setupFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  if (!filterButtons.length) return;
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-category");
      const filtered = category === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === category);
      renderProductGrid("products-grid", filtered);
    });
  });
}

function getCartSummary() {
  const cart = getCart();
  const lines = [];
  let subtotal = 0;

  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return;
    const lineTotal = product.price * item.qty;
    subtotal += lineTotal;
    lines.push(product.name + " | Qty: " + item.qty + " | $" + product.price.toFixed(2) + " each | $" + lineTotal.toFixed(2) + " total");
  });

  const shipping = subtotal > 0 ? 4.99 : 0;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  return { lines, subtotal, shipping, tax, total };
}

function renderCheckout() {
  const container = document.getElementById("checkout-items");
  const totalsContainer = document.getElementById("checkout-totals");
  if (!container || !totalsContainer) return;

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Your cart is empty. <a href="products.html">Browse products</a> to get started.</p>';
    totalsContainer.innerHTML = "";
    return;
  }

  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return;
    const lineTotal = product.price * item.qty;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML =
      "<div>" +
        '<div class="name">' + product.name + "</div>" +
        '<div class="qty">Qty: ' + item.qty + " x $" + product.price.toFixed(2) + "</div>" +
      "</div>" +
      "<div>$" + lineTotal.toFixed(2) + '</div>';
    container.appendChild(row);
  });

  const summary = getCartSummary();

  totalsContainer.innerHTML =
    '<div class="row"><span>Subtotal</span><span>$' + summary.subtotal.toFixed(2) + "</span></div>" +
    '<div class="row"><span>Shipping</span><span>$' + summary.shipping.toFixed(2) + "</span></div>" +
    '<div class="row"><span>Estimated Tax</span><span>$' + summary.tax.toFixed(2) + "</span></div>" +
    '<div class="row total"><span>Total</span><span>$' + summary.total.toFixed(2) + "</span></div>";
}

function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cart = getCart();
    if (cart.length === 0) {
      flashMessage("Your cart is empty");
      return;
    }

    const summary = getCartSummary();
    const detailsField = document.getElementById("order-details");
    const totalField = document.getElementById("order-total");
    if (detailsField) detailsField.value = summary.lines.join("\n");
    if (totalField) totalField.value = "$" + summary.total.toFixed(2);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.textContent = "Placing Order...";
      submitBtn.disabled = true;
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (response.ok) {
        localStorage.removeItem(CART_KEY);
        updateCartCount();
        document.getElementById("checkout-form-wrap").style.display = "none";
        document.getElementById("order-confirmation").style.display = "block";
      } else {
        flashMessage("Something went wrong submitting your order. Please try again.");
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    } catch (err) {
      flashMessage("Network error. Please try again.");
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  if (document.getElementById("best-sellers-grid")) {
    renderProductGrid("best-sellers-grid", PRODUCTS.filter(p => p.bestSeller));
  }
  if (document.getElementById("products-grid")) {
    renderProductGrid("products-grid", PRODUCTS);
    setupFilters();
  }
  if (document.getElementById("checkout-items")) {
    renderCheckout();
    setupCheckoutForm();
  }
});
