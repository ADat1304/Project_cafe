import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { createUser, deleteUser, fetchUsers, updateUser } from "../utils/api.js";
import { getAuth, hasScope } from "../utils/auth.js";

const formatRoles = (roles) => {
    if (Array.isArray(roles)) return roles.join(", ");
    if (typeof roles === "string") return roles;
    return "USER";
};

export default function EmployeesPage() {
    const auth = useMemo(() => getAuth(), []);
    const token = auth?.token;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ username: "", password: "", role: "USER", fullname: "" });

    const isAdmin = useMemo(() => hasScope(["ADMIN"], token), [token]);

    const loadUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchUsers(token);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    const resetForm = () => {
        setForm({ username: "", password: "", role: "USER", fullname: "" });
        setEditingUser(null);
    };

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        setSubmitting(true);
        setFormError("");
        setSuccess("");

        try {
            if (editingUser) {
                await updateUser(editingUser.id || editingUser.userId || editingUser.username, {
                    password: form.password || undefined,
                    fullname: form.fullname || undefined,
                    roles: form.role ? [form.role] : undefined,
                }, token);
                setSuccess("Cập nhật người dùng thành công");
            } else {
                await createUser({
                    username: form.username.trim(),
                    password: form.password,
                    fullname: form.fullname || form.username,
                    roles: form.role ? [form.role] : undefined,
                }, token);
                setSuccess("Tạo người dùng thành công");
            }

            resetForm();
            await loadUsers();
        } catch (err) {
            setFormError(err.message || "Không thể lưu thông tin người dùng");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setForm({
            username: user.username || user.userName || "",
            password: "",
            role: Array.isArray(user.roles) && user.roles.length ? user.roles[0] : user.role || "USER",
            fullname: user.fullname || user.fullName || "",
        });
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Xác nhận xóa tài khoản ${user.username || user.userName}?`)) return;

        setSubmitting(true);
        setFormError("");
        setSuccess("");
        try {
            await deleteUser(user.id || user.userId || user.username, token);
            setSuccess("Đã xóa người dùng");
            if (editingUser && (editingUser.id === user.id || editingUser.username === user.username)) {
                resetForm();
            }
            await loadUsers();
        } catch (err) {
            setFormError(err.message || "Không thể xóa người dùng");
        } finally {
            setSubmitting(false);
        }
    };

    const renderId = (user) => user.id || user.userId || user.userID || user.username;
    const renderUsername = (user) => user.username || user.userName || user.userID;
    const renderPassword = (user) => user.password || user.passWord || "(ẩn)";

    if (!isAdmin) {
        return (
            <div>
                <PageHeader title="Nhân Viên" subtitle="Quản lý tài khoản người dùng" />
                <div className="alert alert-warning" role="alert">
                    Chỉ có ADMIN mới được truy cập trang này
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Nhân Viên"
                subtitle="Quản lý tài khoản, vai trò và quyền truy cập"
                right={
                    <button className="btn btn-outline-secondary btn-sm" onClick={loadUsers} disabled={loading}>
                        <span className="bi bi-arrow-clockwise me-1"></span>
                        Làm mới
                    </button>
                }
            />

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <div className="row g-3">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center text-muted py-4">Đang tải danh sách người dùng...</div>
                            ) : users.length === 0 ? (
                                <div className="text-center text-muted py-4">Chưa có người dùng trong hệ thống</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-sm align-middle">
                                        <thead className="table-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Tài khoản</th>
                                            <th>Mật khẩu</th>
                                            <th>Vai trò</th>
                                            <th className="text-end">Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {users.map((user) => (
                                            <tr key={renderId(user)}>
                                                <td className="text-muted small">{renderId(user)}</td>
                                                <td className="fw-semibold">{renderUsername(user)}</td>
                                                <td>{renderPassword(user)}</td>
                                                <td>{formatRoles(user.roles || user.role)}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary"
                                                            onClick={() => handleEdit(user)}
                                                            disabled={submitting}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(user)}
                                                            disabled={submitting}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h6 className="mb-2">{editingUser ? "Cập nhật tài khoản" : "Thêm tài khoản"}</h6>
                            <p className="text-muted small mb-3">
                                Các nút thao tác sẽ gửi yêu cầu tới gateway để tạo, sửa hoặc xóa người dùng.
                            </p>

                            {formError && (
                                <div className="alert alert-danger py-2 small" role="alert">
                                    {formError}
                                </div>
                            )}
                            {success && (
                                <div className="alert alert-success py-2 small" role="alert">
                                    {success}
                                </div>
                            )}

                            <form className="small" onSubmit={handleSubmit}>
                                {!editingUser && (
                                    <div className="mb-2">
                                        <label className="form-label">Tài khoản</label>
                                        <input
                                            type="text"
                                            name="username"
                                            className="form-control form-control-sm"
                                            value={form.username}
                                            onChange={handleChange}
                                            required
                                            disabled={submitting}
                                        />
                                    </div>
                                )}

                                <div className="mb-2">
                                    <label className="form-label">Mật khẩu</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control form-control-sm"
                                        value={form.password}
                                        onChange={handleChange}
                                        required={!editingUser}
                                        placeholder={editingUser ? "Để trống nếu không đổi" : ""}
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Họ tên</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        className="form-control form-control-sm"
                                        value={form.fullname}
                                        onChange={handleChange}
                                        placeholder="Tên hiển thị"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Vai trò</label>
                                    <input
                                        type="text"
                                        name="role"
                                        className="form-control form-control-sm"
                                        value={form.role}
                                        onChange={handleChange}
                                        placeholder="ADMIN hoặc USER"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-success btn-sm" disabled={submitting}>
                                        {submitting
                                            ? "Đang gửi..."
                                            : editingUser
                                                ? "Lưu thay đổi"
                                                : "Thêm người dùng"}
                                    </button>
                                    {editingUser && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={resetForm}
                                            disabled={submitting}
                                        >
                                            Hủy
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
