import { useCallback, useMemo, useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, Link } from 'react-router-dom';

import './App.css';
import { API_BASE_URL, apiRequest, setAuthToken } from './app/apiClient';
import { HashRouter, Link, Navigate, Route, Routes } from './app/router';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';

const navItems = [
    { to: '/dashboard', label: 'Tổng quan', icon: '🏠' },
    { to: '/auth', label: 'Xác thực', icon: '🔑' },
    { to: '/products', label: 'Sản phẩm', icon: '☕' },
    { to: '/orders', label: 'Đơn hàng', icon: '🧾' },
    { to: '/users', label: 'Người dùng', icon: '👥' },
];

function App() {
    const [token, updateToken] = useState('');
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [busyAction, setBusyAction] = useState('');

    const displayApiBase = useMemo(() => API_BASE_URL.replace(/\/$/, ''), []);

    const disabled = useCallback((action) => busyAction === action, [busyAction]);

    const loadProducts = useCallback(async () => {
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
    }, []);

    const handleLogin = useCallback(async (loginForm) => {
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
    }, []);

    const handleRegister = useCallback(async (registerForm) => {
        setBusyAction('register');
        setMessage('');
        try {
            const response = await apiRequest('/users', {
                method: 'POST',
                body: registerForm,
            });
            setMessage(`Tạo người dùng thành công cho ${response?.result?.username ?? payload.username}.`);
        } catch (error) {
            setMessage(`Không thể tạo người dùng: ${error.message}`);
        } finally {
            setBusyAction('');
        }
    }, []);

    const handleCreateProduct = useCallback(
        async (productForm) => {
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
                await loadProducts();
            } catch (error) {
                setMessage(`Không thể tạo sản phẩm: ${error.message}`);
            } finally {
                setBusyAction('');
            }
        },
        [loadProducts]
    );


        const handleCreateOrder = useCallback(async (orderForm) => {
            setBusyAction('order');
            setMessage('');
            try {
                const payload = {
                    tableNumber: orderForm.tableNumber,
                    paymentMethodType: orderForm.paymentMethodType,
                    items: orderForm.items
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
            } catch (error) {
                setMessage(`Không thể tạo đơn hàng: ${error.message}`);
            } finally {
                setBusyAction('');
            }

    }, []);

    const handleFetchUsers = useCallback(async () => {
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
    }, [token]);

    const clearMessage = useCallback(() => setMessage(''), []);

    return (
        <HashRouter>
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

                <nav className="tabs">
                    <Link to="/">Trang chủ</Link>
                    <Link to="/auth">Đăng nhập</Link>
                    <Link to="/products">Sản phẩm</Link>
                    <Link to="/orders">Đơn hàng</Link>
                    <Link to="/users">Người dùng</Link>
                </nav>

                {message && <div className="alert">{message}</div>}

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                        path="/auth"
                        element={<AuthPage onLogin={handleLogin} onRegister={handleRegister} disabled={disabled} />}
                    />
                    <Route
                        path="/products"
                        element={
                            <ProductsPage
                                products={products}
                                onCreate={handleCreateProduct}
                                onReload={loadProducts}
                                disabled={disabled}
                            />
                        }
                    />
                    <Route
                        path="/orders"
                        element={<OrdersPage onCreate={handleCreateOrder} disabled={disabled} />}
                    />
                    <Route
                        path="/users"
                        element={<UsersPage users={users} token={token} onFetch={handleFetchUsers} disabled={disabled} />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </HashRouter>
    );
}

export default App;
