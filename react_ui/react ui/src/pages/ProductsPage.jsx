// src/pages/ProductsPage.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { createProduct, fetchProducts } from "../utils/api.js";
import { getAuth,getScopesFromToken } from "../utils/auth.js";

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createError, setCreateError] = useState("");
    const [createSuccess, setCreateSuccess] = useState("");
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        productName: "",
        price: "",
        amount: "",
        categoryName: "",
        images: "",
    });
    const token = useMemo(() => getAuth()?.token, []);
    const scopes = useMemo(() => getScopesFromToken(token), [token]);
    const canCreateProduct = scopes.length > 0;

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

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (evt) => {
        evt.preventDefault();
        setCreating(true);
        setCreateError("");
        setCreateSuccess("");
        try {
            const payload = {
                productName: form.productName.trim(),
                price: Number(form.price || 0),
                amount: form.amount === "" ? null : Number(form.amount),
                categoryName: form.categoryName.trim() || undefined,
                images: form.images
                    .split(",")
                    .map((img) => img.trim())
                    .filter(Boolean),
            };
            await createProduct(payload, token);
            setCreateSuccess("Tạo sản phẩm thành công");
            setForm({ productName: "", price: "", amount: "", categoryName: "", images: "" });
            await loadProducts();
        } catch (err) {
            setCreateError(err.message || "Không thể thêm sản phẩm mới");
        } finally {
            setCreating(false);
        }
    };
    return (
        <div>
            <PageHeader
                title="Sản phẩm / Menu"
                subtitle="Quản lý danh mục & món uống "
                right={
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={loadProducts} disabled={loading}>
                            <span className="bi bi-arrow-clockwise me-1"></span>
                            Làm mới
                        </button>
                        {canCreateProduct && (
                            <button
                                className="btn btn-success btn-sm"
                                type="submit"
                                form="create-product-form"
                                disabled={creating}
                            >
                                {creating ? "Đang lưu..." : "+ Thêm sản phẩm"}
                            </button>
                        )}
                    </div>
                }
            />

            <div className="row g-3">
                <div className={canCreateProduct ? "col-lg-8" : "col-12"}>
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger py-2" role="alert">
                                    {error}
                                </div>
                            )}
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
                {canCreateProduct && (
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">
                                <h6 className="mb-2">Thêm sản phẩm mới</h6>
                                <p className="text-muted small mb-3">Gửi yêu cầu lên API gateway để tạo món mới.</p>
                                {createError && (
                                    <div className="alert alert-danger py-2 small" role="alert">
                                        {createError}
                                    </div>
                                )}
                                {createSuccess && (
                                    <div className="alert alert-success py-2 small" role="alert">
                                        {createSuccess}
                                    </div>
                                )}
                                <form id="create-product-form" className="small" onSubmit={handleCreate}>
                                    <div className="mb-2">
                                        <label className="form-label">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            name="productName"
                                            value={form.productName}
                                            onChange={handleChange}
                                            required
                                            placeholder="VD: Cà phê sữa đá"
                                        />
                                    </div>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="form-label">Giá bán (VND)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control form-control-sm"
                                                name="price"
                                                value={form.price}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Tồn kho</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control form-control-sm"
                                                name="amount"
                                                value={form.amount}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 mb-2">
                                        <label className="form-label">Danh mục</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            name="categoryName"
                                            value={form.categoryName}
                                            onChange={handleChange}
                                            placeholder="Trà, cà phê, sinh tố..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Ảnh (nhiều URL, cách nhau bởi dấu phẩy)</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            name="images"
                                            value={form.images}
                                            onChange={handleChange}
                                            placeholder="https://... , https://..."
                                        />
                                    </div>
                                    <div className="d-grid">
                                        <button className="btn btn-success btn-sm" type="submit" disabled={creating}>
                                            {creating ? "Đang lưu..." : "Lưu sản phẩm"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
