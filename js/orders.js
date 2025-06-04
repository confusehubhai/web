function displayOrderSummary(order) {
    return `
        <div class="order-summary">
            <div class="summary-item">
                <span>Subtotal:</span>
                <span>    ₹${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Tax (8%):</span>
                <span>    ₹${order.tax.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Shipping:</span>
                <span>    ₹${order.shipping.toFixed(2)}</span>
            </div>
            ${order.codFee ? `
            <div class="summary-item">
                <span>COD Handling Fee:</span>
                <span>    ₹${order.codFee.toFixed(2)}</span>
            </div>` : ''}
            ${order.coupon ? `
            <div class="summary-item discount">
                <span>Discount (${order.coupon.code}):</span>
                <span>    -₹${order.discount.toFixed(2)}</span>
            </div>` : ''}
            <div class="summary-item total">
                <span>Total:</span>
                <span>    ₹${order.total.toFixed(2)}</span>
            </div>
        </div>
    `;
}

const OrdersManager = {
    loadOrders() {
        const orders = StorageUtil.getOrders() || [];
        const ordersContainer = document.getElementById('orders-list');
        const noOrdersMessage = document.getElementById('no-orders');
        
        if (orders.length === 0) {
            if (ordersContainer) ordersContainer.innerHTML = '';
            if (noOrdersMessage) noOrdersMessage.style.display = 'block';
            return;
        }

        if (noOrdersMessage) noOrdersMessage.style.display = 'none';
        
        if (ordersContainer) {
            ordersContainer.innerHTML = orders.map(order => `
                <div class="order-card" data-order-id="${order.orderId}">
                    <div class="order-header">
                        <h3>Order ID: ${order.orderId}</h3>
                        <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <div class="order-info">
                        <p>Date: ${new Date(order.date).toLocaleString()}</p>
                        <p>Payment: ${order.paymentMethod}</p>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <img src="${item.imageUrl}" alt="${item.name}">
                                <div class="item-details">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-quantity">x${item.quantity}</span>
                                    <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${displayOrderSummary(order)}
                </div>
            `).join('');
        }
    }
};

// Listen for status updates from the bot
window.addEventListener('orderStatusUpdated', (event) => {
    const { orderId, status } = event.detail;
    const statusElement = document.querySelector(`[data-order-id="${orderId}"] .order-status`);
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = `order-status ${status.toLowerCase()}`;
    }
});

// Initialize orders display when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    OrdersManager.loadOrders();
});
