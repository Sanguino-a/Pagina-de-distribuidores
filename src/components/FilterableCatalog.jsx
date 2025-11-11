import { useState, useMemo } from 'react';
import { SkeletonGrid } from './SkeletonLoader';

export default function FilterableCatalog({ 
  products, 
  loading = false, 
  onProductSelect,
  title = "Catálogo de Productos",
  showFilters = true 
}) {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, category
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    if (!products) return [];
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= Number(priceRange.max));
    }

    // Availability filter
    if (showOnlyAvailable) {
      filtered = filtered.filter(product => product.available !== false);
    }

    // Sort products
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'category':
          aVal = (a.category || '').toLowerCase();
          bVal = (b.category || '').toLowerCase();
          break;
        case 'price':
          aVal = Number(a.price) || 0;
          bVal = Number(b.price) || 0;
          break;
        default:
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder, priceRange, showOnlyAvailable]);

  // Count active filters
  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    priceRange.min,
    priceRange.max,
    showOnlyAvailable
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
    setSortOrder('asc');
    setPriceRange({ min: '', max: '' });
    setShowOnlyAvailable(false);
  };

  if (loading) {
    return (
      <section className="card flow" aria-labelledby="cat-heading">
        <h2 id="cat-heading">{title}</h2>
        <p>Cargando productos...</p>
        <SkeletonGrid items={6} />
      </section>
    );
  }

  return (
    <section className="card flow" aria-labelledby="cat-heading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 id="cat-heading">{title}</h2>
          <p>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && ` (filtrado${activeFiltersCount > 1 ? 's' : ''})`}
          </p>
        </div>
        {activeFiltersCount > 0 && (
          <button 
            className="btn btn-secondary" 
            onClick={clearAllFilters}
            aria-label="Limpiar todos los filtros"
          >
            🗑️ Limpiar Filtros ({activeFiltersCount})
          </button>
        )}
      </div>

      {showFilters && (
        <div className="advanced-filters" style={{ marginBottom: '2rem' }}>
          {/* Search and basic filters */}
          <div className="filter-group">
            <h4>🔍 Búsqueda y Filtros</h4>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="search-products">Buscar productos</label>
                <input
                  id="search-products"
                  type="text"
                  placeholder="Nombre, descripción o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="field">
                <label htmlFor="filter-category">Categoría</label>
                <select
                  id="filter-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Price range and sorting */}
          <div className="filter-group">
            <h4>💰 Rango de Precios y Ordenamiento</h4>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="price-min">Precio mínimo</label>
                <input
                  id="price-min"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="100"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
              </div>
              
              <div className="field">
                <label htmlFor="price-max">Precio máximo</label>
                <input
                  id="price-max"
                  type="number"
                  placeholder="Sin límite"
                  min="0"
                  step="100"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
              
              <div className="field">
                <label htmlFor="sort-by">Ordenar por</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Nombre</option>
                  <option value="category">Categoría</option>
                  <option value="price">Precio</option>
                </select>
              </div>
              
              <div className="field">
                <label htmlFor="sort-order">Orden</label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional filters */}
          <div className="filter-group">
            <h4>⚙️ Opciones Adicionales</h4>
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                />
                Solo productos disponibles
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="filter-summary" style={{ marginBottom: '1rem' }}>
          <strong>Filtros activos: </strong>
          {searchTerm && <span className="active-filter">Búsqueda: "{searchTerm}"</span>}
          {selectedCategory && <span className="active-filter">Categoría: {selectedCategory}</span>}
          {priceRange.min && <span className="active-filter">Min: ${priceRange.min}</span>}
          {priceRange.max && <span className="active-filter">Max: ${priceRange.max}</span>}
          {showOnlyAvailable && <span className="active-filter">Solo disponibles</span>}
        </div>
      )}

      {/* Products grid */}
      <div className="snack-grid" aria-live="polite">
        {filteredProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros o limpiar la búsqueda.</p>
            {activeFiltersCount > 0 && (
              <button className="btn btn-secondary" onClick={clearAllFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <div key={product.id || index} className="snack-card">
              {product.img && (
                <img 
                  src={product.img} 
                  alt={product.name} 
                  loading="lazy"
                  style={{ 
                    borderRadius: '.6rem',
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>{product.name}</h4>
                {product.category && (
                  <span 
                    style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--muted)',
                      background: 'var(--surface)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.5rem',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {product.category}
                  </span>
                )}
                {product.description && (
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--muted)',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.description}
                  </p>
                )}
                {product.price && (
                  <p style={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    color: 'var(--accent)',
                    margin: '0.5rem 0'
                  }}>
                    ${Number(product.price).toLocaleString('es-CO')}
                  </p>
                )}
                {product.available === false && (
                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--danger)',
                    margin: 0,
                    fontStyle: 'italic'
                  }}>
                    No disponible
                  </p>
                )}
                <button 
                  className="btn" 
                  type="button" 
                  disabled={product.available === false}
                  onClick={() => onProductSelect?.(product)}
                  aria-label={`Agregar ${product.name} a la cotización`}
                  style={{ 
                    marginTop: 'auto',
                    opacity: product.available === false ? 0.5 : 1
                  }}
                >
                  {product.available === false ? 'No disponible' : 'Añadir a cotización'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}