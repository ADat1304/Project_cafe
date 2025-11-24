import { useState } from 'react';

const createEmptyOrderItem = () => ({ productName: '', quantity: 1, notes: '' });

function OrdersPage({ onCreate, disabled }) {
    const [orderForm, setOrderForm] = useState({ tableNumber: '', paymentMethodType: 'CASH' });
    const [orderItems, setOrderItems] = useState([createEmptyOrderItem()]);

    const updateOrderItem = (index, field, value) => {
        setOrderItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
    };

    const addOrderItem = () => setOrderItems((prev) => [...prev, createEmptyOrderItem()]);

    const removeOrderItem = (index) => {
        setOrderItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onCreate({ ...orderForm, items: orderItems });
        setOrderForm({ tableNumber: '', paymentMethodType: 'CASH' });
        setOrderItems([createEmptyOrderItem()]);
    };

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <p className="eyebrow">/orders</p>
                    <h2>Tạo đơn hàng</h2>
                </div>
                <p className="muted">Thêm món theo bàn</p>
            </div>
            <form className="form" onSubmit={handleSubmit}>
                <label>
                    Số bàn
                    <input
                        required
                        value={orderForm.tableNumber}
                        onChange={(e) => setOrderForm({ ...orderForm, tableNumber: e.target.value })}
                        placeholder="B01"
                    />
                </label>
                <label>
                    Phương thức thanh toán
                    <select
                        value={orderForm.paymentMethodType}
                        onChange={(e) => setOrderForm({ ...orderForm, paymentMethodType: e.target.value })}
                    >
                        <option value="CASH">Tiền mặt</option>
                        <option value="CARD">Thẻ</option>
                        <option value="TRANSFER">Chuyển khoản</option>
                    </select>
                </label>

                <div className="order-items">
                    {orderItems.map((item, index) => (
                        <div className="order-row" key={`item-${index}`}>
                            <input
                                required
                                value={item.productName}
                                onChange={(e) => updateOrderItem(index, 'productName', e.target.value)}
                                placeholder="Tên món"
                            />
                            <input
                                required
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                                placeholder="Số lượng"
                            />
                            <input
                                value={item.notes}
                                onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                                placeholder="Ghi chú"
                            />
                            <button type="button" className="ghost" onClick={() => removeOrderItem(index)}>
                                ✕
                            </button>
                        </div>
                    ))}
                    <button type="button" className="ghost" onClick={addOrderItem}>
                        + Thêm món
                    </button>
                </div>

                <button type="submit" disabled={disabled('order')}>
                    {disabled('order') ? 'Đang tạo...' : 'Gửi đơn hàng'}
                </button>
            </form>
        </div>
    );
}

export default OrdersPage;
