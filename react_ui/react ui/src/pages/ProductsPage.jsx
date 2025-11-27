// src/pages/ProductsPage.jsx
import PageHeader from "../components/PageHeader.jsx";

export default function ProductsPage() {
    return (
        <div>
            <PageHeader
                title="Sản phẩm / Menu"
                subtitle="Quản lý danh mục & món uống"
                right={<button className="btn btn-success btn-sm">+ Thêm sản phẩm</button>}
            />
            <div className="card shadow-sm border-0">
                <div className="card-body">
                    <table className="table table-hover table-sm align-middle">
                        <thead className="table-light">
                        <tr>
                            <th>Mã</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá bán</th>
                            <th>Trạng thái</th>
                            <th width="120">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>SP001</td>
                            <td>Cà phê sữa đá</td>
                            <td>Cà phê</td>
                            <td>25.000 đ</td>
                            <td><span className="badge bg-success-subtle text-success">Đang bán</span></td>
                            <td>
                                <div className="btn-group btn-group-sm">
                                    <button className="btn btn-outline-secondary">Sửa</button>
                                    <button className="btn btn-outline-danger">Xóa</button>
                                </div>
                            </td>
                        </tr>
                        {/* thêm row khác */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
