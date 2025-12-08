// src/pages/SalesPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { createOrder, fetchOrders, fetchProductsByCategory, updateOrderStatus, updateTableStatus, fetchTables, fetchPaymentMethods } from "../utils/api.js";
import { getAuth } from "../utils/auth.js";

const formatCurrency = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));
const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("vi-VN");
};

const createEmptyOrderForm = () => ({
    tableNumber: "",
    paymentMethodType: "",
    items: [{ productName: "", quantity: 1, notes: "" }],
});

export default function SalesPage() {
    const token = useMemo(() => getAuth()?.token, []);

    // State dữ liệu
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [tables, setTables] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    const [categories, setCategories] = useState(["all"]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Loading states
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingTables, setLoadingTables] = useState(false);

    // Selection & Modal states
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [updatingTable, setUpdatingTable] = useState(false);
    const [closingOrderId, setClosingOrderId] = useState(null);
    const [orderForm, setOrderForm] = useState(createEmptyOrderForm);

    // Errors & Messages
    const [orderError, setOrderError] = useState("");
    const [productError, setProductError] = useState("");
    const [createOrderError, setCreateOrderError] = useState("");
    const [createOrderSuccess, setCreateOrderSuccess] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");

    const sortOrdersByDate = (items) => [...items].sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

    // --- LOAD DATA ---

    const loadOrders = async () => {
        setLoadingOrders(true);
        setOrderError("");
        try {
            const data = await fetchOrders(token);
            const sorted = sortOrdersByDate(Array.isArray(data) ? data : []);
            setOrders(sorted);
            if (!sorted.some(o => o.orderId === selectedOrderId) && sorted.length) {
                setSelectedOrderId(sorted[0].orderId);
            }
        } catch (err) {
            setOrderError(err.message || "Không thể tải hóa đơn");
        } finally {
            setLoadingOrders(false);
        }
    };

    const loadProducts = async (categoryName = selectedCategory) => {
        setLoadingProducts(true);
        setProductError("");
        try {
            const normalizedCategory = categoryName || "all";
            const data = await fetchProductsByCategory(normalizedCategory, token);
            const productList = Array.isArray(data) ? data : [];
            setProducts(productList);

            if (normalizedCategory === "all") {
                const uniqueCats = Array.from(new Set(productList.map(i => i.categoryName).filter(Boolean)));
                setCategories(["all", ...uniqueCats]);
            }
        } catch (err) {
            setProductError(err.message || "Không thể tải sản phẩm");
        } finally {
            setLoadingProducts(false);
        }
    };

    const loadTables = async () => {
        setLoadingTables(true);
        try {
            const data = await fetchTables(token);
            setTables(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTables(false);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            const data = await fetchPaymentMethods(token);
            // Lấy trực tiếp danh sách từ DB, không can thiệp sửa đổi
            setPaymentMethods(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi tải phương thức thanh toán:", err);
        }
    };

    useEffect(() => {
        if(token) {
            loadOrders();
            loadProducts("all");
            loadTables();
            loadPaymentMethods();
        }
    }, [token]);

    // --- ACTIONS ---

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        loadProducts(cat);
    };

    const selectedOrder = orders.find(o => o.orderId === selectedOrderId) || (orders.length ? orders[0] : null);

    const updateItem = (idx, field, value) => {
        setOrderForm(prev => {
            const nextItems = prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
            return { ...prev, items: nextItems };
        });
    };
    const addItem = () => setOrderForm(prev => ({ ...prev, items: [...prev.items, { productName: "", quantity: 1, notes: "" }] }));
    const removeItem = (idx) => setOrderForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setCreateOrderError("");
        setCreateOrderSuccess("");
        setCreatingOrder(true);
        try {
            const payload = {
                tableNumber: orderForm.tableNumber,
                paymentMethodType: orderForm.paymentMethodType,
                items: orderForm.items.map(i => ({
                    productName: i.productName.trim(),
                    quantity: Number(i.quantity),
                    notes: i.notes?.trim()
                })).filter(i => i.productName && i.quantity > 0)
            };

            if (!payload.tableNumber) throw new Error("Vui lòng chọn bàn");
            if (!payload.paymentMethodType) throw new Error("Vui lòng chọn phương thức thanh toán");
            if (!payload.items.length) throw new Error("Cần ít nhất 1 sản phẩm");

            await createOrder(payload, token);
            setCreateOrderSuccess("Tạo hóa đơn thành công");
            setOrderForm(createEmptyOrderForm());
            setShowCreateModal(false);
            await loadOrders();
            await loadTables();
        } catch (err) {
            console.error(err);
            setCreateOrderError(err.message || "Lỗi tạo hóa đơn");
        } finally {
            setCreatingOrder(false);
        }
    };

    const handleCloseOrder = async (order) => {
        if (!window.confirm("Xác nhận đóng hóa đơn này?")) return;
        setClosingOrderId(order.orderId);
        try {
            await updateOrderStatus(order.orderId, "CLOSE", token);
            if (order.tableNumber) await updateTableStatus(order.tableNumber, 0, token);
            setActionMessage("Đã đóng hóa đơn thành công");
            await loadOrders();
            await loadTables();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setClosingOrderId(null);
        }
    };

    const handleMarkTableBusy = async () => {
        const tableRef = selectedOrder?.tableNumber;
        if (!tableRef) return setActionError("Không có số bàn");
        setUpdatingTable(true);
        try {
            await updateOrderStatus(selectedOrder.orderId, "OPEN", token);
            await updateTableStatus(tableRef, 1, token);
            setActionMessage(`Đã cập nhật bàn ${tableRef} sang trạng thái BẬN`);
            await loadOrders();
            await loadTables();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setUpdatingTable(false);
        }
    };

    return (
        <div>
            <PageHeader title="Bán hàng" subtitle="POS & Quản lý đơn hàng"
                right={
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={loadOrders} disabled={loadingOrders}><i className="bi bi-arrow-clockwise"></i> Đơn hàng</button>
                        <button className="btn btn-primary btn-sm" onClick={() => { setCreateOrderError(""); setOrderForm(createEmptyOrderForm()); setShowCreateModal(true); }}>+ Thêm Đơn</button>
                    </div>
                }
            />

            <div className="row g-3">
                {/* 1. List Hóa Đơn */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-0">
                            <div className="p-3 border-bottom d-flex justify-content-between">
                                <h6 className="mb-0">Hóa đơn ({orders.length})</h6>
                                {loadingOrders && <small>Đang tải...</small>}
                            </div>
                            <div className="list-group list-group-flush" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                                {orders.map(order => (
                                    <button key={order.orderId} onClick={() => setSelectedOrderId(order.orderId)}
                                        className={`list-group-item list-group-item-action ${selectedOrderId === order.orderId ? "active" : ""}`}>
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1">Bàn {order.tableNumber || "?"}</h6>
                                            <small>{formatCurrency(order.totalAmount)}</small>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className={selectedOrderId === order.orderId ? "text-white-50" : "text-muted"}>
                                                {formatDateTime(order.orderDate)}
                                            </small>
                                            <span className={`badge ${order.status === 'CLOSE' ? 'bg-secondary' : 'bg-success'}`}>{order.status}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Menu Sản Phẩm */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h6 className="mb-3">Menu Sản Phẩm</h6>
                            <div className="d-flex flex-wrap gap-2 mb-3">
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => handleCategoryChange(cat)}
                                        className={`btn btn-sm ${selectedCategory === cat ? "btn-success" : "btn-light border"}`}>
                                        {cat === 'all' ? 'Tất cả' : cat}
                                    </button>
                                ))}
                            </div>

                            {loadingProducts ? <div className="text-center py-3">Đang tải menu...</div> : (
                                <div className="row g-2" style={{maxHeight: '65vh', overflowY: 'auto'}}>
                                    {products.map(p => (
                                        <div className="col-12" key={p.productID}>
                                            <div className="border rounded p-2 d-flex gap-2 align-items-center bg-white hover-shadow">
                                                <div className="rounded bg-light d-flex align-items-center justify-content-center border"
                                                     style={{width: 56, height: 56, overflow: 'hidden', flexShrink: 0}}>
                                                    {p.images && p.images.length > 0 ? (
                                                        <img src={p.images[0]} alt={p.productName} className="w-100 h-100 object-fit-cover" />
                                                    ) : (
                                                        <i className="bi bi-cup-hot fs-4 text-muted"></i>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <div className="fw-semibold text-truncate">{p.productName}</div>
                                                    <div className="d-flex justify-content-between small text-muted">
                                                        <span>{p.categoryName}</span>
                                                        <span className="text-success fw-bold">{formatCurrency(p.price)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Chi Tiết Hóa Đơn */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h6 className="mb-3 border-bottom pb-2">Chi tiết đơn hàng</h6>
                            {selectedOrder ? (
                                <>
                                    {actionMessage && <div className="alert alert-success py-1 small">{actionMessage}</div>}
                                    {actionError && <div className="alert alert-danger py-1 small">{actionError}</div>}

                                    <div className="d-flex justify-content-between mb-2 small text-muted">
                                        <span>Bàn: <span className="fw-bold text-dark">{selectedOrder.tableNumber || "?"}</span></span>
                                        <span>Trạng thái: {selectedOrder.status}</span>
                                    </div>

                                    <div className="table-responsive mb-3" style={{flexGrow: 1}}>
                                        <table className="table table-sm table-borderless align-middle small">
                                            <thead className="border-bottom text-muted">
                                                <tr><th>Món</th><th className="text-center">SL</th><th className="text-end">Tiền</th></tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <tr key={idx} className="border-bottom border-light">
                                                        <td>
                                                            <div>{item.productName}</div>
                                                            {item.notes && <em className="text-muted" style={{fontSize: '0.8em'}}>{item.notes}</em>}
                                                        </td>
                                                        <td className="text-center fw-bold">{item.quantity}</td>
                                                        <td className="text-end">{formatCurrency(item.lineTotal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="d-flex justify-content-between fw-bold mb-3 fs-5">
                                            <span>Tổng tiền:</span>
                                            <span className="text-success">{formatCurrency(selectedOrder.totalAmount)}</span>
                                        </div>

                                        <div className="d-grid gap-2">
                                            {selectedOrder.status === 'OPEN' && (
                                                <button className="btn btn-success" onClick={() => handleCloseOrder(selectedOrder)} disabled={!!closingOrderId}>
                                                    {closingOrderId === selectedOrder.orderId ? "Đang xử lý..." : "Thanh toán & Đóng đơn"}
                                                </button>
                                            )}
                                            <button className="btn btn-outline-secondary btn-sm" onClick={handleMarkTableBusy} disabled={updatingTable}>
                                                Cập nhật trạng thái bàn
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-muted my-5">Chọn một hóa đơn để xem chi tiết</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Thêm Đơn */}
            {showCreateModal && (
                <div className="modal fade show d-block" style={{background: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Tạo đơn hàng mới</h5>
                                <button className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {createOrderError && <div className="alert alert-danger py-2 small">{createOrderError}</div>}
                                {createOrderSuccess && <div className="alert alert-success py-2 small">{createOrderSuccess}</div>}

                                <form onSubmit={handleCreateOrder}>
                                    <div className="row g-2 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small">Chọn Bàn</label>
                                            <select className="form-select" value={orderForm.tableNumber} required
                                                onChange={e => setOrderForm({...orderForm, tableNumber: e.target.value})}>
                                                <option value="">-- Chọn bàn --</option>
                                                {tables.map(t => (
                                                    <option key={t.tableId} value={t.tableNumber}>
                                                        Bàn {t.tableNumber} - {t.status === 0 ? 'Trống' : 'Bận'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* [ĐÃ SỬA] Hiển thị chính xác giá trị từ DB, không gán tên cứng */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small">Thanh toán</label>
                                            <select
                                                className="form-select"
                                                value={orderForm.paymentMethodType}
                                                onChange={e => setOrderForm({...orderForm, paymentMethodType: e.target.value})}
                                                required
                                            >
                                                <option value="">-- Chọn phương thức --</option>
                                                {paymentMethods.map(pm => (
                                                    <option key={pm.paymentMethodID} value={pm.paymentMethodType}>
                                                        {pm.paymentMethodType}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small">Danh sách món</label>
                                        {orderForm.items.map((item, idx) => (
                                            <div key={idx} className="d-flex gap-2 mb-2 align-items-start">
                                                <div style={{flex: 2}}>
                                                    <select className="form-select form-select-sm" value={item.productName} required
                                                        onChange={e => updateItem(idx, 'productName', e.target.value)}>
                                                        <option value="">Chọn món...</option>
                                                        {products.map(p => (
                                                            <option key={p.productID} value={p.productName}>{p.productName} - {formatCurrency(p.price)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{width: 70}}>
                                                    <input type="number" className="form-control form-control-sm" min="1" value={item.quantity}
                                                        onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                                </div>
                                                <div style={{flex: 1}}>
                                                    <input type="text" className="form-control form-control-sm" placeholder="Ghi chú" value={item.notes}
                                                        onChange={e => updateItem(idx, 'notes', e.target.value)} />
                                                </div>
                                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeItem(idx)} disabled={orderForm.items.length === 1}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-sm btn-outline-secondary w-100 border-dashed" onClick={addItem}>+ Thêm dòng</button>
                                    </div>

                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-success" disabled={creatingOrder}>
                                            {creatingOrder ? "Đang xử lý..." : "Hoàn tất & Tạo đơn"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}