window.ProductsPage = ({ products = [], setCart, setCurrentPage, setSelectedProductId }) => {
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [sortBy, setSortBy] = React.useState('name-asc');
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [searchQuery, setSearchQuery] = React.useState('');

    // Get unique categories from products
    const categories = ['all', ...new Set(products.map(p => p.category))].sort();

    // Filter and sort products
    const filteredAndSortedProducts = React.useMemo(() => {
        let result = [...products];
        
        // Apply search filter
        if (searchQuery) {
            result = result.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Apply category filter
        if (selectedCategory !== 'all') {
            result = result.filter(p => p.category === selectedCategory);
        }
        
        // Apply sorting
        switch (sortBy) {
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-desc':
                result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
        }
        
        return result;
    }, [products, sortBy, selectedCategory, searchQuery]);

    const addToCart = async (product, e) => {
        e.stopPropagation();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `productId=${product.id}&quantity=1`
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.error === "Not enough stock") {
                    setError(`Sorry, only ${data.available} items available`);
                } else {
                    setError(data.error || 'Failed to add to cart');
                }
                return;
            }

            setCart(prev => [...prev, product]);
        } catch (err) {
            setError('Failed to add to cart: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const viewProductDetail = (productId) => {
        setSelectedProductId(productId);
        setCurrentPage('product-detail');
    };

    return (
        <div className="products-page">
            <div className="products-controls">
                <div className="products-header">
                    <h1>Our Products</h1>
                </div>
                
                <div className="controls-row">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-sort-controls">
                        <div className="control-group">
                            <label className="control-label">Category</label>
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : 
                                         category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <label className="control-label">Sort By</label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="price-asc">Price (Low to High)</option>
                                <option value="price-desc">Price (High to Low)</option>
                            </select>
                        </div>
                    </div>

                    {selectedCategory !== 'all' && (
                        <div className="active-filters">
                            <span className="filter-tag">
                                {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                                <span className="remove" onClick={() => setSelectedCategory('all')}>×</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <div className="products-grid">
                {filteredAndSortedProducts.length === 0 ? (
                    <p className="no-products">No products found</p>
                ) : (
                    filteredAndSortedProducts.map(product => (
                        <div 
                            key={product.id} 
                            className="product-card"
                            onClick={() => viewProductDetail(product.id)}
                        >
                            <div className="product-image">
                                <img src={product.image_url} alt={product.name} />
                            </div>
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="price">RM {product.price}</p>
                                <p className="stock">In Stock: {product.stock_count}</p>
                                <button 
                                    className="add-to-cart-btn"
                                    onClick={(e) => addToCart(product, e)}
                                    disabled={loading || product.stock_count < 1}
                                >
                                    {product.stock_count < 1 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
