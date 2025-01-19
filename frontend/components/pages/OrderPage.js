window.OrderPage = ({ userId, setOrderCount }) => {
    const [orders, setOrders] = React.useState([]);
    
    React.useEffect(() => {
        const getOrder = async () => {
            try {
                const data = await window.orderService.getOrderHistory({ userId });
                console.log(data);
                setOrders(data.orderHistory);
                
                // Update order count if setOrderCount is provided
                if (setOrderCount) {
                    setOrderCount(data.orderHistory.length);
                }
            } catch(err) {
                console.log(err);
            }
        };
        getOrder();
    }, [userId]);

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
                                <span className={`order-status status-${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="order-date">
                                Ordered on: {order.date}
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
                                Total: RM{order.total.toFixed(2)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
