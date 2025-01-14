window.ProductsPage = ({ products = [], setCart }) => {
    return (
        <div className="products-page">
            <h1>Our Products</h1>
            <div className="products-grid">
                {products.length === 0 ? (
                    <p>No products available</p>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="product-card">
                            <h3>{product.name}</h3>
                            <p>RM{product.price}</p>
                            <button onClick={() => setCart(prev => [...prev, product])}>
                                Add to Cart
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
