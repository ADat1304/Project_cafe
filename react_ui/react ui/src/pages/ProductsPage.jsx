// src/pages/ProductsPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { fetchProducts } from "../utils/api.js";
import { getAuth } from "../utils/auth.js";

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const token = useMemo(() => getAuth()?.token, []);

    const loadProducts = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchProducts(token);
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [token]);

    return (
        <div>
            <PageHeader
                title="Sản phẩm / Menu"
                subtitle="Quản lý danh mục & món uống từ API gateway"
                right={
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={loadProducts} disabled={loading}>
                            <span className="bi bi-arrow-clockwise me-1"></span>
                            Làm mới
                        </button>
                        <button className="btn btn-success btn-sm" disabled>
                            + Thêm sản phẩm (gateway)
                        </button>
                    </div>
                }
            />

            {error && (
                <div className="alert alert-danger py-2" role="alert">
                    {error}
                </div>
            )}
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center text-muted py-4">Đang tải danh sách sản phẩm...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-muted py-4">Chưa có sản phẩm trong hệ thống</div>
                    ) : (
                        <table className="table table-hover table-sm align-middle">
                            <thead className="table-light">
                            <tr>
                                <th>Mã</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th className="text-end">Giá bán</th>
                                <th className="text-center">Tồn kho</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((product) => (
                                <tr key={product.productID}>
                                    <td className="text-muted small">{product.productID}</td>
                                    <td className="fw-semibold">{product.productName}</td>
                                    <td>{product.categoryName || "Chưa có danh mục"}</td>
                                    <td className="text-end">{formatCurrency(product.price)}</td>
                                    <td className="text-center">{product.amount ?? 0}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
