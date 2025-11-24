import { useEffect, useState } from 'react';

function ProductsPage({ products, onCreate, onReload, disabled }) {
    const [productForm, setProductForm] = useState({
        productName: '',
        price: '',
        amount: '',
        categoryName: '',
        images: '',
    });

    useEffect(() => {
        onReload();
    }, [onReload]);

    const handleSubmit = (event) => {
        event.preventDefault();
        onCreate(productForm);
        setProductForm({ productName: '', price: '', amount: '', categoryName: '', images: '' });
    };

    return (
        <div className="grid full">
            <div className="card">
                <div className="card-header">
                    <div>
                        <p className="eyebrow">/products</p>
                        <h2>Tạo sản phẩm</h2>
                        <p className="muted">Thêm món mới cho menu</p>
                    </div>
                    <button type="button" onClick={onReload} disabled={disabled('loadProducts')}>
                        {disabled('loadProducts') ? 'Đang tải...' : 'Tải lại'}
                    </button>
                </div>

                <form className="form inline" onSubmit={handleSubmit}>
                    <label>
                        Tên sản phẩm
                        <input
                            required
                            value={productForm.productName}
                            onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                            placeholder="Cà phê sữa đá"
                        />
                    </label>
                    <label>
                        Giá
                        <input
                            required
                            type="number"
                            min="0"
                            step="1000"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            placeholder="30000"
                        />
                    </label>
                    <label>
                        Số lượng tồn
                        <input
                            required
                            type="number"
                            min="0"
                            value={productForm.amount}
                            onChange={(e) => setProductForm({ ...productForm, amount: e.target.value })}
                            placeholder="10"
                        />
                    </label>
                    <label>
                        Danh mục
                        <input
                            value={productForm.categoryName}
                            onChange={(e) => setProductForm({ ...productForm, categoryName: e.target.value })}
                            placeholder="Đồ uống"
                        />
                    </label>
                    <label className="full">
                        Ảnh (danh sách URL, cách nhau bởi dấu phẩy)
                        <input
                            value={productForm.images}
                            onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                            placeholder="https://.../anh1.jpg, https://.../anh2.jpg"
                        />
                    </label>
                    <button type="submit" disabled={disabled('product')}>
                        {disabled('product') ? 'Đang gửi...' : 'Tạo sản phẩm'}
                    </button>
                </form>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <h2>Danh sách sản phẩm</h2>
                        <p className="muted">Dữ liệu qua API Gateway</p>
                    </div>
                </div>
                <div className="list">
                    {products.length === 0 ? (
                        <p className="muted">Chưa có sản phẩm nào.</p>
                    ) : (
                        products.map((product) => (
                            <div key={product.productID ?? product.productName} className="list-item">
                                <div>
                                    <p className="title">{product.productName}</p>
                                    <p className="muted">Danh mục: {product.categoryName || 'N/A'}</p>
                                </div>
                                <div className="badges">
                                    <span className="badge">Giá: {product.price}</span>
                                    <span className="badge">Tồn: {product.amount}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductsPage;
