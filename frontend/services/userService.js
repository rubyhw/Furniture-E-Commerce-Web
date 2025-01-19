// User Service - Handles all user-related functionality

const userService = {
    // Get user data from window.userData
    getUserData() {
        return window.userData || null;
    },

    // Check if user is admin
    isAdmin() {
        const userData = this.getUserData();
        return userData && (
            userData.admin === 'TRUE' || 
            userData.admin === true || 
            userData.isAdmin === true
        );
    },

    // Get user ID
    getUserId() {
        const userData = this.getUserData();
        return userData ? userData.id : null;
    },

    // Get user's orders
    async getOrders() {
        const userData = this.getUserData();
        if (!userData) {
            throw new Error('User not authenticated');
        }

        const response = await fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userData.id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        return data.orderHistory || [];
    }
};

window.userService = userService;
