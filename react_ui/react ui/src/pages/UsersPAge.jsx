function UsersPage({ users, token, onFetch, disabled }) {
    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <p className="eyebrow">/users</p>
                    <h2>Danh sách người dùng</h2>
                </div>
                <button type="button" onClick={onFetch} disabled={disabled('users')}>
                    {disabled('users') ? 'Đang tải...' : 'Tải qua Gateway'}
                </button>
            </div>

            {!token && <p className="muted">Cần token ADMIN để tải dữ liệu.</p>}

            <div className="list">
                {users.length === 0 ? (
                    <p className="muted">Chưa có dữ liệu người dùng. Đăng nhập và tải danh sách.</p>
                ) : (
                    users.map((user) => (
                        <div key={user.username} className="list-item">
                            <div>
                                <p className="title">{user.fullname || user.username}</p>
                                <p className="muted">{user.username}</p>
                            </div>
                            <div className="badges">
                                {(user.roles || []).map((role) => (
                                    <span key={role} className="badge secondary">
                                    {role}
                                  </span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default UsersPage;
