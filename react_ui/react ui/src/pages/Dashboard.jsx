// src/pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import {fetchOrders, fetchTables } from "../utils/api.js";
import { getAuth } from "../utils/auth.js";


const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

export default function DashboardPage() {
    const auth = getAuth();
    const token = useMemo(() => auth?.token, [auth]);
    const [tables, setTables] = useState([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [tableError, setTableError] = useState("");
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [orderError, setOrderError] = useState("");

    const loadTables = async () => {
        setLoadingTables(true);
        setTableError("");
        try {
            const data = await fetchTables(token);
            setTables(Array.isArray(data) ? data : []);
        } catch (err) {
            setTableError(err.message || "Không thể tải danh sách bàn");
        } finally {
            setLoadingTables(false);
        }
    };


    const loadOrders = async () => {
        setLoadingOrders(true);
        setOrderError("");
        try {
            const data = await fetchOrders(token);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setOrderError(err.message || "Không thể tải hóa đơn hôm nay");
        } finally {
            setLoadingOrders(false);
        }
    };
    useEffect(() => {
        loadTables();
        loadOrders();
    }, [token]);

    const isToday = (value) => {
        if (!value) return false;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return false;
        const now = new Date();
        return (
            parsed.getDate() === now.getDate() &&
            parsed.getMonth() === now.getMonth() &&
            parsed.getFullYear() === now.getFullYear()
        );
    };

    const todaysOrders = orders.filter((order) => isToday(order.orderDate));
    const totalRevenue = todaysOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const busyTables = tables.filter((table) => table.status === 1).length;

    const getBadgeClassByStatus = (status) => {
        if (status === 1) return "bg-secondary-subtle text-secondary";
        if (status === 0) return "bg-success-subtle text-success";
        return "bg-warning-subtle text-warning";
    };

    const getStatusLabel = (status) => {
        if (status === 1) return "Đang bận";
        if (status === 0) return "Trống";
        return "Không rõ";
    };
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
                <div className="col-md-4">
                    <StatCard
                        label="Doanh thu hôm nay"
                        value={loadingOrders ? "Đang tải..." : formatCurrency(totalRevenue)}
                        sub={orderError || (!loadingOrders && `${todaysOrders.length} hóa đơn`)}
                    />
                </div>
                <div className="col-md-4">
                    <StatCard
                        label="Số hóa đơn hôm nay"
                        value={loadingOrders ? "Đang tải..." : `${todaysOrders.length} hóa đơn`}
                        sub={orderError || "Tổng số đơn ghi nhận trong ngày"}
                    />
                </div>
                <div className="col-md-4">
                    <StatCard
                        label="Bàn đang phục vụ"
                        value={loadingTables ? "Đang tải..." : `${busyTables} / ${tables.length || 0}`}
                        sub={loadingTables
                            ? "Đang kiểm tra trạng thái bàn"
                            : tables.length
                                ? `${Math.round((busyTables / tables.length) * 100)}% công suất`
                                : "Chưa có dữ liệu bàn"}
                    />
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
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={loadTables} disabled={loadingTables}>
                                    <span className="bi bi-arrow-clockwise me-1"></span>Làm mới
                                </button>
                            </div>
                            {tableError && (
                                <div className="alert alert-danger py-2 small" role="alert">
                                    {tableError}
                                </div>
                            )}
                            {loadingTables ? (
                                <div className="text-muted small">Đang tải trạng thái bàn...</div>
                            ) : tables.length === 0 ? (
                                <div className="text-muted small">Chưa có dữ liệu bàn</div>
                            ) : (
                                <div className="d-flex flex-wrap gap-2">
                                    {tables.map((table) => (
                                        <span
                                            key={table.tableId || table.tableNumber}
                                            className={`badge rounded-pill px-3 py-2 ${getBadgeClassByStatus(table.status)}`}
                                            title={`Trạng thái: ${getStatusLabel(table.status)}`}
                                        >
                                            {table.tableNumber || "Bàn ?"}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
