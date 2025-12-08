import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
// Import thêm updateProduct và deleteProduct
import { createProduct, fetchProducts, fetchCategories, updateProduct, deleteProduct } from "../utils/api.js";
import { getAuth, getScopesFromToken } from "../utils/auth.js";

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState(""); // Đổi tên để dùng chung cho Create/Update
    const [actionSuccess, setActionSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false); // Đổi tên state creating -> submitting

    // State xác định chế độ sửa
    const [editingProduct, setEditingProduct] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [form, setForm] = useState({
        productName: "",
        price: "",
        amount: "",
        categoryName: "",
        images: "",
    });

    const token = useMemo(() => getAuth()?.token, []);
    const scopes = useMemo(() => getScopesFromToken(token), [token]);
    const isAdmin = scopes.includes("ADMIN"); // Chỉ admin mới có quyền

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

    const loadCategories = async () => {
        try {
            const data = await fetchCategories(token);
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn("Không thể tải danh mục:", err);
        }
    };

    useEffect(() => {
        if (token) {
            loadProducts();
            loadCategories();
        }
    }, [token]);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setForm(prev => ({ ...prev, images: file.name }));
        }
    };

    // Hàm chuẩn bị form để sửa
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setForm({
            productName: product.productName,
            price: product.price,
            amount: product.amount,
            categoryName: product.categoryName || "",
            // Nếu có ảnh, lấy ảnh đầu tiên gán vào (hoặc xử lý logic chuỗi ảnh tùy bạn)
            images: product.images && product.images.length > 0 ? product.images.join(",") : ""
        });
        // Nếu có ảnh online thì hiện preview
        if (product.images && product.images.length > 0) {
            setImagePreview(product.images[0]);
        } else {
            setImagePreview(null);
        }
        setActionError("");
        setActionSuccess("");
    };

    // Hàm hủy chế độ sửa
    const handleCancelEdit = () => {
        setEditingProduct(null);
        setForm({ productName: "", price: "", amount: "", categoryName: "", images: "" });
        setImagePreview(null);
        setActionError("");
        setActionSuccess("");
    };

    // Hàm xóa sản phẩm
    const handleDeleteClick = async (product) => {
        if (!window.confirm(`Bạn có chắc muốn xóa món "${product.productName}" không?`)) return;

        try {
            await deleteProduct(product.productID, token);
            alert("Đã xóa thành công!");
            loadProducts();
            // Nếu đang sửa món này thì hủy form
            if (editingProduct?.productID === product.productID) {
                handleCancelEdit();
            }
        } catch (err) {
            alert(err.message || "Xóa thất bại");
        }
    };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        setSubmitting(true);
        setActionError("");
        setActionSuccess("");

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

            if (editingProduct) {
                // Logic UPDATE
                await updateProduct(editingProduct.productID, payload, token);
                setActionSuccess("Cập nhật sản phẩm thành công");
                setEditingProduct(null); // Thoát chế độ sửa sau khi xong
            } else {
                // Logic CREATE
                await createProduct(payload, token);
                setActionSuccess("Tạo sản phẩm thành công");
            }

            // Reset form và load lại
            setForm({ productName: "", price: "", amount: "", categoryName: "", images: "" });
            setImagePreview(null);
            await loadProducts();
            await loadCategories();
        } catch (err) {
            setActionError(err.message || "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Sản phẩm / Menu"
                subtitle="Quản lý danh mục & món uống"
                right={
                    <button className="btn btn-outline-secondary btn-sm" onClick={loadProducts} disabled={loading}>
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Làm mới
                    </button>
                }
            />

            <div className="row g-3">
                {/* DANH SÁCH SẢN PHẨM */}
                <div className={isAdmin ? "col-lg-8" : "col-12"}>
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            {error && <div className="alert alert-danger py-2 small">{error}</div>}

                            {loading ? (
                                <div className="text-center text-muted py-4">Đang tải danh sách sản phẩm...</div>
                            ) : products.length === 0 ? (
                                <div className="text-center text-muted py-4">Chưa có sản phẩm trong hệ thống</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-sm align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{width: '60px'}}>Ảnh</th>
                                                <th>Tên sản phẩm</th>
                                                <th>Danh mục</th>
                                                <th className="text-end">Giá bán</th>
                                                <th className="text-center">Kho</th>
                                                {isAdmin && <th className="text-end">Thao tác</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((p) => (
                                                <tr key={p.productID} className={editingProduct?.productID === p.productID ? "table-active" : ""}>
                                                    <td>
                                                        <div className="rounded border bg-light d-flex align-items-center justify-content-center"
                                                             style={{width: 40, height: 40, overflow: 'hidden'}}>
                                                            {p.images && p.images.length > 0 ? (
                                                                <img src={p.images[0]} alt="" className="w-100 h-100 object-fit-cover"/>
                                                            ) : (
                                                                <i className="bi bi-cup-hot text-muted"></i>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="fw-semibold">
                                                        {p.productName}
                                                        {editingProduct?.productID === p.productID && <span className="badge bg-warning text-dark ms-2">Đang sửa</span>}
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border">
                                                            {p.categoryName || "Chưa phân loại"}
                                                        </span>
                                                    </td>
                                                    <td className="text-end fw-bold text-success">{formatCurrency(p.price)}</td>
                                                    <td className="text-center">{p.amount ?? 0}</td>
                                                    {isAdmin && (
                                                        <td className="text-end">
                                                            <div className="btn-group btn-group-sm">
                                                                <button
                                                                    className="btn btn-outline-primary"
                                                                    onClick={() => handleEditClick(p)}
                                                                    disabled={submitting}
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => handleDeleteClick(p)}
                                                                    disabled={submitting || editingProduct?.productID === p.productID}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FORM THÊM / SỬA (Chỉ Admin thấy) */}
                {isAdmin && (
                    <div className="col-lg-4">
                        <div className={`card shadow-sm border-0 h-100 ${editingProduct ? "border-warning" : ""}`}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                    <h6 className="mb-0">
                                        {editingProduct ? `Cập nhật: ${editingProduct.productName}` : "Thêm sản phẩm mới"}
                                    </h6>
                                    {editingProduct && (
                                        <button className="btn btn-xs btn-outline-secondary" onClick={handleCancelEdit}>
                                            <i className="bi bi-x-lg"></i> Hủy
                                        </button>
                                    )}
                                </div>

                                {actionError && <div className="alert alert-danger py-2 small">{actionError}</div>}
                                {actionSuccess && <div className="alert alert-success py-2 small">{actionSuccess}</div>}

                                <form id="product-form" className="small" onSubmit={handleSubmit}>
                                    <div className="mb-2">
                                        <label className="form-label fw-semibold">Tên sản phẩm</label>
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

                                    <div className="mb-2">
                                        <label className="form-label fw-semibold">Danh mục</label>
                                        <div className="input-group input-group-sm">
                                            <select
                                                className="form-select"
                                                name="categoryName"
                                                value={form.categoryName}
                                                onChange={handleChange}
                                            >
                                                <option value="">-- Chọn danh mục --</option>
                                                {categories.map((cat, index) => (
                                                    <option key={index} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm mt-1"
                                            placeholder="Hoặc nhập tên danh mục mới..."
                                            name="categoryName"
                                            value={form.categoryName} // Bind value để hiển thị khi edit
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="row g-2 mb-2">
                                        <div className="col-6">
                                            <label className="form-label fw-semibold">Giá bán (VNĐ)</label>
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
                                            <label className="form-label fw-semibold">Tồn kho</label>
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

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Hình ảnh</label>
                                        <input
                                            type="file"
                                            className="form-control form-control-sm"
                                            accept="image/*"
                                            onChange={handleImageFileChange}
                                        />
                                        {imagePreview ? (
                                            <div className="mt-2 text-center border rounded p-2 bg-light position-relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    style={{maxHeight: '150px', maxWidth: '100%', borderRadius: '4px'}}
                                                />
                                                <div className="text-muted mt-1 fst-italic text-truncate" style={{fontSize: '0.75rem'}}>
                                                    {form.images}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-center border border-dashed rounded p-3 bg-light text-muted">
                                                <i className="bi bi-image fs-4 d-block"></i>
                                                <small>Chưa chọn ảnh</small>
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button
                                            className={`btn btn-sm py-2 ${editingProduct ? "btn-warning" : "btn-success"}`}
                                            type="submit"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <i className={`bi ${editingProduct ? "bi-check-circle-fill" : "bi-plus-lg"} me-1`}></i>
                                                    {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
                                                </>
                                            )}
                                        </button>

                                        {editingProduct && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={handleCancelEdit}
                                                disabled={submitting}
                                            >
                                                Hủy bỏ
                                            </button>
                                        )}
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