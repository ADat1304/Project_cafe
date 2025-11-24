import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { API_BASE_URL, apiRequest, setAuthToken } from './app/apiClient';

const createEmptyOrderItem = () => ({ productName: '', quantity: 1, notes: '' });

function App() {
    const [token, updateToken] = useState('');
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ username: '', password: '', fullname: '' });
    const [productForm, setProductForm] = useState({
        productName: '',
        price: '',
        amount: '',
        categoryName: '',
        images: '',
    });
    const [orderForm, setOrderForm] = useState({ tableNumber: '', paymentMethodType: 'CASH' });
    const [orderItems, setOrderItems] = useState([createEmptyOrderItem()]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [busyAction, setBusyAction] = useState('');

    const displayApiBase = useMemo(() => API_BASE_URL.replace(/\/$/, ''), []);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setBusyAction('loadProducts');
        setMessage('');
        try {
            const response = await apiRequest('/products');
            setProducts(response?.result ?? []);
        } catch (error) {
            setMessage(`Không thể tải danh sách sản phẩm: ${error.message}`);
        } finally {
            setBusyAction('');
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setBusyAction('login');
        setMessage('');
        try {
            const response = await apiRequest('/auth/token', {
                method: 'POST',
                body: loginForm,
            });
            const receivedToken = response?.result?.token ?? '';
            setAuthToken(receivedToken);
            updateToken(receivedToken);
            setMessage('Đăng nhập thành công. Token đã được lưu để gọi API bảo vệ.');
        } catch (error) {
            setMessage(`Đăng nhập thất bại: ${error.message}`);
        } finally {
            setBusyAction('');
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setBusyAction('register');
        setMessage('');
        try {
            const response = await apiRequest('/users', {
                method: 'POST',
                body: registerForm,
            });
            setMessage(`Tạo người dùng thành công cho ${response?.result?.username ?? registerForm.username}.`);
        } catch (error) {
            setMessage(`Không thể tạo người dùng: ${error.message}`);
        } finally {
            setBusyAction('');
        }
    };

    const handleCreateProduct = async (event) => {
        event.preventDefault();
        setBusyAction('product');
        setMessage('');
        try {
            const images = productForm.images
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
            const payload = {
                productName: productForm.productName,
                price: Number(productForm.price),
                amount: Number(productForm.amount),
                categoryName: productForm.categoryName,
                images,
            };

            const response = await apiRequest('/products', { method: 'POST', body: payload });
            setMessage(`Đã tạo sản phẩm ${response?.result?.productName ?? payload.productName}.`);
            setProductForm({ productName: '', price: '', amount: '', categoryName: '', images: '' });
            await loadProducts();
        } catch (error) {
            setMessage(`Không thể tạo sản phẩm: ${error.message}`);
        } finally {
            setBusyAction('');
        }
    };

    const handleCreateOrder = async (event) => {
        event.preventDefault();
        setBusyAction('order');
        setMessage('');
        try {
            const payload = {
                tableNumber: orderForm.tableNumber,
                paymentMethodType: orderForm.paymentMethodType,
                items: orderItems
                    .filter((item) => item.productName && item.quantity)
                    .map((item) => ({
                        productName: item.productName,
                        quantity: Number(item.quantity),
                        notes: item.notes,
                    })),
            };

            if (!payload.items.length) {
                throw new Error('Vui lòng thêm ít nhất 1 món trong hóa đơn.');
            }

            const response = await apiRequest('/orders', { method: 'POST', body: payload });
            setMessage(`Tạo đơn hàng thành công với mã ${response?.result?.orderId ?? ''}.`);
            setOrderForm({ tableNumber: '', paymentMethodType: 'CASH' });
            setOrderItems([createEmptyOrderItem()]);
        } catch (error) {
            setMessage(`Không thể tạo đơn hàng: ${error.message}`);
        } finally {
            setBusyAction('');
        }
    };

    const handleFetchUsers = async () => {
        setBusyAction('users');
        setMessage('');
        if (!token) {
            setMessage('Vui lòng đăng nhập để lấy token trước khi tải danh sách người dùng.');
            setBusyAction('');
            return;
        }

        try {
            const response = await apiRequest('/users');
            setUsers(response?.result ?? []);
            setMessage('Đã tải danh sách người dùng qua API Gateway.');
        } catch (error) {
            setMessage(`Không thể tải người dùng: ${error.message}`);
        } finally {
            setBusyAction('');
        }
    };

    const updateOrderItem = (index, field, value) => {
        setOrderItems((prev) =>
            prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
        );
    };

    const addOrderItem = () => setOrderItems((prev) => [...prev, createEmptyOrderItem()]);

    const removeOrderItem = (index) => {
        setOrderItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
    };

    const disabled = (action) => busyAction === action;

    return (
        <div className="app-shell">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Frontend React chỉ gọi qua API Gateway</p>
                    <h1>Project Cafe Control Panel</h1>
                    <p className="muted">Gateway base: {displayApiBase}</p>
                </div>
                {token ? (
                    <div className="token-box" title={token}>
                        <span className="label">Token</span>
                        <span className="value">{`${token.slice(0, 16)}...`}</span>
                    </div>
                ) : (
                    <div className="token-box muted">Chưa có token</div>
                )}
            </header>

            {message && <div className="alert">{message}</div>}

            <section className="grid">
                <div className="card">
                    <div className="card-header">
                        <h2>Đăng nhập</h2>
                        <p className="muted">/auth/token</p>
                    </div>
                    <form className="form" onSubmit={handleLogin}>
                        <label>
                            Tên đăng nhập
                            <input
                                required
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                placeholder="admin"
                            />
                        </label>
                        <label>
                            Mật khẩu
                            <input
                                required
                                type="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </label>
                        <button type="submit" disabled={disabled('login')}>
                            {disabled('login') ? 'Đang đăng nhập...' : 'Lấy token qua Gateway'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2>Đăng ký người dùng</h2>
                        <p className="muted">/users</p>
                    </div>
                    <form className="form" onSubmit={handleRegister}>
                        <label>
                            Họ tên
                            <input
                                required
                                value={registerForm.fullname}
                                onChange={(e) => setRegisterForm({ ...registerForm, fullname: e.target.value })}
                                placeholder="Nguyễn Văn A"
                            />
                        </label>
                        <label>
                            Tên đăng nhập
                            <input
                                required
                                value={registerForm.username}
                                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                                placeholder="username"
                            />
                        </label>
                        <label>
                            Mật khẩu (tối thiểu 8 ký tự)
                            <input
                                required
                                type="password"
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </label>
                        <button type="submit" disabled={disabled('register')}>
                            {disabled('register') ? 'Đang tạo...' : 'Tạo người dùng qua Gateway'}
                        </button>
                    </form>
                </div>
            </section>

            <section className="grid">
                <div className="card wide">
                    <div className="card-header">
                        <div>
                            <h2>Sản phẩm</h2>
                            <p className="muted">Tạo mới và xem danh sách qua /products</p>
                        </div>
                        <button type="button" onClick={loadProducts} disabled={disabled('loadProducts')}>
                            {disabled('loadProducts') ? 'Đang tải...' : 'Tải lại'}
                        </button>
                    </div>

                    <form className="form inline" onSubmit={handleCreateProduct}>
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
            </section>

            <section className="grid">
                <div className="card">
                    <div className="card-header">
                        <h2>Tạo đơn hàng</h2>
                        <p className="muted">/orders</p>
                    </div>
                    <form className="form" onSubmit={handleCreateOrder}>
                        <label>
                            Số bàn
                            <input
                                required
                                value={orderForm.tableNumber}
                                onChange={(e) => setOrderForm({ ...orderForm, tableNumber: e.target.value })}
                                placeholder="B01"
                            />
                        </label>
                        <label>
                            Phương thức thanh toán
                            <select
                                value={orderForm.paymentMethodType}
                                onChange={(e) => setOrderForm({ ...orderForm, paymentMethodType: e.target.value })}
                            >
                                <option value="CASH">Tiền mặt</option>
                                <option value="CARD">Thẻ</option>
                                <option value="TRANSFER">Chuyển khoản</option>
                            </select>
                        </label>

                        <div className="order-items">
                            {orderItems.map((item, index) => (
                                <div className="order-row" key={`item-${index}`}>
                                    <input
                                        required
                                        value={item.productName}
                                        onChange={(e) => updateOrderItem(index, 'productName', e.target.value)}
                                        placeholder="Tên món"
                                    />
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                                        placeholder="Số lượng"
                                    />
                                    <input
                                        value={item.notes}
                                        onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                                        placeholder="Ghi chú"
                                    />
                                    <button type="button" className="ghost" onClick={() => removeOrderItem(index)}>
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="ghost" onClick={addOrderItem}>
                                + Thêm món
                            </button>
                        </div>

                        <button type="submit" disabled={disabled('order')}>
                            {disabled('order') ? 'Đang tạo...' : 'Gửi đơn hàng'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2>Danh sách người dùng</h2>
                            <p className="muted">/users (cần token ADMIN)</p>
                        </div>
                        <button type="button" onClick={handleFetchUsers} disabled={disabled('users')}>
                            {disabled('users') ? 'Đang tải...' : 'Tải qua Gateway'}
                        </button>
                    </div>

                    <div className="list">
                        {users.length === 0 ? (
                            <p className="muted">Chưa có dữ liệu người dùng. Đăng nhập và tải danh sách.</p>
                        ) : (
                            users.map((user) => (
                                <div key={user.username} className="list-item">
                                    <div>
                                        <p className="title">{user.fullname || user.username}</p>
                                        <p className="muted">{user.username}</p>
                                    </div>
                                    <div className="badges">
                                        {(user.roles || []).map((role) => (
                                            <span key={role} className="badge secondary">
                        {role}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default App;
