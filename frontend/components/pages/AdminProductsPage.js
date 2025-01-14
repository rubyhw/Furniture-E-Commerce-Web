window.AdminProductsPage = function AdminProductsPage() {
    const [products, setProducts] = React.useState([
        { id: 1, name: 'Modern Sofa', price: 999.99 },
        { id: 2, name: 'Dining Table', price: 599.99 },
        { id: 3, name: 'Bed Frame', price: 799.99 }
    ]);
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [newProduct, setNewProduct] = React.useState({ name: '', price: '' });

    const handleEdit = (product) => {
        setEditingProduct({ ...product });
    };

    const handleSave = () => {
        if (editingProduct) {
            setProducts(products.map(p => 
                p.id === editingProduct.id ? editingProduct : p
            ));
            setEditingProduct(null);
        }
    };

    const handleAdd = () => {
        if (newProduct.name && newProduct.price) {
            setProducts([...products, {
                id: products.length + 1,
                ...newProduct
            }]);
            setNewProduct({ name: '', price: '' });
        }
    };

    const handleDelete = (productId) => {
        setProducts(products.filter(p => p.id !== productId));
    };

    return (
        <div className="admin-products-page">
            <h1>Manage Products</h1>
            
            <div className="add-product-form">
                <h2>Add New Product</h2>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || ''})}
                    />
                    <button onClick={handleAdd}>Add Product</button>
                </div>
            </div>

            <div className="products-list">
                <h2>Current Products</h2>
                {products.map(product => (
                    <div key={product.id} className="product-item">
                        {editingProduct && editingProduct.id === product.id ? (
                            <div className="product-edit">
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
                                <button onClick={handleSave}>Save</button>
                            </div>
                        ) : (
                            <div className="product-display">
                                <div className="product-info">
                                    <span className="product-name">{product.name}</span>
                                    <span className="product-price">RM{product.price}</span>
                                </div>
                                <div className="product-actions">
                                    <button onClick={() => handleEdit(product)}>Edit</button>
                                    <button onClick={() => handleDelete(product.id)}>Delete</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
