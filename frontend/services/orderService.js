const orderService = {
  async handleCheckout({
    userId,
    cart,
    total
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
    } catch (err) {
      throw err;
    }
  },

  async handleSignUp({
    email,
    password,
    name
  }) {
    try {
      console.log("submitting form");
      console.log(JSON.stringify({ email, password, name }));
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
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
