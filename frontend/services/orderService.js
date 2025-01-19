const orderService = {
  async handleCheckout({
    userId,
    cart,
    total,
    setCart
  }) {
    try {
      console.log(userId);
      console.log(cart);
      const productIdArr = cart.map(item => item.id);
      console.log(JSON.stringify({ userId, productIdArr, total }));
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productIdArr, total }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data.error);
        throw new Error(data.error);
      }

      // Clear the cart after successful checkout
      if (setCart) {
        setCart([]);
      }
    } catch (err) {
      throw err;
    }
  },

  async getOrderHistory({
    userId
  }) {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else{
        const data = await response.json();
        console.log(data.error);
        throw new Error(data.error);
      }
    } catch (err) {
      throw err;
    }
  }
};

window.orderService = orderService;
