// src/pages/SalesPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import {
    createOrder,
    addOrderItem,
    decreaseOrderItem,
    fetchOrders,
    fetchProducts,
    updateOrderStatus,
    updateTableStatus,
    fetchTables,
    fetchPaymentMethods,
} from "../utils/api.js";
import { getAuth } from "../utils/auth.js";
import payCardQr from "../assets/QR.jpg";

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(value || 0));

const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : parsed.toLocaleString("vi-VN");
};

const createEmptyOrderForm = () => ({
    tableNumber: "",
    paymentMethodType: "",
    items: [{ productName: "", quantity: 1, notes: "" }],
});

export default function SalesPage() {
    const token = useMemo(() => getAuth()?.token, []);

    // --- State dữ liệu ---
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");

    const [allProducts, setAllProducts] = useState([]); // Dữ liệu gốc chứa giá chuẩn
    const [products, setProducts] = useState([]);

    const [tables, setTables] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    const [categories, setCategories] = useState(["all"]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [updatingTable, setUpdatingTable] = useState(false);
    const [closingOrderId, setClosingOrderId] = useState(null);
    const [orderForm, setOrderForm] = useState(() => createEmptyOrderForm());

    const [createOrderError, setCreateOrderError] = useState("");
    const [createOrderSuccess, setCreateOrderSuccess] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");

    // Panel QR Pay Card
    const [showQrPanel, setShowQrPanel] = useState(false);

    // Thêm/xóa món cho đơn đang mở
    const [itemForm, setItemForm] = useState({ productName: "", quantity: 1, notes: "" });
    const [itemUpdating, setItemUpdating] = useState(false);

    // --- Helper: Lấy giá sản phẩm ---
    const getProductPrice = (productName) => {
        const product = allProducts.find((p) => p.productName === productName);
        return product ? product.price : 0;
    };

    // --- API CALLS ---
    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const data = await fetchOrders(token);
            const sorted = Array.isArray(data)
                ? [...data].sort(
                    (a, b) =>
                        new Date(b.orderDate || 0) - new Date(a.orderDate || 0)
                )
                : [];
            setAllOrders(sorted);
            syncFilteredOrders(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            const data = await fetchProducts(token);
            const productList = Array.isArray(data) ? data : [];
            setAllProducts(productList);
            setProducts(productList);
            const uniqueCats = Array.from(
                new Set(productList.map((i) => i.categoryName).filter(Boolean))
            );
            setCategories(["all", ...uniqueCats]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingProducts(false);
        }
    };

    const loadTables = async () => {
        try {
            const data = await fetchTables(token);
            setTables(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            const data = await fetchPaymentMethods(token);
            setPaymentMethods(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token) {
            loadOrders();
            loadProducts();
            loadTables();
            loadPaymentMethods();
        }
    }, [token]);

    const syncFilteredOrders = (list, dateValue = selectedDate) => {
        let filtered = list;
        if (dateValue) {
            filtered = list.filter((order) => {
                const parsedDate = new Date(order.orderDate);
                if (Number.isNaN(parsedDate.getTime())) return false;
                const dateStr = parsedDate.toISOString().split("T")[0];
                return dateStr === dateValue;
            });
        }
        setOrders(filtered);
        if (
            !filtered.some((o) => o.orderId === selectedOrderId) &&
            filtered.length > 0
        ) {
            setSelectedOrderId(filtered[0].orderId);
        } else if (filtered.length === 0) {
            setSelectedOrderId(null);
        }
    };

    useEffect(() => {
        syncFilteredOrders(allOrders, selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        setItemForm({ productName: "", quantity: 1, notes: "" });
    }, [selectedOrderId]);

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setProducts(
            cat === "all"
                ? allProducts
                : allProducts.filter((p) => p.categoryName === cat)
        );
    };

    const selectedOrder =
        orders.find((o) => o.orderId === selectedOrderId) ||
        (orders.length ? orders[0] : null);

    const isPayCardMethod =
        (orderForm.paymentMethodType || "").toLowerCase() === "pay card";

    const availableTables = useMemo(
        () => tables.filter((t) => Number(t.status) !== 1),
        [tables]
    );

    useEffect(() => {
        setOrderForm((prev) => {
            if (!prev.tableNumber) return prev;
            const stillAvailable = availableTables.some(
                (t) =>
                    String(t.tableNumber ?? t.tableID) === String(prev.tableNumber)
            );
            return stillAvailable ? prev : { ...prev, tableNumber: "" };
        });
    }, [availableTables]);

    const updateItem = (idx, field, value) => {
        setOrderForm((prev) => {
            const nextItems = [...prev.items];
            nextItems[idx] = { ...nextItems[idx], [field]: value };
            return { ...prev, items: nextItems };
        });
    };

    const addItem = () =>
        setOrderForm((prev) => ({
            ...prev,
            items: [...prev.items, { productName: "", quantity: 1, notes: "" }],
        }));

    const removeItem = (idx) =>
        setOrderForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== idx),
        }));

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setCreateOrderError("");
        setCreateOrderSuccess("");
        setCreatingOrder(true);
        try {
            const payload = {
                tableNumber: orderForm.tableNumber,
                paymentMethodType: orderForm.paymentMethodType,
                items: orderForm.items
                    .map((i) => ({
                        productName: i.productName.trim(),
                        quantity: Number(i.quantity),
                        notes: i.notes?.trim(),
                    }))
                    .filter((i) => i.productName && i.quantity > 0),
            };
            if (!payload.items.length) throw new Error("Chưa chọn món nào");

            await createOrder(payload, token);
            setCreateOrderSuccess("Tạo đơn thành công!");
            setOrderForm(createEmptyOrderForm());
            setShowCreateModal(false);
            setShowQrPanel(false);
            await loadOrders();
            await loadTables();
        } catch (err) {
            setCreateOrderError(err.message || "Lỗi tạo đơn");
        } finally {
            setCreatingOrder(false);
        }
    };

    const handleCloseOrder = async (order) => {
        if (!window.confirm("Xác nhận thanh toán và đóng đơn?")) return;
        setClosingOrderId(order.orderId);
        try {
            await updateOrderStatus(order.orderId, "CLOSE", token);
            if (order.tableNumber)
                await updateTableStatus(order.tableNumber, 0, token);
            setActionMessage("Đã đóng đơn hàng thành công");
            await loadOrders();
            await loadTables();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setClosingOrderId(null);
        }
    };

    const handleMarkTableBusy = async () => {
        if (!selectedOrder?.tableNumber) return;
        setUpdatingTable(true);
        try {
            await updateOrderStatus(selectedOrder.orderId, "OPEN", token);
            await updateTableStatus(selectedOrder.tableNumber, 1, token);
            setActionMessage("Đã cập nhật trạng thái bàn thành BẬN");
            loadTables();
            loadOrders();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setUpdatingTable(false);
        }
    };

