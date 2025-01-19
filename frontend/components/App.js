const App = () => {
  const [products, setProducts] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState("home");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedProductId, setSelectedProductId] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userId, setUserId] = React.useState("");
  const [userName, setUserName] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch products: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        if (mounted) {
          if (Array.isArray(data.products)) {
            setProducts(data.products);
          } else {
            setError("Invalid data format received");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
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

    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} />;
      case "products":
        return (
          <ProductsPage
            products={products}
            setCart={setCart}
            setCurrentPage={setCurrentPage}
            setSelectedProductId={setSelectedProductId}
          />
        );
      case "product-detail":
        return (
          <ProductDetailPage
            products={products}
            setCart={setCart}
            productId={selectedProductId}
            setCurrentPage={setCurrentPage}
          />
        );
      case "cart":
        return <CartPage cart={cart} userId={userId} setCurrentPage={setCurrentPage} />;
      case "orders":
        return <OrderPage cart={cart} />;
      case "login":
        return (
          <LoginPage
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
            setIsAdmin={setIsAdmin}
            setUserId={setUserId}
            setUserName={setUserName}
          />
        );
      case "signup":
        return (
          <SignupPage
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
            setIsAdmin={setIsAdmin}
            setUserId={setUserId}
            setUserName={setUserName}
          />
        );
      case "admin-products":
        return isAdmin ? (
          <AdminProductsPage products={products} setProducts={setProducts} />
        ) : (
          <div>Access Denied</div>
        );
      case "admin-orders":
        return isAdmin ? <AdminOrdersPage /> : <div>Access Denied</div>;
      default:
        return <HomePage />;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserId("");
    setUserName("");
    setCurrentPage("home");
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">Furniture Store</div>
        <ul className="nav-links">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("home");
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage("products");
              }}
            >
              Products
            </a>
          </li>
          {isAuthenticated ? (
            <React.Fragment>
              {!isAdmin && (
                <React.Fragment>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage("cart");
                      }}
                    >
                      Cart ({cart.length})
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage("orders");
                      }}
                    >
                      Orders
                    </a>
                  </li>
                </React.Fragment>
              )}
              {isAdmin && (
                <React.Fragment>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage("admin-products");
                      }}
                    >
                      Manage Products
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage("admin-orders");
                      }}
                    >
                      Manage Orders
                    </a>
                  </li>
                </React.Fragment>
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage("login");
                  }}
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage("signup");
                  }}
                >
                  Sign Up
                </a>
              </li>
            </React.Fragment>
          )}
          {isAuthenticated && (
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout ({userName})
              </a>
            </li>
          )}
        </ul>
      </nav>
      <main className="main-content">{renderPage()}</main>
      <footer className="footer">
        <p>&copy; 2025 Furniture Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Make App globally accessible
window.App = App;

// Initialize the app
ReactDOM.render(React.createElement(App), document.getElementById("root"));
