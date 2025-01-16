// Product Service - Handles all product-related API calls

const productService = {
    // Convert image file to data URL
    async imageToDataUrl(imageFile) {
        return new Promise((resolve, reject) => {
            if (!imageFile) {
                resolve(null);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(imageFile);
        });
    },

    // Add a new product
    async addProduct(productData, imageFile, products) {
        try {
            // Generate a new unique ID
            const maxId = Math.max(...products.map(p => parseInt(p.id) || 0), 0);
            const newId = (maxId + 1).toString();

            // Convert image to data URL if provided
            const imageUrl = await this.imageToDataUrl(imageFile);

            // Prepare the product data with the new ID
            const newProduct = {
                id: newId,
                name: productData.name.trim(),
                price: parseFloat(productData.price),
                category: (productData.category || 'others').trim(),
                stock_count: parseInt(productData.stock_count) || 0,
                image_url: imageUrl || productData.image_url || null // Use image_url to match existing products
            };

            console.log('Adding new product:', newProduct);

            // Since we don't have a backend, we'll simulate the server response
            const updatedProducts = [...products, newProduct];

            // Return the new product
            return {
                ...newProduct,
                price: parseFloat(newProduct.price) || 0,
                stock_count: parseInt(newProduct.stock_count) || 0
            };
        } catch (error) {
            console.error('Error in addProduct:', error);
            throw error;
        }
    },

    // Update an existing product
    async updateProduct(productId, productData, products) {
        try {
            // Since we don't have a backend, we'll update the product directly
            const updatedProduct = {
                ...productData,
                id: productId,
                price: parseFloat(productData.price) || 0,
                stock_count: parseInt(productData.stock_count) || 0,
                image_url: productData.image_url || null // Use image_url to match existing products
            };

            return updatedProduct;
        } catch (error) {
            console.error('Error in updateProduct:', error);
            throw error;
        }
    },

    // Delete a product
    async deleteProduct(productId, products) {
        try {
            // Since we don't have a backend, we'll just return true
            return true;
        } catch (error) {
            console.error('Error in deleteProduct:', error);
            throw error;
        }
    }
};

window.productService = productService;
