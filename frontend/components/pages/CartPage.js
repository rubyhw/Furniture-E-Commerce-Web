const CartPage = ({ cart = [] }) => {
    return (
        <div className="cart-page">
            <h1>Shopping Cart</h1>
            <div className="cart-items">
                {cart.length === 0 ? (
                    <p>Your cart is empty</p>
                ) : (
                    <div className="cart-list">
                        {cart.map((item, index) => (
                            <div key={index} className="cart-item">
                                <h3>{item.name}</h3>
                                <p>${item.price}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

window.CartPage = CartPage;
