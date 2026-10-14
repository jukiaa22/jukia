const products = [
  {id:1,name:"Camiseta Fora da Caixa",category:"Camiseta",price:79.90,color:"Preto",size:"P, M, G, GG",badge:"MAIS VENDIDA",image:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80",description:"Algodão macio e atitude sem esforço."},
  {id:2,name:"T-shirt Rock Livre",category:"Camiseta",price:89.90,color:"Branco",size:"P, M, G, GG",badge:"NOVA",image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",description:"Um clássico para criar seu próprio uniforme."},
  {id:3,name:"Camiseta Rebel Heart",category:"Edição limitada",price:99.90,color:"Preto",size:"P, M, G",badge:"EDIÇÃO LIMITADA",image:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",description:"Para os dias em que o básico não basta."},
  {id:4,name:"Meias Color Shock",category:"Acessório",price:29.90,color:"Vinho",size:"Único",badge:"PEQUENO DETALHE",image:"https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80",description:"Um toque de cor para o seu look."},
  {id:5,name:"T-shirt Sem Rótulos",category:"Camiseta",price:84.90,color:"Branco",size:"P, M, G, GG",badge:"ESSENCIAL",image:"https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",description:"Conforto, versatilidade e personalidade."},
  {id:6,name:"Óculos Atitude",category:"Acessório",price:59.90,color:"Preto",size:"Único",badge:"LOOK COMPLETO",image:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",description:"O detalhe que muda toda a produção."},
  {id:7,name:"Camiseta Jukia Studio",category:"Edição limitada",price:109.90,color:"Preto",size:"P, M, G, GG",badge:"EXCLUSIVA",image:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",description:"Peça especial para vestir do seu jeito."},
  {id:8,name:"Colar Rock Star",category:"Acessório",price:44.90,color:"Vinho",size:"Único",badge:"DETALHE AUTÊNTICO",image:"https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80",description:"Um acessório com personalidade."}
];

const $ = (selector) => document.querySelector(selector);
const productGrid = $("#productGrid");
const emptyState = $("#emptyState");
const resultsCount = $("#resultsCount");
const cart = new Map();
let activeCategory = "Todos";
let searchTerm = "";
let toastTimer;

const currency = (value) => value.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
function filteredProducts() {
  let list = products.filter(product => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category} ${product.color} ${product.description}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const sort = $("#sortSelect").value;
  if (sort === "price-asc") list.sort((a,b) => a.price-b.price);
  if (sort === "price-desc") list.sort((a,b) => b.price-a.price);
  if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name, "pt-BR"));
  return list;
}
function renderProducts() {
  const list = filteredProducts();
  productGrid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-badge">${product.badge}</span>
        <button class="add-button" data-add="${product.id}" type="button">ADICIONAR À SACOLA +</button>
      </div>
      <div class="product-info">
        <div class="product-meta"><span>${product.category}</span><span>${product.color}</span></div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">${currency(product.price)}</div>
        <p class="product-description">${product.description}</p>
      </div>
    </article>`).join("");
  resultsCount.textContent = `${list.length} ${list.length === 1 ? "peça encontrada" : "peças encontradas"}`;
  emptyState.hidden = list.length > 0;
  productGrid.hidden = list.length === 0;
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function cartCount() {
  let count = 0;
  for (const item of cart.values()) count += item.quantity;
  return count;
}
function addToCart(id) {
  const product = products.find(item => item.id === Number(id));
  if (!product) return;
  const existing = cart.get(product.id);
  if (existing) existing.quantity += 1;
  else cart.set(product.id, {...product, quantity:1});
  renderCart();
  showToast(`${product.name} foi adicionada à sacola.`);
}
function renderCart() {
  const items = [...cart.values()];
  $("#cartCount").textContent = cartCount();
  $("#cartCountModal").textContent = `(${cartCount()})`;
  $("#cartItems").innerHTML = items.length ? items.map(item => `
    <div class="cart-line">
      <img src="${item.image}" alt="">
      <div><h3>${item.name}</h3><p>${currency(item.price)}</p>
        <div class="quantity-control">
          <button type="button" data-quantity="-1" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="1" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <button type="button" class="remove-item" data-remove="${item.id}" aria-label="Remover ${item.name}">×</button>
    </div>`).join("") : `<p class="muted">Sua sacola está vazia. Encontre uma peça com a sua cara.</p>`;
  const total = items.reduce((sum,item) => sum + item.price * item.quantity, 0);
  $("#cartTotal").textContent = currency(total);
}
function setCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".filter-pill").forEach(button => button.classList.toggle("active", button.dataset.filter === category));
  renderProducts();
}
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});
$("#filterPills").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (button) setCategory(button.dataset.filter);
});
document.querySelectorAll("[data-category-link]").forEach(link => link.addEventListener("click", () => setCategory(link.dataset.categoryLink)));
$("#sortSelect").addEventListener("change", renderProducts);
$("#searchToggle").addEventListener("click", () => {
  const panel = $("#searchPanel");
  panel.hidden = !panel.hidden;
  if (!panel.hidden) $("#searchInput").focus();
});
function runSearch() {
  searchTerm = $("#searchInput").value.trim();
  renderProducts();
  $("#catalogo").scrollIntoView({behavior:"smooth"});
}
$("#searchButton").addEventListener("click", runSearch);
$("#searchInput").addEventListener("keydown", event => { if (event.key === "Enter") runSearch(); });
$("#resetSearch").addEventListener("click", () => {
  searchTerm = "";
  $("#searchInput").value = "";
  setCategory("Todos");
});
$("#cartButton").addEventListener("click", () => { $("#modalBackdrop").hidden = false; });
$("#closeModal").addEventListener("click", () => { $("#modalBackdrop").hidden = true; });
$("#modalBackdrop").addEventListener("click", event => { if (event.target === $("#modalBackdrop")) $("#modalBackdrop").hidden = true; });
$("#cartItems").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const id = Number(quantityButton.dataset.id);
    const item = cart.get(id);
    if (item) {
      item.quantity += Number(quantityButton.dataset.quantity);
      if (item.quantity <= 0) cart.delete(id);
      renderCart();
    }
  }
  if (removeButton) { cart.delete(Number(removeButton.dataset.remove)); renderCart(); }
});
$("#checkoutButton").addEventListener("click", () => {
  if (!cart.size) return showToast("Sua sacola está vazia.");
  showToast("Vitrine demonstrativa: conecte um meio de pagamento para receber pedidos.");
});
$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  $("#newsletterMessage").textContent = "Obrigada! O cadastro demonstrativo foi concluído.";
  $("#newsletterEmail").value = "";
});
$("#menuToggle").addEventListener("click", () => {
  const nav = $("#navigation");
  const open = nav.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
  $("#menuToggle").setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});
$("#navigation").querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  $("#navigation").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
}));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") $("#modalBackdrop").hidden = true;
});
$("#currentYear").textContent = new Date().getFullYear();
renderProducts();
renderCart();
