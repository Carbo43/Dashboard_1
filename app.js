// Data Storage
let appData = {
  pizzas: [
    {
      id: 1,
      name: "Margherita",
      price: 8.50,
      category: "Classica",
      ingredients: ["pomodoro", "mozzarella", "basilico"],
      description: "La classica pizza italiana con pomodoro, mozzarella e basilico fresco",
      image: "🍕"
    },
    {
      id: 2,
      name: "Marinara",
      price: 7.00,
      category: "Classica", 
      ingredients: ["pomodoro", "aglio", "origano"],
      description: "Pizza semplice con pomodoro, aglio e origano",
      image: "🍕"
    },
    {
      id: 3,
      name: "Quattro Stagioni",
      price: 12.00,
      category: "Classica",
      ingredients: ["pomodoro", "mozzarella", "prosciutto", "funghi", "carciofi", "olive"],
      description: "Quattro spicchi con ingredienti diversi per ogni stagione",
      image: "🍕"
    },
    {
      id: 4,
      name: "Diavola",
      price: 10.50,
      category: "Classica",
      ingredients: ["pomodoro", "mozzarella", "salame piccante"],
      description: "Pizza piccante con salame piccante",
      image: "🍕"
    },
    {
      id: 5,
      name: "Vegetariana",
      price: 11.00,
      category: "Vegana",
      ingredients: ["pomodoro", "mozzarella", "zucchine", "melanzane", "peperoni"],
      description: "Pizza ricca di verdure fresche",
      image: "🍕"
    },
    {
      id: 6,
      name: "Bufala e Crudo",
      price: 15.00,
      category: "Gourmet",
      ingredients: ["pomodoro", "mozzarella di bufala", "prosciutto crudo", "rucola"],
      description: "Pizza gourmet con mozzarella di bufala e prosciutto crudo",
      image: "🍕"
    }
  ],
  orders: [
    {
      id: 1001,
      customer: "Mario Rossi",
      phone: "335-1234567",
      address: "Via Roma 123, Milano",
      items: [
        {pizzaId: 1, quantity: 2, name: "Margherita"},
        {pizzaId: 4, quantity: 1, name: "Diavola"}
      ],
      total: 27.50,
      status: "In preparazione",
      orderTime: "2025-10-02T19:15:00",
      driver: null
    },
    {
      id: 1002,
      customer: "Anna Bianchi", 
      phone: "338-9876543",
      address: "Corso Buenos Aires 45, Milano",
      items: [
        {pizzaId: 6, quantity: 1, name: "Bufala e Crudo"},
        {pizzaId: 5, quantity: 1, name: "Vegetariana"}
      ],
      total: 26.00,
      status: "Ricevuto",
      orderTime: "2025-10-02T19:30:00",
      driver: null
    },
    {
      id: 1003,
      customer: "Luca Verdi",
      phone: "347-5551234", 
      address: "Via Montenapoleone 12, Milano",
      items: [
        {pizzaId: 3, quantity: 1, name: "Quattro Stagioni"}
      ],
      total: 12.00,
      status: "In consegna",
      orderTime: "2025-10-02T18:45:00",
      driver: "Giuseppe"
    },
    {
      id: 1004,
      customer: "Sara Neri",
      phone: "320-7778888",
      address: "Piazza Duomo 1, Milano", 
      items: [
        {pizzaId: 1, quantity: 3, name: "Margherita"},
        {pizzaId: 2, quantity: 2, name: "Marinara"}
      ],
      total: 39.50,
      status: "Pronto",
      orderTime: "2025-10-02T19:00:00",
      driver: null
    }
  ],
  drivers: [
    {id: 1, name: "Giuseppe", status: "occupato", currentOrder: 1003},
    {id: 2, name: "Antonio", status: "disponibile", currentOrder: null},
    {id: 3, name: "Francesco", status: "disponibile", currentOrder: null},
    {id: 4, name: "Roberto", status: "non disponibile", currentOrder: null}
  ],
  stats: {
    todayOrders: 15,
    todayRevenue: 387.50,
    pendingOrders: 3,
    topPizza: "Margherita"
  }
};

let currentEditingPizza = null;
let salesChart = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  setupNavigation();
  setupModals();
  setupFilters();
  updateCurrentTime();
  loadDashboard();
  
  // Update time every minute
  setInterval(updateCurrentTime, 60000);
});

// Time Update
function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById('currentTime').textContent = timeString;
}

// Navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.dataset.page;
      
      // Update active nav link
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Show target page
      showPage(targetPage);
    });
  });
}

