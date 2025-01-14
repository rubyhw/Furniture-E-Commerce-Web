window.ProductDetailPage = ({ products = [], setCart, productId, setCurrentPage }) => {
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="back-button">
                    <button onClick={() => setCurrentPage('products')}>← Back to Products</button>
                </div>
                <p>Product not found</p>
            </div>
        );
    }
    
    const addToCart = async () => {
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
            setError('Added to cart successfully!');
        } catch (err) {
            setError('Failed to add to cart: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-detail-page">
            <div className="back-button">
                <button onClick={() => setCurrentPage('products')}>← Back to Products</button>
            </div>
            <div className="product-detail-container">
                <div className="product-image">
                    <img src={product.image_url} alt={product.name} />
                </div>
                <div className="product-info">
                    <h1>{product.name}</h1>
                    <p className="category">{product.category}</p>
                    <p className="price">RM{product.price}</p>
                    <p className="stock">In Stock: {product.stock_count}</p>
                    <p className="description">{product.description}</p>
                    {error && <div className={error.includes('success') ? 'success-message' : 'error-message'}>{error}</div>}
                    <button 
                        className="add-to-cart-btn"
                        onClick={addToCart}
                        disabled={loading || product.stock_count < 1}
                    >
                        {product.stock_count < 1 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};
