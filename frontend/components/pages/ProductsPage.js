window.ProductsPage = ({ products = [], setCart, setCurrentPage, setSelectedProductId }) => {
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const addToCart = async (product, e) => {
        e.stopPropagation(); // Prevent card click when clicking add to cart
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
            <h1>Our Products</h1>
            {error && <div className="error-message">{error}</div>}
            <div className="products-grid">
                {products.length === 0 ? (
                    <p>No products available</p>
                ) : (
                    products.map(product => (
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
