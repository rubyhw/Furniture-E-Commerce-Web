window.AdminProductsPage = function AdminProductsPage({ products, setProducts }) {
    const [editingProduct, setEditingProduct] = React.useState(null);
    const [newProduct, setNewProduct] = React.useState({ name: '', price: '' });

    console.log('AdminProductsPage - received products:', products);

    // Fetch products when component mounts
    React.useEffect(() => {
        let mounted = true;
        
        const fetchProducts = async () => {
            try {
                console.log('Fetching products...');
                const response = await fetch('/api/products');
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                
                const data = await response.json();
                console.log('Received data:', data);
                
                if (mounted) {
                    if (Array.isArray(data.products)) {
                        setProducts(data.products);
                        console.log('Products set:', data.products);
                    } else {
                        console.error('Products is not an array:', data);
                    }
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                if (mounted) {
                    console.error(err.message);
                }
            }
        };

        fetchProducts();

        return () => {
            mounted = false;
        };
    }, []);

    const handleEdit = (product) => {
        setEditingProduct({ ...product });
    };

    const handleSave = () => {
        if (editingProduct) {
            setProducts(currentProducts => 
                currentProducts.map(p => p.id === editingProduct.id ? editingProduct : p)
            );
            setEditingProduct(null);
        }
    };

    const handleAdd = () => {
        if (newProduct.name && newProduct.price) {
            const newId = Math.max(...products.map(p => p.id), 0) + 1;
            setProducts(currentProducts => [...currentProducts, {
                id: newId,
                ...newProduct,
                category: 'Uncategorized',
                description: ''
            }]);
            setNewProduct({ name: '', price: '' });
        }
    };

    const handleDelete = (productId) => {
        setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));
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
                <h2>Current Products ({products.length})</h2>
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
                                    <span className="product-category">{product.category}</span>
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
