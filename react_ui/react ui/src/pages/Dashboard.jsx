// src/pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import {fetchDailyOrderStats, fetchTables } from "../utils/api.js";
import { getAuth } from "../utils/auth.js";


const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));
const DailyRevenueBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    const svgHeight = 260;
    const margin = { top: 24, right: 24, bottom: 40, left: 80 };
    const innerHeight = svgHeight - margin.top - margin.bottom;
    const innerWidth = Math.max(data.length * 72, 320);
    const svgWidth = innerWidth + margin.left + margin.right;

    const step = innerWidth / Math.max(data.length, 1);

    // 🔹 CỘT HẸP HƠN: 40% step, tối đa 30px
    const barWidth = Math.min(30, step * 0.4);

    const baselineY = margin.top + innerHeight;
    const ticks = [0.25, 0.5, 0.75, 1];


    const fontFamily = "'Be Vietnam Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    return (
        <div className="bg-light rounded p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold small">Bar Charts</span>
                <span className="text-muted small">Doanh số từng ngày</span>
            </div>

            <div className="position-relative" style={{ minHeight: svgHeight }}>
                <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Biểu đồ cột doanh thu 7 ngày"
                >
                    {/* Trục X */}
                    <line
                        x1={margin.left}
                        y1={baselineY}
                        x2={svgWidth - margin.right}
                        y2={baselineY}
                        stroke="#dee2e6"
                        strokeWidth="1.5"
                    />

                    {/* Trục Y */}
                    <line
                        x1={margin.left}
                        y1={margin.top}
                        x2={margin.left}
                        y2={baselineY}
                        stroke="#dee2e6"
                        strokeWidth="1.5"
                    />

                    {/* Tick + lưới ngang */}
                    {ticks.map((t) => {
                        const value = maxValue * t;
                        const y = margin.top + innerHeight * (1 - value / maxValue);

                        return (
                            <g key={t}>
                                <line
                                    x1={margin.left}
                                    y1={y}
                                    x2={svgWidth - margin.right}
                                    y2={y}
                                    stroke="#e9ecef"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={margin.left - 8}
                                    y={y + 3}
                                    textAnchor="end"
                                    fontSize="10"
                                    fill="#6c757d"
                                    style={{ fontFamily }}
                                >
                                    {formatCurrency(Math.round(value))}
                                </text>
                            </g>
                        );
                    })}

                    {/* Cột + nhãn ngày */}
                    {data.map((day, idx) => {
                        const ratio = day.value / maxValue;
                        const barHeight = day.value ? innerHeight * ratio : 0;
                        const x = margin.left + idx * step + (step - barWidth) / 2;
                        const y = baselineY - barHeight;
                        const centerX = x + barWidth / 2;

                        return (
                            <g key={day.key}>
                                {/* Cột */}
                                {day.value > 0 && (
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        rx="10"
                                        fill="#198754"
                                    >
                                        <title>{`${day.label}: ${formatCurrency(day.value)}`}</title>
                                    </rect>
                                )}

                                {/* Label tiền trên cột */}
                                {day.value > 0 && (
                                    <text
                                        x={centerX}
                                        y={y - 6}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="#495057"
                                        style={{ fontFamily }}
                                    >
                                        {formatCurrency(day.value)}
                                    </text>
                                )}

                                {/* Label ngày */}
                                <text
                                    x={centerX}
                                    y={baselineY + 16}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="#343a40"
                                    style={{ fontFamily }}
                                >
                                    {day.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {data.every((d) => d.value === 0) && (
                    <div className="text-center text-muted small mt-3">
                        Chưa có doanh thu trong 7 ngày qua
                    </div>
                )}
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const auth = getAuth();
    const token = useMemo(() => auth?.token, [auth]);
    const [tables, setTables] = useState([]);
    const [loadingTables, setLoadingTables] = useState(false);
    const [tableError, setTableError] = useState("");
    const [dailyStats, setDailyStats] = useState([]);
    const [loadingDailyStats, setLoadingDailyStats] = useState(false);
    const [dailyStatsError, setDailyStatsError] = useState("");
    const [todayStats, setTodayStats] = useState({ value: 0, count: 0 });

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


    const loadDailyStats = async () => {
        setLoadingDailyStats(true);
        setDailyStatsError("");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = Array.from({ length: 7 }, (_, idx) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - idx));
            return date;
        });


        try {
            const stats = await Promise.all(
                dates.map(async (date) => {
                    const iso = date.toISOString().slice(0, 10);
                    const response = await fetchDailyOrderStats(iso, token);
                    const amount = Number(response?.totalAmount ?? 0);
                    const count = Number(response?.orderCount ?? 0);
                    return {
                        key: iso,
                        label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
                        value: Number.isFinite(amount) ? amount : 0,
                        count: Number.isFinite(count) ? count : 0,
                    };
                })
            );

            setDailyStats(stats);
            const latest = stats[stats.length - 1] || { value: 0, count: 0 };
            setTodayStats({ value: latest.value, count: latest.count });
        } catch (err) {
            setDailyStatsError(err.message || "Không thể tải thống kê doanh thu");
            setDailyStats([]);
            setTodayStats({ value: 0, count: 0 });
        } finally {
            setLoadingDailyStats(false);
        }
    };
    useEffect(() => {
        loadTables();
        loadDailyStats();
    }, [token]);

    const todaysOrderCount = todayStats.count;
    const totalRevenue = todayStats.value;
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
    const dailyRevenue = useMemo(() => dailyStats, [dailyStats]);

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
                        value={loadingDailyStats ? "Đang tải..." : formatCurrency(totalRevenue)}
                        sub={dailyStatsError || (!loadingDailyStats && `${todaysOrderCount} hóa đơn`)}
                    />
                </div>
                <div className="col-md-4">
                    <StatCard
                        label="Số hóa đơn hôm nay"
                        value={loadingDailyStats ? "Đang tải..." : `${todaysOrderCount} hóa đơn`}
                        sub={dailyStatsError || "Tổng số đơn ghi nhận trong ngày"}
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

                            </div>

                            {dailyStatsError && (
                                <div className="alert alert-danger py-2 small" role="alert">
                                    {dailyStatsError}
                                </div>
                            )}

                            {loadingDailyStats ? (
                                <div className="text-muted small">Đang tải biểu đồ doanh thu...</div>
                            ) : (
                                <DailyRevenueBarChart data={dailyRevenue} />
                            )}
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
