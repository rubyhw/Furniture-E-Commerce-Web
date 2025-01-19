const orderService = {
  async handleCheckout({ userId, cart, total, setCart }) {
    try {
      const productIdArr = cart.map(item => item.id);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, productIdArr, total }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Checkout failed');
      }

      // Clear the cart after successful checkout
      if (setCart) {
        setCart([]);
      }
    } catch (err) {
      throw err;
    }
  },

  async getOrderHistory() {
    try {
      if (!window.userData || !window.userData.id) {
        throw new Error('Please log in to view your orders');
      }

      const isAdmin = window.userData.admin === 'TRUE' || window.userData.admin === true;
      
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: window.userData.id,
          isAdmin: isAdmin
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      return {
        orderHistory: (data.orderHistory || []).map(order => ({
          ...order,
          total: typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0,
          items: order.items || []
        }))
      };
    } catch (err) {
      console.error('Error fetching orders:', err);
      throw err;
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      if (!window.userData || window.userData.admin !== 'TRUE') {
        throw new Error('Admin access required');
      }

      const response = await fetch("/api/order-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      return await response.json();
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }
};

window.orderService = orderService;
