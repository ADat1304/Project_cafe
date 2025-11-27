// src/pages/DashboardPage.jsx
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { getAuth } from "../utils/auth.js";

export default function DashboardPage() {
    const auth = getAuth();
    const role = auth?.user?.role || "Chưa xác định";
    const tokenPreview = auth?.token ? `${auth.token.substring(0, 20)}...` : "Không có token";
    return (
        <div>
            <PageHeader
                title="Tổng quan"
                subtitle="Tình hình kinh doanh hôm nay"
                right={
                    <button className="btn btn-success btn-sm">
                        Xuất báo cáo hôm nay
                    </button>
                }
            />
            <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                <span className="bi bi-shield-lock-fill"></span>
                <div>
                    <div className="fw-semibold">Đăng nhập thành công</div>
                    <div className="small mb-0">Vai trò: {role} • Token: {tokenPreview}</div>
                </div>
            </div>
            {/* Hàng card thống kê */}
            <div className="row g-3 mb-3">
                <div className="col-md-3">
                    <StatCard label="Doanh thu hôm nay" value="5.200.000 đ" sub="+12% so với hôm qua" />
                </div>
                <div className="col-md-3">
                    <StatCard label="Số hóa đơn" value="84" sub="+9 đơn" />
                </div>
                <div className="col-md-3">
                    <StatCard label="Khách hàng" value="73" sub="18 khách mới" />
                </div>
                <div className="col-md-3">
                    <StatCard label="Bàn đang phục vụ" value="12 / 20" sub="60% công suất" />
                </div>
            </div>

            {/* Placeholder cho biểu đồ giống hình mockup */}
            <div className="row g-3">
                <div className="col-md-8">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <div>
                                    <h6 className="mb-0">Doanh thu theo ngày</h6>
                                    <small className="text-muted">7 ngày gần nhất</small>
                                </div>
                                <select className="form-select form-select-sm" style={{ maxWidth: 160 }}>
                                    <option>7 ngày gần nhất</option>
                                    <option>30 ngày gần nhất</option>
                                    <option>3 tháng gần nhất</option>
                                </select>
                            </div>

                            <div className="bg-light rounded d-flex align-items-center justify-content-center py-5">
                <span className="text-muted small">
                  (Chỗ này sau tích hợp chart – hiện tại dùng placeholder)
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 mb-3">
                        <div className="card-body">
                            <h6 className="mb-2">Top sản phẩm bán chạy</h6>
                            <ul className="list-group list-group-flush small">
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>Trà sữa matcha</span> <span className="fw-semibold">32 ly</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>Cà phê sữa đá</span> <span className="fw-semibold">25 ly</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span>Latte caramel</span> <span className="fw-semibold">19 ly</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h6 className="mb-2">Trạng thái bàn</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {["B1", "B2", "B3", "B4", "B5", "B6"].map((table, idx) => (
                                    <span
                                        key={table}
                                        className={
                                            "badge rounded-pill px-3 py-2 " +
                                            (idx < 3 ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary")
                                        }
                                    >
                    {table}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