function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
    
    // Load page content
    switch(pageId) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'menu':
        loadMenu();
        break;
      case 'orders':
        loadOrders();
        break;
      case 'deliveries':
        loadDeliveries();
        break;
    }
  }
}

// Dashboard
function loadDashboard() {
  updateStats();
  loadSalesChart();
  loadRecentOrders();
}

function updateStats() {
  const stats = calculateStats();
  
  document.getElementById('todayOrders').textContent = stats.todayOrders;
  document.getElementById('todayRevenue').textContent = `€${stats.todayRevenue.toFixed(2)}`;
  document.getElementById('pendingOrders').textContent = stats.pendingOrders;
  document.getElementById('topPizza').textContent = stats.topPizza;
}

function calculateStats() {
  const today = new Date().toDateString();
  const todayOrders = appData.orders.filter(order => 
    new Date(order.orderTime).toDateString() === today
  );
  
  const pendingStatuses = ['Ricevuto', 'In preparazione', 'Pronto', 'In consegna'];
  const pendingOrders = appData.orders.filter(order => 
    pendingStatuses.includes(order.status)
  );
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Calculate top pizza
  const pizzaCount = {};
  appData.orders.forEach(order => {
    order.items.forEach(item => {
      pizzaCount[item.name] = (pizzaCount[item.name] || 0) + item.quantity;
    });
  });
  
  const topPizza = Object.keys(pizzaCount).reduce((a, b) => 
    pizzaCount[a] > pizzaCount[b] ? a : b
  ) || 'Margherita';
  
  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    pendingOrders: pendingOrders.length,
    topPizza
  };
}

function loadSalesChart() {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;
  
  // Calculate pizza sales data
  const pizzaSales = {};
  appData.orders.forEach(order => {
    order.items.forEach(item => {
      pizzaSales[item.name] = (pizzaSales[item.name] || 0) + item.quantity;
    });
  });
  
  const labels = Object.keys(pizzaSales);
  const data = Object.values(pizzaSales);
  
  if (salesChart) {
    salesChart.destroy();
  }
  
  salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pizze Vendute',
        data: data,
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
        borderWidth: 0,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function loadRecentOrders() {
  const container = document.getElementById('recentOrdersList');
  if (!container) return;
  
  const recentOrders = appData.orders
    .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
    .slice(0, 5);
  
  container.innerHTML = recentOrders.map(order => `
    <div class="recent-order">
      <div class="recent-order-info">
        <div class="recent-order-customer">${order.customer}</div>
        <div class="recent-order-details">
          ${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
        </div>
      </div>
      <div class="recent-order-total">€${order.total.toFixed(2)}</div>
      <div class="status status--${getStatusClass(order.status)}">${order.status}</div>
    </div>
  `).join('');
}

function getStatusClass(status) {
  switch(status) {
    case 'Consegnato': return 'success';
    case 'In consegna': return 'info';
    case 'Pronto': return 'success';
    case 'In preparazione': return 'warning';
    case 'Ricevuto': return 'info';
    default: return 'info';
  }
}

// Menu Management
function loadMenu() {
  renderPizzaList();
}

function renderPizzaList() {
  const container = document.getElementById('pizzaList');
  if (!container) return;
  
  let filteredPizzas = appData.pizzas;
  
  // Apply search filter
  const searchTerm = document.getElementById('menuSearch')?.value.toLowerCase() || '';
  if (searchTerm) {
    filteredPizzas = filteredPizzas.filter(pizza => 
      pizza.name.toLowerCase().includes(searchTerm) ||
      pizza.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply category filter
  const categoryFilter = document.getElementById('categoryFilter')?.value || '';
  if (categoryFilter) {
    filteredPizzas = filteredPizzas.filter(pizza => pizza.category === categoryFilter);
  }
  
  container.innerHTML = filteredPizzas.map(pizza => `
    <div class="pizza-card">
      <div class="pizza-header">
        <div class="pizza-icon">${pizza.image}</div>
        <div class="pizza-title">
          <h4 class="pizza-name">${pizza.name}</h4>
          <div class="pizza-category">${pizza.category}</div>
        </div>
        <div class="pizza-price">€${pizza.price.toFixed(2)}</div>
      </div>
      <p class="pizza-description">${pizza.description}</p>
      <div class="pizza-ingredients">
        <div class="ingredients-list">
          ${pizza.ingredients.map(ing => `<span class="ingredient-tag">${ing}</span>`).join('')}
        </div>
      </div>
      <div class="pizza-actions">
        <button class="btn btn--secondary btn--sm" onclick="editPizza(${pizza.id})">Modifica</button>
        <button class="btn btn--outline btn--sm" onclick="deletePizza(${pizza.id})">Elimina</button>
      </div>
    </div>
  `).join('');
}

function setupFilters() {
  // Menu search and filter
  const menuSearch = document.getElementById('menuSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  
  if (menuSearch) {
    menuSearch.addEventListener('input', renderPizzaList);
  }
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderPizzaList);
  }
  
  // Order status filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', loadOrders);
  }
  
  // Add pizza button
  const addPizzaBtn = document.getElementById('addPizzaBtn');
  if (addPizzaBtn) {
    addPizzaBtn.addEventListener('click', () => openPizzaModal());
  }
  
  // New order button
  const newOrderBtn = document.getElementById('newOrderBtn');
  if (newOrderBtn) {
    newOrderBtn.addEventListener('click', () => openOrderModal());
  }
}

// Pizza Modal
function setupModals() {
  // Pizza Modal
  const pizzaModal = document.getElementById('pizzaModal');
  const closePizzaModal = document.getElementById('closePizzaModal');
  const cancelPizza = document.getElementById('cancelPizza');
  const pizzaForm = document.getElementById('pizzaForm');
  
  if (closePizzaModal) closePizzaModal.addEventListener('click', closePizzaModalHandler);
  if (cancelPizza) cancelPizza.addEventListener('click', closePizzaModalHandler);
  if (pizzaForm) pizzaForm.addEventListener('submit', savePizza);
  
  // Order Modal
  const orderModal = document.getElementById('orderModal');
  const closeOrderModal = document.getElementById('closeOrderModal');
  const cancelOrder = document.getElementById('cancelOrder');
  const orderForm = document.getElementById('orderForm');
  const addOrderItem = document.getElementById('addOrderItem');
  
  if (closeOrderModal) closeOrderModal.addEventListener('click', closeOrderModalHandler);
  if (cancelOrder) cancelOrder.addEventListener('click', closeOrderModalHandler);
  if (orderForm) orderForm.addEventListener('submit', saveOrder);
  if (addOrderItem) addOrderItem.addEventListener('click', addOrderItemRow);
  
  // Modal backdrop
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closePizzaModalHandler();
      closeOrderModalHandler();
    });
  }
}

