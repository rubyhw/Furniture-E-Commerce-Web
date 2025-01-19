const CartPage = ({ cart = [], userId, setCurrentPage, setCart }) => {
  const [error, setError] = React.useState(null);

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    try {
      await window.orderService.handleCheckout({
        userId,
        cart,
        total,
        setCart // Pass setCart to clear the cart
      });
      setCurrentPage("orders");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      <div className="cart-items">
        {cart.length === 0 ? (
          <p className="empty-message">
            <i>Your cart is empty</i>
          </p>
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
                onClick={handleCheckout}
              >Place order</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

window.CartPage = CartPage;
