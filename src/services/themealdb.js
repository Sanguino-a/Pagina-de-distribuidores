// API pública de snacks (TheMealDB, categoría Dessert) con timeout y fallback
export async function fetchWithTimeout(resource, { timeoutMs = 9000, tries = 1, headers = {} } = {}) {
  for (let i = 0; i <= tries; i++) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(resource, { headers, signal: ctrl.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(id);
      if (i === tries) throw e;
      await new Promise(r => setTimeout(r, 400));
    }
  }
}

export async function loadSnacks() {
  const url = "https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert";
  try {
    const data = await fetchWithTimeout(url, { timeoutMs: 9000, tries: 1, headers: { Accept: 'application/json' } });
    const items = Array.isArray(data?.meals) ? data.meals.slice(0,8) : [];
    if (items.length) return items.map(m => ({ name: m.strMeal, img: m.strMealThumb }));
    return [];
  } catch (e) {
    return [
      { name: "Barra de avena", img: "" },
      { name: "Mix frutos secos", img: "" },
      { name: "Jugo natural 300ml", img: "" },
    ];
  }
}