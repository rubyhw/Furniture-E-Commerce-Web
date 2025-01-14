const App = () => {
    const [products, setProducts] = React.useState([
        { id: 1, name: 'Modern Sofa', price: 999.99 },
        { id: 2, name: 'Dining Table', price: 599.99 },
        { id: 3, name: 'Bed Frame', price: 799.99 }
    ]);
    const [cart, setCart] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState('home');

    const renderPage = () => {
        switch(currentPage) {
            case 'home':
                return <HomePage />;
            case 'products':
                return <ProductsPage products={products} setCart={setCart} />;
            case 'cart':
                return <CartPage cart={cart} />;
            case 'login':
                return <LoginPage setCurrentPage={setCurrentPage} />;
            case 'signup':
                return <SignupPage setCurrentPage={setCurrentPage} />;
            default:
                return <HomePage />;
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
                            setCurrentPage('login');
                        }}>Login</a>
                    </li>
                    <li>
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage('signup');
                        }}>Sign Up</a>
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
ReactDOM.render(<App />, document.getElementById('root'));
