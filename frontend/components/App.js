const App = () => {
    const [products, setProducts] = React.useState([]);
    const [cart, setCart] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState('home');
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedProductId, setSelectedProductId] = React.useState(null);

    React.useEffect(() => {
        let mounted = true;

        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                if (mounted) {
                    if (Array.isArray(data.products)) {
                        setProducts(data.products);
                    } else {
                        setError('Invalid data format received');
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                if (mounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            mounted = false;
        };
    }, []);

    const renderPage = () => {
        if (loading) {
            return <div className="loading">Loading products...</div>;
        }

        if (error) {
            return <div className="error">Error: {error}</div>;
        }

        switch(currentPage) {
            case 'home':
                return <HomePage setCurrentPage={setCurrentPage} />;
            case 'products':
                return <ProductsPage
                    products={products}
                    setCart={setCart}
                    setCurrentPage={setCurrentPage}
                    setSelectedProductId={setSelectedProductId}
                />;
            case 'product-detail':
                return <ProductDetailPage
                    products={products}
                    setCart={setCart}
                    productId={selectedProductId}
                    setCurrentPage={setCurrentPage}
                />;
            case 'cart':
                return <CartPage cart={cart} />;
            case 'orders':
                return <OrderPage />;
            case 'login':
                return <LoginPage setCurrentPage={setCurrentPage} />;
            case 'signup':
                return <SignupPage setCurrentPage={setCurrentPage} />;
            case 'admin-products':
                return <AdminProductsPage products={products} setProducts={setProducts} />;
            case 'admin-orders':
                return <AdminOrdersPage />;
            default:
                return <HomePage setCurrentPage={setCurrentPage} />;
        }
    };

    return (
        <div className="app">
            <nav className="navbar">
                <div className="nav-brand">Furniture Store</div>
                <ul className="nav-links">
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('home');
                        }}>Home</a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('products');
                        }}>Products</a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('cart');
                        }}>Cart ({cart.length})</a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('orders');
                        }}>Orders</a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('login');
                        }}>Login</a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('signup');
                        }}>Sign Up</a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('admin-products');
                        }}>Admin Products</a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('admin-orders');
                        }}>Admin Orders</a>
                    </li>
                </ul>
            </nav>
            <main className="main-content">
                {renderPage()}
            </main>
            <footer className="footer">
                <p>&copy; 2025 Furniture Store. All rights reserved.</p>
            </footer>
        </div>
    );
};

// Make App globally accessible
window.App = App;

// Initialize the app
ReactDOM.render(
    React.createElement(App),
    document.getElementById('root')
);
