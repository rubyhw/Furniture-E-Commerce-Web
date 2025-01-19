window.ManageOrdersPage = function ManageOrdersPage() {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [products, setProducts] = React.useState({});

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("/api/products");
                const data = await response.json();
                const productsMap = {};
                data.products.forEach(product => {
                    productsMap[product.id] = product;
                });
                setProducts(productsMap);
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };

        const fetchOrders = async () => {
            try {
                const data = await window.orderService.getOrderHistory();
                setOrders(data.orderHistory || []);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await window.orderService.updateOrderStatus(orderId, newStatus);
            
            // Update local state to reflect the change
            setOrders(currentOrders => 
                currentOrders.map(order => 
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            alert("Failed to update order status");
        }
    };

    const getStatusClassName = (status) => {
        return `status-${status.toLowerCase()}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="manage-orders-page">
            <h1>Manage Orders</h1>
            <div className="orders-list">
                {orders.length === 0 ? (
                    <p>No orders found</p>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order.id}</h3>
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    className={getStatusClassName(order.status)}
                                >
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="order-details">
                                <p>
                                    <strong>Order Date:</strong> 
                                    <span>{formatDate(order.date)}</span>
                                </p>
                                <p>
                                    <strong>Customer ID:</strong> 
                                    <span>{order.userId}</span>
                                </p>
                                <p>
                                    <strong>Total Amount:</strong> 
                                    <span>RM{parseFloat(order.total).toFixed(2)}</span>
                                </p>
                                <div className="order-items">
                                    <h4>Order Items</h4>
                                    {order.items && order.items.length > 0 && (
                                        <ul>
                                            {order.items.map((item, index) => {
                                                if (index % 2 === 0) {
                                                    const product = products[item] || { name: `Product ${item}`, price: 0 };
                                                    const quantity = order.items[index + 1];
                                                    const subtotal = product.price * quantity;
                                                    
                                                    return (
                                                        <li key={index}>
                                                            <span>
                                                                {product.name} × {quantity}
                                                            </span>
                                                            <span>
                                                                RM{subtotal.toFixed(2)}
                                                            </span>
                                                        </li>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
