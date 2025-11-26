import {useMemo, useState } from 'react';

function AuthPage({ onLogin, onRegister, disabled }) {
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ username: '', password: '', fullname: '' });
    const [showPassword, setShowPassword] = useState(false);

    const passwordType = useMemo(() => (showPassword ? 'text' : 'password'), [showPassword]);

    const handleSubmitLogin = (event) => {
        event.preventDefault();
        onLogin(loginForm);
    };

    const handleSubmitRegister = (event) => {
        event.preventDefault();
        onRegister(registerForm);
    };

    return (
        <div className="auth-layout">
            <div className="auth-illustration">
                <div className="auth-illustration__content">
                    <img
                        src="./../../public/Login_background.png"
                        alt="Ảnh đăng nhập"
                        style={{ width: "452px", height: "525.5px" }}
                    />
                </div>

            </div>

            <div className="auth-panel">
                <div className="auth-panel__header">
                    <p className="auth-panel__welcome">CHÚC BẠN CÓ MỘT NGÀY LÀM VIỆC TỐT LÀNH!</p>
                    <h1>ĐĂNG NHẬP ĐỂ TIẾP TỤC</h1>
                </div>

                <form className="auth-form" onSubmit={handleSubmitLogin}>
                    <label className="auth-field">
                        <span>Tên đăng nhập</span>
                        <div className="auth-input">
                            <input
                                required
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                placeholder="admin"
                            />
                        </div>
                    </label>
                    <label className="auth-field">
                        <span>Mật khẩu</span>
                        <div className="auth-input auth-input--password">
                            <input
                                required
                                type={passwordType}
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                className="auth-input__toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>
                    </label>
                    <button className="auth-submit" type="submit" disabled={disabled('login')}>
                        {disabled('login') ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                    <div className="auth-form__footer">
                        <a href="#">Quên mật khẩu?</a>
                    </div>
                </form>


                <div className="auth-register">
                    <div>
                        <p className="auth-register__title">Chưa có tài khoản?</p>
                        <p className="muted">Tạo ngay cho nhân viên của bạn</p>
                    </div>
                    <form className="auth-register__form" onSubmit={handleSubmitRegister}>
                        <input
                            required
                            value={registerForm.fullname}
                            onChange={(e) => setRegisterForm({ ...registerForm, fullname: e.target.value })}
                            placeholder="Họ Tên"
                        />
                        <input
                            required
                            value={registerForm.username}
                            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                            placeholder="Tên đaăng nhập"
                        />

                        <input
                            required
                            type="password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            placeholder="Mật khẩu"
                        />
                        <button type="submit" disabled={disabled('register')}>
                            {disabled('register') ? 'Đang tạo...' : 'Tạo người dùng'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
