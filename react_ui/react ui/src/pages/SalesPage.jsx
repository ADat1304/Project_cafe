// src/pages/SalesPage.jsx
import PageHeader from "../components/PageHeader.jsx";

const mockTables = [
    { id: 1, name: "Bàn 1", status: "Đang phục vụ" },
    { id: 2, name: "Bàn 2", status: "Trống" },
    { id: 3, name: "Bàn 3", status: "Đã đặt trước" },
];

const mockProducts = [
    { id: 1, name: "Cà phê sữa", price: 25000 },
    { id: 2, name: "Trà đào cam sả", price: 39000 },
    { id: 3, name: "Matcha latte", price: 42000 },
];

const mockOrderLines = [
    { id: 1, name: "Cà phê sữa", qty: 2, price: 25000 },
    { id: 2, name: "Trà đào cam sả", qty: 1, price: 39000 },
];

export default function SalesPage() {
    const total = mockOrderLines.reduce((sum, l) => sum + l.qty * l.price, 0);

    return (
        <div>
            <PageHeader
                title="Bán hàng"
                subtitle="Tạo hóa đơn theo bàn"
                right={
                    <button className="btn btn-outline-success btn-sm">
                        Tạo hóa đơn mang đi
                    </button>
                }
            />

            <div className="row g-3">
                {/* Cột trái: danh sách bàn & filter */}
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 mb-3">
                        <div className="card-body">
                            <h6 className="mb-3">Danh sách bàn</h6>
                            <div className="d-flex flex-column gap-2">
                                {mockTables.map((t) => (
                                    <button
                                        key={t.id}
                                        className="btn btn-sm d-flex justify-content-between align-items-center btn-outline-success"
                                    >
                                        <span>{t.name}</span>
                                        <small className="text-muted">{t.status}</small>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <h6 className="mb-2">Ghi chú / Message</h6>
                            <textarea
                                className="form-control"
                                rows={4}
                                placeholder="Ví dụ: ít đá, không đường..."
                            />
                        </div>
                    </div>
                </div>

                {/* Cột giữa: menu sản phẩm */}
                <div className="col-md-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-3">
                                <h6 className="mb-0">Menu sản phẩm</h6>
                                <div className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Tìm kiếm..."
                                    />
                                    <select className="form-select form-select-sm" style={{ maxWidth: 150 }}>
                                        <option>Tất cả danh mục</option>
                                        <option>Cà phê</option>
                                        <option>Trà</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row g-2">
                                {mockProducts.map((p) => (
                                    <div className="col-6" key={p.id}>
                                        <button className="btn w-100 text-start border rounded-3">
                                            <div className="fw-semibold small mb-1">{p.name}</div>
                                            <div className="small text-success">{p.price.toLocaleString()} đ</div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: chi tiết hóa đơn */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <h6 className="mb-0">Hóa đơn - Bàn 1</h6>
                                <small className="text-muted">Mã HD: HD00123</small>
                            </div>

                            <table className="table table-sm align-middle">
                                <thead>
                                <tr className="small text-muted">
                                    <th>Sản phẩm</th>
                                    <th className="text-center">SL</th>
                                    <th className="text-end">Thành tiền</th>
                                </tr>
                                </thead>
                                <tbody>
                                {mockOrderLines.map((line) => (
                                    <tr key={line.id}>
                                        <td>{line.name}</td>
                                        <td className="text-center">
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary">-</button>
                                                <button className="btn btn-light">{line.qty}</button>
                                                <button className="btn btn-outline-secondary">+</button>
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            {(line.qty * line.price).toLocaleString()} đ
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <hr />

                            <div className="d-flex justify-content-between mb-2">
                                <span className="fw-semibold">Tổng cộng</span>
                                <span className="fw-bold text-success">
                  {total.toLocaleString()} đ
                </span>
                            </div>

                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary w-100">
                                    Lưu tạm
                                </button>
                                <button
                                    className="btn btn-success w-100"
                                    style={{ backgroundColor: "#03a66a", borderColor: "#03a66a" }}
                                >
                                    Thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
