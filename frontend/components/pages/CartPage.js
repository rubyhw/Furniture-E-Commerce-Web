const CartPage = ({ cart = [], setCurrentPage, userId}) => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
    
        try {
            await window.orderService.handleCheckout({
                userId,
                cart,
                total
            });
            setCurrentPage("orders");
        } catch (err) {
          console.log(err);
        }
      }; 
    
    return (
        <div className="cart-page">
            <h1>Shopping Cart</h1>
            <div className="cart-items">
                {cart.length === 0 ? (
                    <p>Your cart is empty</p>
                ) : (
                    <div>
                        <div className="cart-list">
                            {cart.map((item, index) => (
                                <div key={index} className="cart-item">
                                    <h3>{item.name}</h3>
                                    <p>RM{item.price}</p>
                                </div>
                            ))}
                        </div>
                        <div className="cart-summary">
                            <h3>Total: RM{total.toFixed(2)}</h3>
                            <button 
                                className="checkout-button" 
                                onClick={handleCheckoutSubmit}
                            >Place order</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

window.CartPage = CartPage;
