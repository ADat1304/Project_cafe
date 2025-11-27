// src/components/Topbar.jsx
export default function Topbar() {
    return (
        <header className="border-bottom bg-white px-3 py-2 d-flex align-items-center justify-content-between">
            <div className="fw-semibold">Xin chào, Quản lý 👋</div>
            <div className="d-flex align-items-center gap-3">
                <div className="position-relative">
                    <span className="bi bi-bell"></span>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3
          </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <img
                        src="https://via.placeholder.com/32"
                        alt="avatar"
                        className="rounded-circle"
                    />
                    <div>
                        <div className="small fw-semibold">Admin</div>
                        <div className="small text-muted">Quản trị viên</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
