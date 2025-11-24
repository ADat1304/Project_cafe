import { useState } from 'react';

function AuthPage({ onLogin, onRegister, disabled }) {
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ username: '', password: '', fullname: '' });

    const handleSubmitLogin = (event) => {
        event.preventDefault();
        onLogin(loginForm);
    };

    const handleSubmitRegister = (event) => {
        event.preventDefault();
        onRegister(registerForm);
    };

    return (
        <div className="grid two-col">
            <div className="card">
                <div className="card-header">
                    <div>
                        <p className="eyebrow">/auth/token</p>
                        <h2>Đăng nhập</h2>
                    </div>
                    <p className="muted">Nhận token để gọi API bảo vệ</p>
                </div>
                <form className="form" onSubmit={handleSubmitLogin}>
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
                        {disabled('login') ? 'Đang đăng nhập...' : 'Đăng nhập qua Gateway'}
                    </button>
                </form>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <p className="eyebrow">/users</p>
                        <h2>Đăng ký người dùng</h2>
                    </div>
                    <p className="muted">Tạo tài khoản mới cho nhân viên</p>
                </div>
                <form className="form" onSubmit={handleSubmitRegister}>
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
                        {disabled('register') ? 'Đang tạo...' : 'Tạo người dùng'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthPage;
