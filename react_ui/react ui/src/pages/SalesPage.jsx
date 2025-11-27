// src/pages/SalesPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import {createOrder, fetchOrders, fetchProducts, updateOrderStatus, updateTableStatus } from "../utils/api.js";
import { getAuth } from "../utils/auth.js";

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("vi-VN");
};
const createEmptyOrderForm = () => ({
    tableNumber: "",
    paymentMethodType: "CASH",
    items: [{ productName: "", quantity: 1, notes: "" }],
});


export default function SalesPage() {
    const token = useMemo(() => getAuth()?.token, []);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [orderError, setOrderError] = useState("");
    const [productError, setProductError] = useState("");
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [createOrderError, setCreateOrderError] = useState("");
    const [createOrderSuccess, setCreateOrderSuccess] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [orderForm, setOrderForm] = useState(createEmptyOrderForm);
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");
    const [closingOrderId, setClosingOrderId] = useState(null);
    const [updatingTable, setUpdatingTable] = useState(false);

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


    const updateItem = (idx, field, value) => {
        setOrderForm((prev) => {
            const nextItems = prev.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
            return { ...prev, items: nextItems };
        });
    };

    const addItem = () => {
        setOrderForm((prev) => ({ ...prev, items: [...prev.items, { productName: "", quantity: 1, notes: "" }] }));
    };

    const removeItem = (idx) => {
        setOrderForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    };

    const handleCreateOrder = async (evt) => {
        evt.preventDefault();
        setCreateOrderError("");
        setCreateOrderSuccess("");
        setCreatingOrder(true);
        try {
            const payload = {
                tableNumber: orderForm.tableNumber.trim(),
                paymentMethodType: orderForm.paymentMethodType || undefined,
                items: orderForm.items
                    .map((item) => ({
                        productName: item.productName.trim(),
                        quantity: Number(item.quantity || 0),
                        notes: item.notes?.trim() || undefined,
                    }))
                    .filter((item) => item.productName && item.quantity > 0),
            };

            if (!payload.items.length) {
                throw new Error("Nhập ít nhất 1 sản phẩm và số lượng hợp lệ");
            }

            await createOrder(payload, token);
            setCreateOrderSuccess("Tạo hóa đơn thành công");
            setOrderForm(createEmptyOrderForm());
            setShowCreateModal(false);
            await loadOrders();
        } catch (err) {
            setCreateOrderError(err.message || "Không thể tạo hóa đơn");
        } finally {
            setCreatingOrder(false);
        }
    };

    const handleMarkTableBusy = async () => {
        setActionError("");
        setActionMessage("");

        if (!selectedOrder?.tableNumber) {
            setActionError("Hóa đơn chưa có thông tin bàn");
            return;
        }

        setUpdatingTable(true);
        try {
            await updateTableStatus(selectedOrder.tableNumber, 1, token);
            setActionMessage(`Cập nhật bàn ${selectedOrder.tableNumber} sang trạng thái bận thành công`);
            await loadOrders();
        } catch (err) {
            setActionError(err.message || "Không thể cập nhật trạng thái bàn");
        } finally {
            setUpdatingTable(false);
        }
    };

    const handleCloseOrder = async (order) => {
        setActionError("");
        setActionMessage("");
        setClosingOrderId(order.orderId);
        try {
            await updateOrderStatus(order.orderId, "CLOSE", token);

            if (order.tableNumber) {
                await updateTableStatus(order.tableNumber, 0, token);
            }

            setActionMessage(`Đã chuyển hóa đơn ${order.orderId} sang trạng thái CLOSE`);
            await loadOrders();
        } catch (err) {
            setActionError(err.message || "Không thể cập nhật trạng thái hóa đơn");
        } finally {
            setClosingOrderId(null);
        }
    };
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
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                setCreateOrderError("");
                                setCreateOrderSuccess("");
                                setOrderForm(createEmptyOrderForm());
                                setShowCreateModal(true);
                            }}
                        >
                            <span className="bi bi-plus-lg me-1"></span>Thêm hóa đơn
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
                                                {order.status?.toUpperCase() === "OPEN" && (
                                                    <div className="mt-1">
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm w-100"
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCloseOrder(order);
                                                            }}
                                                            disabled={closingOrderId === order.orderId}
                                                        >
                                                            {closingOrderId === order.orderId ? "Đang đóng..." : "Đóng hóa đơn"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100 mb-3">
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
                                    {actionError && (
                                        <div className="alert alert-danger py-2 small" role="alert">{actionError}</div>
                                    )}
                                    {actionMessage && (
                                        <div className="alert alert-success py-2 small" role="alert">{actionMessage}</div>
                                    )}
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

                                    <div className="d-flex flex-column gap-2">
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-outline-secondary w-100"
                                                type="button"
                                                onClick={handleMarkTableBusy}
                                                disabled={updatingTable || !selectedOrder.tableNumber}
                                            >
                                                {updatingTable ? "Đang cập nhật..." : "Thành công (Bàn bận)"}
                                            </button>
                                            <button className="btn btn-outline-secondary w-100" disabled>
                                                Lưu tạm
                                            </button>
                                        </div>
                                        {selectedOrder.status?.toUpperCase() === "OPEN" && (
                                            <button
                                                className="btn btn-success w-100"
                                                style={{ backgroundColor: "#03a66a", borderColor: "#03a66a" }}
                                                onClick={() => handleCloseOrder(selectedOrder)}
                                                disabled={closingOrderId === selectedOrder.orderId}
                                            >
                                                {closingOrderId === selectedOrder.orderId ? "Đang đóng..." : "Đóng hóa đơn"}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showCreateModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Thêm hóa đơn</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setCreateOrderError("");
                                            setCreateOrderSuccess("");
                                        }}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p className="small text-muted mb-3">Gửi trực tiếp lên API gateway.</p>
                                    {createOrderError && (
                                        <div className="alert alert-danger py-2 small" role="alert">{createOrderError}</div>
                                    )}
                                    {createOrderSuccess && (
                                        <div className="alert alert-success py-2 small" role="alert">{createOrderSuccess}</div>
                                    )}
                                    <form className="small" onSubmit={handleCreateOrder}>
                                        <div className="row g-2 mb-2">
                                            <div className="col-6">
                                                <label className="form-label">Số bàn</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={orderForm.tableNumber}
                                                    onChange={(e) =>
                                                        setOrderForm((prev) => ({ ...prev, tableNumber: e.target.value }))
                                                    }
                                                    placeholder="VD: 12"
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label">Thanh toán</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={orderForm.paymentMethodType}
                                                    onChange={(e) =>
                                                        setOrderForm((prev) => ({ ...prev, paymentMethodType: e.target.value }))
                                                    }
                                                >
                                                    <option value="CASH">Tiền mặt</option>
                                                    <option value="CARD">Thẻ</option>
                                                    <option value="TRANSFER">Chuyển khoản</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <label className="form-label mb-0">Dòng sản phẩm</label>
                                                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={addItem}>
                                                    + Thêm dòng
                                                </button>
                                            </div>
                                            {orderForm.items.map((item, idx) => (
                                                <div key={idx} className="border rounded-3 p-2 mb-2">
                                                    <div className="d-flex gap-2 align-items-center mb-2">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={item.productName}
                                                            onChange={(e) => updateItem(idx, "productName", e.target.value)}
                                                        >
                                                            <option value="">Chọn sản phẩm</option>
                                                            {products.map((p) => (
                                                                <option key={p.productID} value={p.productName}>
                                                                    {p.productName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="form-control form-control-sm"
                                                            style={{ maxWidth: 90 }}
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                                                        />
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            disabled={orderForm.items.length === 1}
                                                        >
                                                            <span className="bi bi-trash"></span>
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Ghi chú"
                                                        value={item.notes}
                                                        onChange={(e) => updateItem(idx, "notes", e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="d-grid">
                                            <button className="btn btn-success btn-sm" type="submit" disabled={creatingOrder}>
                                                {creatingOrder ? "Đang tạo..." : "Lưu hóa đơn"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    );
}
