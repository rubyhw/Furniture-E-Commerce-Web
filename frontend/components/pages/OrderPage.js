const OrderPage = ({ setOrderCount }) => {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [isAdmin, setIsAdmin] = React.useState(false);
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

        const getOrders = async () => {
            try {
                const data = await window.orderService.getOrderHistory();
                setOrders(data.orderHistory);
                
                // Check if user is admin from window.userData
                const userData = window.userData || {};
                setIsAdmin(userData.admin === 'TRUE' || userData.admin === true);
                
                // Update order count if setOrderCount is provided
                if (setOrderCount) {
                    setOrderCount(data.orderHistory.length);
                }
                setLoading(false);
            } catch(err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
        getOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await window.orderService.updateOrderStatus(orderId, newStatus);
            
            // Update local state to reflect the change
            const updatedOrders = orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);
        } catch (err) {
            alert("Failed to update order status");
        }
    };

    const renderStatusDropdown = (order) => {
        const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        
        return (
            <select 
                value={order.status} 
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                disabled={!isAdmin}
            >
                {statuses.map(status => (
                    <option key={`${order.id}-${status}`} value={status}>
                        {status}
                    </option>
                ))}
            </select>
        );
    };

    const renderOrderItems = (items) => {
        if (!Array.isArray(items) || items.length === 0) {
            return <div>No items</div>;
        }

        const orderItems = [];
        for (let i = 0; i < items.length; i += 2) {
            const productId = items[i];
            const quantity = items[i + 1];
            const product = products[productId] || { name: 'Unknown Product', price: 0 };
            
            orderItems.push(
                <div key={`${productId}-${i}`} className="order-item">
                    <span>{product.name} x {quantity}</span>
                    <span>RM{(product.price * quantity).toFixed(2)}</span>
                </div>
            );
        }
        return orderItems;
    };

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <h2>Error</h2>
                <div>{error}</div>
            </div>
        );
    }

    return (
        <div className="order-page">
            <h1>My Orders</h1>
            <div className="orders-list">
                {orders.length === 0 ? (
                    <p className="empty-message">
                        <i>You have no orders</i>
                    </p>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order.id}</h3>
                                {isAdmin ? (
                                    renderStatusDropdown(order)
                                ) : (
                                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                )}
                            </div>
                            <div className="order-date">
                                Ordered on: {order.date}
                            </div>
                            <div className="order-items">
                                {renderOrderItems(order.items)}
                            </div>
                            <div className="order-total">
                                Total: RM{(parseFloat(order.total) || 0).toFixed(2)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

window.OrderPage = OrderPage;
