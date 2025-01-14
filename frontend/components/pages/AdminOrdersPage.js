window.AdminOrdersPage = () => {
    const [orders, setOrders] = React.useState([
        {
            id: 1,
            userId: 'user123',
            date: '2025-01-14',
            items: [
                { id: 1, name: 'Modern Sofa', price: 999.99, quantity: 1 },
                { id: 2, name: 'Dining Table', price: 599.99, quantity: 2 }
            ],
            status: 'Processing',
            total: 2199.97
        },
        {
            id: 2,
            userId: 'user456',
            date: '2025-01-13',
            items: [
                { id: 3, name: 'Bed Frame', price: 799.99, quantity: 1 }
            ],
            status: 'Shipped',
            total: 799.99
        }
    ]);

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(orders.map(order => 
            order.id === orderId 
                ? { ...order, status: newStatus }
                : order
        ));
    };

    return (
        <div className="admin-orders-page">
            <h1>Manage Orders</h1>
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="admin-order-card">
                        <div className="order-header">
                            <h3>Order #{order.id}</h3>
                            <div className="status-control">
                                <select 
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                >
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="order-info">
                            <p>User ID: {order.userId}</p>
                            <p>Date: {order.date}</p>
                        </div>
                        <div className="order-items">
                            {order.items.map(item => (
                                <div key={item.id} className="order-item">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>RM{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="order-total">
                            Total: RM{order.total}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
