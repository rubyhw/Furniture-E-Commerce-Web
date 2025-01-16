window.AdminProductsPage = function AdminProductsPage({ products, setProducts }) {
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [newProduct, setNewProduct] = React.useState({
        name: '',
        price: '',
        category: '',
        stock_count: '',
        image: null,
        image_url: null
    });

    const categories = React.useMemo(() => {
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        return [
            ...uniqueCategories
                .filter(cat => cat !== 'others')
                .sort(),
            'others'
        ];
    }, [products]);

    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleEdit = (product) => {
        setEditingProduct({ ...product });
    };

    const handleSave = async () => {
        if (editingProduct) {
            try {
                const updatedProduct = await window.productService.updateProduct(editingProduct.id, editingProduct, products);
                setProducts(currentProducts =>
                    currentProducts.map(p => p.id === editingProduct.id ? updatedProduct : p)
                );
                setEditingProduct(null);
            } catch (error) {
                console.error('Error updating product:', error);
                alert(error.message || 'Failed to update product. Please try again.');
            }
        }
    };

    const handleAdd = async () => {
        if (newProduct.name && newProduct.price) {
            try {
                const addedProduct = await window.productService.addProduct(newProduct, newProduct.image, products);
                console.log('Added product:', addedProduct);

                // Add the new product to the list
                setProducts(currentProducts => [...currentProducts, addedProduct]);

                // Reset the form
                setNewProduct({
                    name: '',
                    price: '',
                    category: '',
                    stock_count: 0,
                    image: null,
                    image_url: null
                });

                alert('Product added successfully!');
            } catch (error) {
                console.error('Error adding product:', error);
                alert(error.message || 'Failed to add product. Please try again.');
            }
        } else {
            alert('Please enter at least a product name and price');
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await window.productService.deleteProduct(productId, products);
                setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert(error.message || 'Failed to delete product. Please try again.');
            }
        }
    };

    return (
        <div className="admin-products-page">
            <h1>Manage Products</h1>

            <div className="add-product-form">
                <h2>Add New Product</h2>
                <div className="form-group">
                    <div className="input-group">
                        <label>Product Name</label>
                        <input
                            type="text"
                            placeholder="Enter product name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        />
                    </div>
                    <div className="input-group">
                        <label>Price (RM)</label>
                        <input
                            type="number"
                            placeholder="Enter price"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || ''})}
                        />
                    </div>
                    <div className="input-group">
                        <label>Category</label>
                        <select
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        >
                            <option value="">Select category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {capitalizeFirstLetter(category)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Stock Count</label>
                        <input
                            type="number"
                            placeholder="Enter stock count"
                            value={newProduct.stock_count}
                            onChange={(e) => setNewProduct({...newProduct, stock_count: parseInt(e.target.value) || 0})}
                        />
                    </div>
                    <button className="add-button" onClick={handleAdd}>Add Product</button>
                </div>
                <div className="form-group image-upload-group">
                    <div className="input-group">
                        <label>Product Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewProduct({
                                ...newProduct,
                                image: e.target.files[0] || null
                            })}
                        />
                    </div>

                </div>
            </div>

            <div className="products-list">
                <h2>
                    Current Products
                    <span className="product-count">({products.length} items)</span>
                </h2>
                {products.map(product => (
                    <div key={product.id} className="product-item">
                        {editingProduct && editingProduct.id === product.id ? (
                            <div className="product-row">
                                <input
                                    type="text"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({
                                        ...editingProduct,
                                        name: e.target.value
                                    })}
                                />
                                <input
                                    type="number"
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct({
                                        ...editingProduct,
                                        price: parseFloat(e.target.value) || ''
                                    })}
                                />
                                <select
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({
                                        ...editingProduct,
                                        category: e.target.value
                                    })}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {capitalizeFirstLetter(category)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={editingProduct.stock_count}
                                    onChange={(e) => setEditingProduct({
                                        ...editingProduct,
                                        stock_count: parseInt(e.target.value) || 0
                                    })}
                                />
                                <div className="product-actions">
                                    <button className="save-button" onClick={handleSave}>Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className="product-row">
                                <span className="product-name">{product.name}</span>
                                <span className="product-price">RM{parseFloat(product.price) || 0}</span>
                                <span className="product-category">{product.category}</span>
                                <span className="product-stock">Stock: {parseInt(product.stock_count) || 0}</span>
                                <div className="product-actions">
                                    <button className="edit-button" onClick={() => handleEdit(product)}>Edit</button>
                                    <button className="delete-button" onClick={() => handleDelete(product.id)}>Delete</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