function openPizzaModal(pizza = null) {
  currentEditingPizza = pizza;
  const modal = document.getElementById('pizzaModal');
  const backdrop = document.getElementById('modalBackdrop');
  const title = document.getElementById('modalTitle');
  
  title.textContent = pizza ? 'Modifica Pizza' : 'Aggiungi Pizza';
  
  // Reset form
  const form = document.getElementById('pizzaForm');
  form.reset();
  
  // Fill form if editing
  if (pizza) {
    document.getElementById('pizzaName').value = pizza.name;
    document.getElementById('pizzaPrice').value = pizza.price;
    document.getElementById('pizzaCategory').value = pizza.category;
    document.getElementById('pizzaIngredients').value = pizza.ingredients.join(', ');
    document.getElementById('pizzaDescription').value = pizza.description;
  }
  
  modal.classList.remove('hidden');
  backdrop.classList.remove('hidden');
}

function closePizzaModalHandler() {
  const modal = document.getElementById('pizzaModal');
  const backdrop = document.getElementById('modalBackdrop');
  
  modal.classList.add('hidden');
  backdrop.classList.add('hidden');
  currentEditingPizza = null;
}

function savePizza(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('pizzaName').value,
    price: parseFloat(document.getElementById('pizzaPrice').value),
    category: document.getElementById('pizzaCategory').value,
    ingredients: document.getElementById('pizzaIngredients').value.split(',').map(s => s.trim()),
    description: document.getElementById('pizzaDescription').value,
    image: '🍕'
  };
  
  if (currentEditingPizza) {
    // Update existing pizza
    const index = appData.pizzas.findIndex(p => p.id === currentEditingPizza.id);
    appData.pizzas[index] = { ...currentEditingPizza, ...formData };
  } else {
    // Add new pizza
    const newId = Math.max(...appData.pizzas.map(p => p.id)) + 1;
    appData.pizzas.push({ id: newId, ...formData });
  }
  
  closePizzaModalHandler();
  renderPizzaList();
}

function editPizza(id) {
  const pizza = appData.pizzas.find(p => p.id === id);
  if (pizza) {
    openPizzaModal(pizza);
  }
}

function deletePizza(id) {
  if (confirm('Sei sicuro di voler eliminare questa pizza?')) {
    appData.pizzas = appData.pizzas.filter(p => p.id !== id);
    renderPizzaList();
  }
}

