
// --- Elementos de la interfaz de usuario ---
const snacksContainer = document.getElementById("snacks-container"); // Contenedor para mostrar los snacks del catálogo
const tbodyProductos = document.getElementById("tbody-productos");   // Cuerpo de la tabla de productos para cotización
const totalGeneralEl = document.getElementById("total-general");     // Elemento para mostrar el total general

// --- Función utilitaria para convertir a número seguro ---
function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// --- Recalcula el total general y los subtotales de cada fila ---
function recalcularTodo() {
  if (!tbodyProductos || !totalGeneralEl) return;
  let total = 0;
  // Recorre cada fila de producto
  tbodyProductos.querySelectorAll(".table-row").forEach(row => {
    const inputs = row.querySelectorAll("input");
    const cantidad = parseNum(inputs[1]?.value);
    const precio = parseNum(inputs[2]?.value);
    const subtotal = cantidad * precio;
    const out = row.querySelector("output");
    if (out) out.textContent = String(subtotal);
    total += subtotal;
  });
  totalGeneralEl.textContent = String(total);
}

// --- Agrega un producto a la tabla de cotización ---
function agregarProducto(nombre, precioSugerido = 0) {
  if (!tbodyProductos) {
    alert("No se encontró la tabla de cotización.");
    return;
  }
  // Crea una nueva fila de producto
  const row = document.createElement("div");
  row.className = "table-row";
  row.innerHTML = `
    <span><input type="text" value="${nombre || "Producto"}"></span>
    <span><input type="number" min="1" step="1" value="1"></span>
    <span><input type="number" min="0" step="100" value="${precioSugerido}"></span>
    <span><output>${precioSugerido}</output></span>
  `;
  // Recalcula totales al modificar la fila
  row.addEventListener("input", recalcularTodo);
  tbodyProductos.appendChild(row);
  recalcularTodo();
}

// --- Realiza una petición fetch de JSON con timeout y reintentos ---
async function fetchJSON(url, { timeoutMs = 9000, tries = 1 } = {}) {
  for (let i = 0; i <= tries; i++) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
      clearTimeout(to);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(to);
      if (i === tries) throw e;
      await new Promise(r => setTimeout(r, 400)); // Espera antes de reintentar
    }
  }
}

// --- Carga el catálogo de snacks desde una API pública ---
async function cargarSnacks() {
  if (!snacksContainer) return;
  // Muestra loader mientras carga
  snacksContainer.innerHTML = `<div class="loader" role="status" aria-label="Cargando catálogo..."></div>`;

  try {
    // API pública de snacks (TheMealDB, categoría Dessert)
    const url = "https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert";
    const data = await fetchJSON(url, { timeoutMs: 9000, tries: 1 });

    // Toma hasta 8 productos del resultado
    const items = Array.isArray(data?.meals) ? data.meals.slice(0, 8) : [];
    if (items.length === 0) {
      snacksContainer.innerHTML = `<p>No se encontraron productos.</p>`;
      return;
    }

    snacksContainer.innerHTML = "";
    // Crea una tarjeta por cada snack
    items.forEach(m => {
      const nombre = m.strMeal || "Producto";
      const img = m.strMealThumb;
      const precioSugerido = 12000; // Precio demo

      const card = document.createElement("div");
      card.className = "snack-card";
      card.innerHTML = `
        <img src="${img}" alt="${nombre}" loading="lazy">
        <h4>${nombre}</h4>
        <p>Cat: Dessert</p>
        <button class="btn" type="button" aria-label="Añadir a cotización: ${nombre}">Añadir a cotización</button>
      `;
      // Al hacer clic, agrega el producto a la cotización
      card.querySelector("button").addEventListener("click", () => agregarProducto(nombre, precioSugerido));
      snacksContainer.appendChild(card);
    });
  } catch (error) {
    // Si falla la API, muestra mensaje de error y opción de reintentar
    console.error("[API] Error cargando snacks:", error);
    snacksContainer.innerHTML = `
      <div role="alert" class="card">
        <p>❌ Error al cargar snacks desde la API.</p>
        <small>${String(error?.message || error)}</small>
        <div class="actions" style="margin-top:.75rem">
          <button class="btn" type="button" id="btn-reintentar">Reintentar</button>
        </div>
      </div>
    `;
    document.getElementById("btn-reintentar")?.addEventListener("click", cargarSnacks);

    // Si falla la API, muestra productos de ejemplo locales
    const seed = [
      { nombre: "Barra de avena", precio: 9000 },
      { nombre: "Mix frutos secos", precio: 12000 },
      { nombre: "Jugo natural 300ml", precio: 6000 }
    ];
    const grid = document.createElement("div");
    grid.className = "snack-grid";
    seed.forEach(s => {
      const card = document.createElement("div");
      card.className = "snack-card";
      card.innerHTML = `
        <h4>${s.nombre}</h4>
        <p>Seed local</p>
        <button class="btn" type="button" aria-label="Añadir a cotización: ${s.nombre}">Añadir a cotización</button>
      `;
      card.querySelector("button").addEventListener("click", () => agregarProducto(s.nombre, s.precio));
      grid.appendChild(card);
    });
    snacksContainer.appendChild(grid);
  }
}

// --- Inicializa la carga del catálogo al cargar la página ---
document.addEventListener("DOMContentLoaded", cargarSnacks);
