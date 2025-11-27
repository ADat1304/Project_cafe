// src/components/Topbar.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getAuth } from "../utils/auth.js";
export default function Topbar() {
    const navigate = useNavigate();

    const auth = useMemo(() => getAuth(), []);
    const displayName = auth?.user?.fullname || auth?.user?.username || "Quản lý";
    const displayRole =
        (Array.isArray(auth?.user?.roles) && auth.user.roles.length
            ? auth.user.roles.join(", ")
            : auth?.user?.role) || "Chưa xác định";
    const tokenPreview = auth?.token ? `${auth.token.substring(0, 18)}...` : "Không có token";

    const handleLogout = () => {
        clearAuth();
        navigate("/login", { replace: true });
    };

    return (
        <header className="border-bottom bg-white px-3 py-2 d-flex align-items-center justify-content-between">
            <div className="fw-semibold">Xin chào, {displayName} 👋</div>
            <div className="d-flex align-items-center gap-3">

                <div className="position-relative">
                    <span className="bi bi-bell"></span>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"></span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <img
                        src="https://via.placeholder.com/32"
                        alt="avatar"
                        className="rounded-circle"
                    />
                    <div className="me-2">
                        <div className="small fw-semibold">{displayName}</div>
                        <div className="small text-muted">{displayRole}</div>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                        Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
}