const handleAddItemToOrder = async (e) => {
        e?.preventDefault();
        if (!selectedOrderId) return;

        setActionError("");
        setActionMessage("");
        setItemUpdating(true);

        try {
            const payload = {
                productName: itemForm.productName,
                quantity: Number(itemForm.quantity),
                notes: itemForm.notes?.trim(),
            };

            if (!payload.productName || payload.quantity <= 0) {
                throw new Error("Chọn món và số lượng hợp lệ");
            }

            await addOrderItem(selectedOrderId, payload, token);
            setActionMessage("Đã thêm món vào đơn hàng");
            setItemForm({ productName: "", quantity: 1, notes: "" });
            await loadOrders();
        } catch (err) {
            setActionError(err.message || "Không thể thêm món");
        } finally {
            setItemUpdating(false);
        }
    };

    const handleDecreaseItem = async (productName) => {
        if (!selectedOrderId) return;

        setActionError("");
        setActionMessage("");
        setItemUpdating(true);

        try {
            await decreaseOrderItem(
                selectedOrderId,
                { productName, quantity: 1 },
                token
            );
            setActionMessage("Đã giảm số lượng món");
            await loadOrders();
        } catch (err) {
            setActionError(err.message || "Không thể giảm số lượng");
        } finally {
            setItemUpdating(false);
        }
    };
    return (
        <div>
            <PageHeader
                title="Bán hàng"
                subtitle="POS & Quản lý đơn hàng"
                right={
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={loadOrders}
                            disabled={loadingOrders}
                        >
                            <i className="bi bi-arrow-clockwise"></i> Tải lại
                        </button>
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => {
                                setCreateOrderError("");
                                setOrderForm(createEmptyOrderForm());
                                setShowCreateModal(true);
                                setShowQrPanel(false);
                            }}
                        >
                            + Tạo đơn mới
                        </button>
                    </div>
                }
            />

            <div className="row g-3">
                {/* 1. DANH SÁCH HÓA ĐƠN */}
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white border-bottom py-3">
                            <h6 className="mb-0">Hóa đơn ({orders.length})</h6>
                        </div>
                        <div className="p-2 bg-light border-bottom">
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div
                            className="list-group list-group-flush overflow-auto"
                            style={{ height: "65vh" }}
                        >
                            {orders.map((order) => (
                                <button
                                    key={order.orderId}
                                    onClick={() => setSelectedOrderId(order.orderId)}
                                    className={`list-group-item list-group-item-action ${
                                        selectedOrderId === order.orderId ? "active" : ""
                                    }`}
                                >
                                    <div className="d-flex w-100 justify-content-between align-items-center">
                    <span className="fw-bold">
                      Bàn {order.tableNumber || "#"}
                    </span>
                                        <span className="badge bg-white text-dark border">
                      {formatCurrency(order.totalAmount)}
                    </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                        <small
                                            className={
                                                selectedOrderId === order.orderId
                                                    ? "text-white-50"
                                                    : "text-muted"
                                            }
                                        >
                                            {formatDateTime(order.orderDate)}
                                        </small>
                                        <small
                                            className={`badge ${
                                                order.status === "CLOSE"
                                                    ? "bg-secondary"
                                                    : "bg-success"
                                            }`}
                                        >
                                            {order.status}
                                        </small>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. MENU SẢN PHẨM */}
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex flex-column">
                            <h6 className="mb-3">Thực đơn</h6>
                            <div
                                className="d-flex flex-nowrap overflow-auto gap-2 mb-3 pb-2"
                                style={{ scrollbarWidth: "thin" }}
                            >
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        className={`btn btn-sm flex-shrink-0 ${
                                            selectedCategory === cat
                                                ? "btn-success"
                                                : "btn-light border"
                                        }`}
                                    >
                                        {cat === "all" ? "Tất cả" : cat}
                                    </button>
                                ))}
                            </div>
                            <div
                                className="row g-2 overflow-auto"
                                style={{ flexGrow: 1, maxHeight: "60vh" }}
                            >
                                {loadingProducts ? (
                                    <p className="text-center w-100">Đang tải...</p>
                                ) : (
                                    products.map((p) => (
                                        <div className="col-6" key={p.productID}>
                                            <div className="border rounded p-2 d-flex gap-2 align-items-center bg-white h-100">
                                                <div
                                                    className="rounded bg-light border d-flex align-items-center justify-content-center"
                                                    style={{ width: 45, height: 45 }}
                                                >
                                                    {p.images?.[0] ? (
                                                        <img
                                                            src={p.images[0]}
                                                            className="w-100 h-100 object-fit-cover rounded"
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <i className="bi bi-cup"></i>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="fw-bold small text-truncate">
                                                        {p.productName}
                                                    </div>
                                                    <div className="text-success small fw-bold">
                                                        {formatCurrency(p.price)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. CHI TIẾT HÓA ĐƠN - ĐÃ SỬA LỖI 5 x 0 */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex flex-column">
                            <h6 className="border-bottom pb-2 mb-3">
                                Chi tiết bàn:{" "}
                                <span className="text-primary">
                  {selectedOrder?.tableNumber || "?"}
                </span>
                            </h6>

                            {actionMessage && (
                                <div className="alert alert-success py-1 small">
                                    {actionMessage}
                                </div>
                            )}
                            {actionError && (
                                <div className="alert alert-danger py-1 small">
                                    {actionError}
                                </div>
                            )}

                            {selectedOrder ? (
                                <>
                                    <div className="table-responsive flex-grow-1 mb-3">
                                        <table className="table table-sm table-borderless align-middle small">
                                            <thead className="bg-light text-secondary">
                                            <tr>
                                                <th>Món</th>
                                                <th className="text-center">Số lượng x Giá</th>
                                                <th className="text-end">Thành tiền</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedOrder.items?.map((item, idx) => {
                                                // [LOGIC SỬA LỖI]: Tìm giá đúng
                                                // Ưu tiên 1: Giá có sẵn trong đơn hàng (item.unitPrice)
                                                // Ưu tiên 2: Nếu bằng 0, tìm giá gốc trong Menu (allProducts)
                                                let displayPrice = item.unitPrice;

                                                if (!displayPrice || displayPrice === 0) {
                                                    const foundProduct = allProducts.find(
                                                        (p) => p.productName === item.productName
                                                    );
                                                    if (foundProduct) {
                                                        displayPrice = foundProduct.price;
                                                    }
                                                }

                                                // Tính lại thành tiền hiển thị nếu cần
                                                const displayTotal =
                                                    (displayPrice || 0) * item.quantity;

                                                return (
                                                    <tr
                                                        key={idx}
                                                        className="border-bottom border-light"
                                                    >
                                                        <td style={{ width: "40%" }}>
                                                            <div className="fw-semibold">
                                                                {item.productName}
                                                            </div>
                                                            {item.notes && (
                                                                <div
                                                                    className="text-muted fst-italic"
                                                                    style={{ fontSize: "0.85em" }}
                                                                >
                                                                    ({item.notes})
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-center text-muted">
                                      <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                                                                                      {selectedOrder.status === "OPEN" && (
                                                                                                          <button
                                                                                                              className="btn btn-outline-danger btn-sm"
                                                                                                              type="button"
                                                                                                              disabled={itemUpdating}
                                                                                                              onClick={() => handleDecreaseItem(item.productName)}
                                                                                                          >
                                                                                                              <i className="bi bi-dash"></i>
                                                                                                          </button>
                                                                                                      )}
                                                                                                      <span>
                                                                                                          {item.quantity} x{" "}
                                                                                                          {formatCurrency(displayPrice || 0)}
                                                                                                      </span>
                                                                                                  </div>
                                                        </td>
                                                        <td className="text-end fw-bold text-dark">
                                                            {formatCurrency(
                                                                item.lineTotal > 0
                                                                    ? item.lineTotal
                                                                    : displayTotal
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {selectedOrder.status === "OPEN" && (
                                        <form
                                            className="border rounded p-2 mb-3 bg-light"
                                            onSubmit={handleAddItemToOrder}
                                        >
                                            <div className="row g-2 align-items-end">
                                                <div className="col-6">
                                                    <label className="form-label small mb-1">Chọn món</label>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={itemForm.productName}
                                                        onChange={(e) =>
                                                            setItemForm((prev) => ({
                                                                ...prev,
                                                                productName: e.target.value,
                                                            }))
                                                        }
                                                    >
                                                        <option value="">-- Chọn món --</option>
                                                        {allProducts.map((p) => (
                                                            <option key={p.productID} value={p.productName}>
                                                                {p.productName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-3">
                                                    <label className="form-label small mb-1">Số lượng</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="form-control form-control-sm"
                                                        value={itemForm.quantity}
                                                        onChange={(e) =>
                                                            setItemForm((prev) => ({
                                                                ...prev,
                                                                quantity: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <div className="col-3 d-grid">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-success btn-sm"
                                                        disabled={itemUpdating}
                                                    >
                                                        + Thêm món
                                                    </button>
                                                </div>
                                                <div className="col-12">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Ghi chú (tuỳ chọn)"
                                                        value={itemForm.notes}
                                                        onChange={(e) =>
                                                            setItemForm((prev) => ({
                                                                ...prev,
                                                                notes: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    <div className="mt-auto pt-3 border-top">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <div className="text-muted">Tổng cộng:</div>
                                                <div className="small text-secondary">
                                                    Thanh toán:{" "}
                                                    {selectedOrder.paymentMethodType || "-"}
                                                </div>
                                            </div>
                                            <span className="fs-4 fw-bold text-success">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                                        </div>
                                        <div className="d-grid gap-2">
                                            {selectedOrder.status === "OPEN" && (
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleCloseOrder(selectedOrder)}
                                                    disabled={!!closingOrderId}
                                                >
                                                    {closingOrderId === selectedOrder.orderId
                                                        ? "Đang xử lý..."
                                                        : "Đóng đơn"}
                                                </button>
                                            )}
                                            {selectedOrder.status !== "CLOSE" ? (
                                                <button
                                                    className="btn btn-light border btn-sm"
                                                    onClick={handleMarkTableBusy}
                                                    disabled={updatingTable}
                                                >
                                                    Cập nhật trạng thái bàn
                                                </button>
                                            ) : (
                                                <div className="text-muted text-center small fst-italic">
                                                    Đơn đã đóng - không thể cập nhật trạng thái bàn
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-muted my-auto">
                                    Chọn hóa đơn để xem
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PANEL QR PAY CARD BÊN PHẢI */}
            {showQrPanel && (
                <div
                    className="position-fixed top-50 end-0 translate-middle-y me-3"
                    style={{ zIndex: 1060 }}
                >
                    <div className="card shadow-lg border-0" style={{ width: 280 }}>
                        <div className="card-header bg-success text-white py-2">
                            <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold small">
                  Thanh toán Pay Card
                </span>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white btn-sm"
                                    onClick={() => setShowQrPanel(false)}
                                ></button>
                            </div>
                        </div>
                        <div className="card-body text-center">
                            <div className="small text-muted mb-2">
                                Quét mã để chuyển khoản
                            </div>
                            <img
                                src={payCardQr}
                                alt="QR Pay Card"
                                className="img-fluid rounded mb-2"
                            />
                            <div className="small text-muted mb-3">
                                Vui lòng xác nhận sau khi đã chuyển khoản thành công.
                            </div>
                            <button
                                type="button"
                                className="btn btn-success w-100 mb-2"
                                onClick={() => {
                                    // Sau này muốn xử lý thêm (vd đánh dấu đã chuyển khoản) thì thêm logic ở đây
                                    setShowQrPanel(false);
                                }}
                            >
                                Chuyển khoản thành công
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm w-100"
                                onClick={() => setShowQrPanel(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TẠO ĐƠN */}
            {showCreateModal && (
                <div
                    className="modal fade show d-block"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">Thêm đơn hàng mới</h5>
                                <button
                                    className="btn-close btn-close-white"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowQrPanel(false);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {createOrderError && (
                                    <div className="alert alert-danger py-2">
                                        {createOrderError}
                                    </div>
                                )}
                                {createOrderSuccess && (
                                    <div className="alert alert-success py-2">
                                        {createOrderSuccess}
                                    </div>
                                )}

                                <form onSubmit={handleCreateOrder}>
                                    {/* HÀNG: BÀN + THANH TOÁN */}
                                    <div className="row g-3 mb-3">
                                        {/* BÀN SỐ */}
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">
                                                Bàn số
                                            </label>
                                            <select
                                                className="form-select"
                                                value={orderForm.tableNumber}
                                                required
                                                onChange={(e) =>
                                                    setOrderForm({
                                                        ...orderForm,
                                                        tableNumber: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">-- Chọn bàn --</option>
                                                {availableTables.length === 0 ? (
                                                    <option value="" disabled>
                                                        Không có bàn trống
                                                    </option>
                                                ) : (
                                                    availableTables.map((t) => (
                                                        <option
                                                            key={t.tableID}
                                                            value={t.tableNumber ?? t.tableID}
                                                        >
                                                            {t.tableNumber
                                                                ? `Bàn ${t.tableNumber}`
                                                                : t.tableName || t.tableID}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </div>

                                        {/* THANH TOÁN */}
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">
                                                Thanh toán
                                            </label>
                                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                                <select
                                                    className="form-select flex-fill"
                                                    value={orderForm.paymentMethodType}
                                                    required
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setOrderForm({
                                                            ...orderForm,
                                                            paymentMethodType: value,
                                                        });
                                                        setShowQrPanel(
                                                            value.toLowerCase() === "pay card"
                                                        );
                                                    }}
                                                >
                                                    <option value="">
                                                        -- Chọn phương thức --
                                                    </option>
                                                    {paymentMethods.map((pm) => (
                                                        <option
                                                            key={pm.paymentMethodID}
                                                            value={pm.paymentMethodType}
                                                        >
                                                            {pm.paymentMethodType}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CHI TIẾT MÓN */}
                                    <div className="bg-light p-3 rounded mb-3">
                                        <label className="form-label small fw-bold text-muted mb-2">
                                            Chi tiết món
                                        </label>
                                        {orderForm.items.map((item, idx) => {
                                            const itemUnitPrice = getProductPrice(
                                                item.productName
                                            );
                                            const itemTotal =
                                                (itemUnitPrice || 0) * item.quantity;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="row g-2 align-items-center mb-2"
                                                >
                                                    <div className="col-5">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={item.productName}
                                                            required
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    idx,
                                                                    "productName",
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value="">Chọn món...</option>
                                                            {allProducts.map((p) => (
                                                                <option
                                                                    key={p.productID}
                                                                    value={p.productName}
                                                                >
                                                                    {p.productName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-2">
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm text-center"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    idx,
                                                                    "quantity",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-2 text-end small fw-bold text-primary">
                                                        {item.productName
                                                            ? formatCurrency(itemTotal)
                                                            : "-"}
                                                    </div>
                                                    <div className="col-2">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Ghi chú"
                                                            value={item.notes}
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    idx,
                                                                    "notes",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-1 text-end">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm border-0"
                                                            onClick={() => removeItem(idx)}
                                                            disabled={orderForm.items.length === 1}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            className="btn text-success btn-link btn-sm text-decoration-none px-0"
                                            onClick={addItem}
                                        >
                                            + Thêm món khác
                                        </button>
                                    </div>

                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={creatingOrder}
                                        >
                                            {creatingOrder
                                                ? "Đang xử lý..."
                                                : "Lưu & Tạo Hóa Đơn"}
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
