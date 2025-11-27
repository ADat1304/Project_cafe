// src/pages/SalesPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { fetchOrders, fetchProducts } from "../utils/api.js";
import { getAuth } from "../utils/auth.js";

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("vi-VN");
};
const mockOrderLines = [
    { id: 1, name: "Cà phê sữa", qty: 2, price: 25000 },
    { id: 2, name: "Trà đào cam sả", qty: 1, price: 39000 },
];

export default function SalesPage() {
    const token = useMemo(() => getAuth()?.token, []);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [orderError, setOrderError] = useState("");
    const [productError, setProductError] = useState("");
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const loadOrders = async () => {
        setLoadingOrders(true);
        setOrderError("");
        try {
            const data = await fetchOrders(token);
            setOrders(Array.isArray(data) ? data : []);
            if (!selectedOrderId && Array.isArray(data) && data.length) {
                setSelectedOrderId(data[0].orderId);
            }
        } catch (err) {
            setOrderError(err.message || "Không thể tải danh sách hóa đơn");
        } finally {
            setLoadingOrders(false);
        }
    };

    const loadProducts = async () => {
        setLoadingProducts(true);
        setProductError("");
        try {
            const data = await fetchProducts(token);
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            setProductError(err.message || "Không thể tải danh sách sản phẩm");
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        loadOrders();
        loadProducts();
    }, [token]);

    const selectedOrder =
        orders.find((order) => order.orderId === selectedOrderId) || (orders.length ? orders[0] : null);

    return (
        <div>
            <PageHeader
                title="Bán hàng"
                subtitle="Đọc dữ liệu hóa đơn và sản phẩm qua API gateway"
                right={
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={loadOrders} disabled={loadingOrders}>
                            <span className="bi bi-arrow-clockwise me-1"></span>Làm mới hóa đơn
                        </button>
                        <button className="btn btn-outline-success btn-sm" onClick={loadProducts} disabled={loadingProducts}>
                            <span className="bi bi-arrow-repeat me-1"></span>Làm mới sản phẩm
                        </button>
                    </div>
                }
            />

            <div className="row g-3">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">Hóa đơn (gateway)</h6>
                                {loadingOrders && <span className="text-muted small">Đang tải...</span>}
                            </div>
                            {orderError && (
                                <div className="alert alert-danger py-2 small" role="alert">
                                    {orderError}
                                </div>
                            )}
                            {!loadingOrders && orders.length === 0 ? (
                                <div className="text-muted small">Chưa có hóa đơn nào</div>
                            ) : (
                                <div className="list-group list-group-flush small">
                                    {orders.map((order) => (
                                        <button
                                            key={order.orderId}
                                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                                                selectedOrderId === order.orderId ? "active" : ""
                                            }`}
                                            onClick={() => setSelectedOrderId(order.orderId)}
                                            disabled={loadingOrders}
                                        >
                                            <div>
                                                <div className="fw-semibold">Bàn {order.tableNumber || order.tableId || "?"}</div>
                                                <div className="text-muted">{formatDateTime(order.orderDate)}</div>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-semibold">{formatCurrency(order.totalAmount)}</div>
                                                <span className="badge bg-success-subtle text-success text-uppercase">
                                                    {order.status || "N/A"}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Menu sản phẩm</h6>
                                {loadingProducts && <span className="text-muted small">Đang tải...</span>}
                            </div>
                            {productError && (
                                <div className="alert alert-danger py-2 small" role="alert">
                                    {productError}
                                </div>
                            )}
                            {!loadingProducts && products.length === 0 ? (
                                <div className="text-muted small">Chưa có sản phẩm</div>
                            ) : (
                                <div className="row g-2">
                                    {products.map((p) => (
                                        <div className="col-12" key={p.productID}>
                                            <div className="border rounded-3 p-2">
                                                <div className="fw-semibold small">{p.productName}</div>
                                                <div className="d-flex justify-content-between text-muted small">
                                                    <span>{p.categoryName || "Không có danh mục"}</span>
                                                    <span className="text-success fw-semibold">{formatCurrency(p.price)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <h6 className="mb-0">Chi tiết hóa đơn</h6>
                                {selectedOrder && (
                                    <small className="text-muted">Mã: {selectedOrder.orderId}</small>
                                )}
                            </div>
                            {!selectedOrder ? (
                                <div className="text-muted small">Chọn một hóa đơn để xem chi tiết</div>
                            ) : (
                                <>
                                <div className="d-flex justify-content-between mb-2 small text-muted">
                                    <span>Bàn: {selectedOrder.tableNumber || selectedOrder.tableId || "?"}</span>
                                    <span>Trạng thái: {selectedOrder.status || "N/A"}</span>
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
                                    {selectedOrder.items?.length ? (
                                        selectedOrder.items.map((line, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="fw-semibold">{line.productName}</div>
                                                    {line.notes && (
                                                        <div className="text-muted small">{line.notes}</div>
                                                    )}
                                                </td>
                                                <td className="text-center">{line.quantity}</td>
                                                <td className="text-end">{formatCurrency(line.lineTotal)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center text-muted small">
                                                Chưa có dòng hàng
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>

                           <hr/>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="fw-semibold">Tổng cộng</span>
                                        <span className="fw-bold text-success">
                                            {formatCurrency(selectedOrder.totalAmount)}
                                        </span>
                                    </div>

                                    <div className="small text-muted mb-2">
                                        Phương thức thanh toán: {selectedOrder.paymentMethodType || "Chưa xác định"}
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button className="btn btn-outline-secondary w-100" disabled>
                                            Lưu tạm
                                        </button>
                                        <button
                                            className="btn btn-success w-100"
                                            style={{ backgroundColor: "#03a66a", borderColor: "#03a66a" }}
                                            disabled
                                        >
                                            Thanh toán
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