// Orders Management
function loadOrders() {
  renderOrdersList();
}

function renderOrdersList() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  
  let filteredOrders = appData.orders;
  
  // Apply status filter
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  if (statusFilter) {
    filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
  }
  
  // Sort by most recent
  filteredOrders = filteredOrders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
  
  container.innerHTML = filteredOrders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div class="order-info">
          <h4>Ordine #${order.id} - ${order.customer}</h4>
          <div class="order-meta">
            ${order.phone} • ${order.address}<br>
            ${new Date(order.orderTime).toLocaleString('it-IT')}
          </div>
        </div>
        <div class="order-total">€${order.total.toFixed(2)}</div>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <div class="item-info">
              <span class="item-quantity">${item.quantity}</span>
              <span>${item.name}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="order-actions">
        <select class="form-control status-select" onchange="updateOrderStatus(${order.id}, this.value)">
          <option value="Ricevuto" ${order.status === 'Ricevuto' ? 'selected' : ''}>Ricevuto</option>
          <option value="In preparazione" ${order.status === 'In preparazione' ? 'selected' : ''}>In preparazione</option>
          <option value="Pronto" ${order.status === 'Pronto' ? 'selected' : ''}>Pronto</option>
          <option value="In consegna" ${order.status === 'In consegna' ? 'selected' : ''}>In consegna</option>
          <option value="Consegnato" ${order.status === 'Consegnato' ? 'selected' : ''}>Consegnato</option>
        </select>
        <div class="status status--${getStatusClass(order.status)}">${order.status}</div>
      </div>
    </div>
  `).join('');
}

function updateOrderStatus(orderId, newStatus) {
  const order = appData.orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    
    // Update driver status if needed
    if (newStatus === 'Consegnato' && order.driver) {
      const driver = appData.drivers.find(d => d.name === order.driver);
      if (driver) {
        driver.status = 'disponibile';
        driver.currentOrder = null;
      }
      order.driver = null;
    }
    
    renderOrdersList();
    updateStats();
    loadRecentOrders();
    
    // Reload deliveries page if it's currently active
    const deliveriesPage = document.getElementById('deliveries-page');
    if (deliveriesPage && deliveriesPage.classList.contains('active')) {
      loadDeliveries();
    }
  }
}

// Order Modal
function openOrderModal() {
  const modal = document.getElementById('orderModal');
  const backdrop = document.getElementById('modalBackdrop');
  
  // Reset form
  document.getElementById('orderForm').reset();
  document.getElementById('orderItems').innerHTML = '';
  document.getElementById('orderTotal').textContent = '€0.00';
  
  // Add first item row
  addOrderItemRow();
  
  modal.classList.remove('hidden');
  backdrop.classList.remove('hidden');
}

function closeOrderModalHandler() {
  const modal = document.getElementById('orderModal');
  const backdrop = document.getElementById('modalBackdrop');
  
  modal.classList.add('hidden');
  backdrop.classList.add('hidden');
}

function addOrderItemRow() {
  const container = document.getElementById('orderItems');
  const row = document.createElement('div');
  row.className = 'order-item-row';
  
  row.innerHTML = `
    <select class="form-control" onchange="updateOrderTotal()">
      <option value="">Seleziona pizza</option>
      ${appData.pizzas.map(pizza => `
        <option value="${pizza.id}" data-price="${pizza.price}">${pizza.name} - €${pizza.price.toFixed(2)}</option>
      `).join('')}
    </select>
    <input type="number" class="form-control" min="1" value="1" onchange="updateOrderTotal()">
    <button type="button" class="remove-item" onclick="removeOrderItem(this)">×</button>
  `;
  
  container.appendChild(row);
}

function removeOrderItem(button) {
  button.parentElement.remove();
  updateOrderTotal();
}

function updateOrderTotal() {
  const rows = document.querySelectorAll('.order-item-row');
  let total = 0;
  
  rows.forEach(row => {
    const select = row.querySelector('select');
    const quantityInput = row.querySelector('input');
    const selectedOption = select.selectedOptions[0];
    
    if (selectedOption && selectedOption.dataset.price) {
      const price = parseFloat(selectedOption.dataset.price);
      const quantity = parseInt(quantityInput.value) || 1;
      total += price * quantity;
    }
  });
  
  document.getElementById('orderTotal').textContent = `€${total.toFixed(2)}`;
}

function saveOrder(e) {
  e.preventDefault();
  
  const customer = document.getElementById('customerName').value;
  const phone = document.getElementById('customerPhone').value;
  const address = document.getElementById('customerAddress').value;
  
  const items = [];
  const rows = document.querySelectorAll('.order-item-row');
  
  rows.forEach(row => {
    const select = row.querySelector('select');
    const quantityInput = row.querySelector('input');
    const selectedOption = select.selectedOptions[0];
    
    if (selectedOption && selectedOption.value) {
      const pizzaId = parseInt(selectedOption.value);
      const pizza = appData.pizzas.find(p => p.id === pizzaId);
      const quantity = parseInt(quantityInput.value) || 1;
      
      items.push({
        pizzaId: pizzaId,
        name: pizza.name,
        quantity: quantity
      });
    }
  });
  
  if (items.length === 0) {
    alert('Aggiungi almeno una pizza all\'ordine');
    return;
  }
  
  const total = items.reduce((sum, item) => {
    const pizza = appData.pizzas.find(p => p.id === item.pizzaId);
    return sum + (pizza.price * item.quantity);
  }, 0);
  
  const newOrder = {
    id: Math.max(...appData.orders.map(o => o.id)) + 1,
    customer,
    phone,
    address,
    items,
    total,
    status: 'Ricevuto',
    orderTime: new Date().toISOString(),
    driver: null
  };
  
  appData.orders.push(newOrder);
  
  closeOrderModalHandler();
  renderOrdersList();
  updateStats();
}

// Deliveries Management
function loadDeliveries() {
  renderDriversList();
  renderDeliveriesList();
}

function renderDriversList() {
  const container = document.getElementById('driversList');
  if (!container) return;
  
  container.innerHTML = `
    <div class="driver-grid">
      ${appData.drivers.map(driver => `
        <div class="driver-card">
          <div class="driver-info">
            <div class="driver-name">${driver.name}</div>
            <div class="driver-status ${driver.status === 'disponibile' ? 'available' : driver.status === 'occupato' ? 'busy' : 'unavailable'}">
              ${driver.status}
            </div>
          </div>
          ${driver.currentOrder ? `<div>Ordine #${driver.currentOrder}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderDeliveriesList() {
  const container = document.getElementById('deliveriesList');
  if (!container) return;
  
  const activeDeliveries = appData.orders.filter(order => 
    ['Pronto', 'In consegna'].includes(order.status)
  );
  
  if (activeDeliveries.length === 0) {
    container.innerHTML = '<p>Nessuna consegna attiva</p>';
    return;
  }
  
  container.innerHTML = activeDeliveries.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div class="order-info">
          <h4>Ordine #${order.id} - ${order.customer}</h4>
          <div class="order-meta">
            📍 ${order.address}<br>
            📞 ${order.phone}
          </div>
        </div>
        <div class="order-total">€${order.total.toFixed(2)}</div>
      </div>
      <div class="order-actions">
        <div class="status status--${getStatusClass(order.status)}">${order.status}</div>
        ${order.status === 'Pronto' ? `
          <select class="form-control driver-select" data-order-id="${order.id}">
            <option value="">Assegna driver</option>
            ${appData.drivers.filter(d => d.status === 'disponibile').map(driver => `
              <option value="${driver.name}">${driver.name}</option>
            `).join('')}
          </select>
        ` : `
          <div>Driver: ${order.driver || 'Non assegnato'}</div>
        `}
      </div>
    </div>
  `).join('');
  
  // Add event listeners to driver select dropdowns
  const driverSelects = document.querySelectorAll('.driver-select');
  driverSelects.forEach(select => {
    select.addEventListener('change', function() {
      const orderId = parseInt(this.dataset.orderId);
      const driverName = this.value;
      if (driverName) {
        assignDriver(orderId, driverName);
      }
    });
  });
}

function assignDriver(orderId, driverName) {
  if (!driverName) return;
  
  const order = appData.orders.find(o => o.id === orderId);
  const driver = appData.drivers.find(d => d.name === driverName);
  
  if (order && driver) {
    order.driver = driverName;
    order.status = 'In consegna';
    driver.status = 'occupato';
    driver.currentOrder = orderId;
    
    renderDeliveriesList();
    renderDriversList();
    updateStats();
    
    // Reload orders page if it's currently active
    const ordersPage = document.getElementById('orders-page');
    if (ordersPage && ordersPage.classList.contains('active')) {
      renderOrdersList();
    }
  }
}

// Make functions globally available
window.editPizza = editPizza;
window.deletePizza = deletePizza;
window.updateOrderStatus = updateOrderStatus;
window.removeOrderItem = removeOrderItem;
window.updateOrderTotal = updateOrderTotal;
window.assignDriver = assignDriver;