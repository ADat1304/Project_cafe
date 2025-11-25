import { Link } from '../app/router';

function Dashboard() {
    return (
        <div className="grid two-col">
            <div className="card highlight">
                <p className="eyebrow">Figma layout</p>
                <h2>Giao diện nhiều trang</h2>
                <p className="muted">
                    Phiên bản này chia nhỏ các thao tác quản lý vào các màn hình riêng thay vì dồn trên một
                    trang duy nhất.
                </p>
                <div className="cta-row">
                    <Link className="button" to="/auth">
                        Đi tới đăng nhập
                    </Link>
                    <Link className="button ghost" to="/products">
                        Quản lý sản phẩm
                    </Link>
                </div>
            </div>

            <div className="card stats">
                <div>
                    <p className="label">Luồng API</p>
                    <p className="title">Gateway</p>
                    <p className="muted">Frontend chỉ gọi qua API Gateway đã có sẵn.</p>
                </div>
                <div className="pill">☕ Cafe Admin</div>
                <div className="pill secondary">🧾 Quản lý đơn</div>
                <div className="pill">👥 Người dùng</div>
            </div>
        </div>
    );
}

export default Dashboard;
