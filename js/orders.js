const OrdersManager = {
    init() {
        console.log('Initializing Orders Manager');
        this.loadOrders();
        App.updateCartCount();
    },

    loadOrders() {
        console.log('Loading orders...');
        const orders = StorageUtil.getOrders() || [];
        console.log('Retrieved orders:', orders);
        
        const ordersList = document.getElementById('orders-list');
        const noOrders = document.getElementById('no-orders');

        if (!ordersList || !noOrders) {
            console.error('Required elements not found!');
            return;
        }

        if (!orders || orders.length === 0) {
            console.log('No orders found');
            ordersList.style.display = 'none';
            noOrders.style.display = 'block';
            return;
        }

        try {
            console.log(`Found ${orders.length} orders`);
            ordersList.style.display = 'block';
            noOrders.style.display = 'none';
            
            const orderCards = orders.map(order => {
                console.log('Creating card for order:', order);
                return this.createOrderCard(order);
            }).join('');
            
            console.log('Setting orders HTML');
            ordersList.innerHTML = orderCards;
        } catch (error) {
            console.error('Error displaying orders:', error);
            ordersList.innerHTML = '<div class="error-message">Error loading orders. Please try again.</div>';
        }
    },

    createOrderCard(order) {
        try {
            console.log('Creating order card for:', order);
            if (!order || !order.items) {
                console.error('Invalid order data:', order);
                return '';
            }

            const statusClass = `status-${(order.status || 'pending').toLowerCase()}`;
            
            // Map and log each item
            const items = order.items.map(item => {
                console.log('Processing order item:', item);
                if (!item) return '';
                
                const imageUrl = item.imageUrl || item.image || 'images/placeholder.jpg';
                return `
                    <div class="order-item">
                        <img src="${imageUrl}" alt="${item.name || 'Product'}" onerror="this.src='images/placeholder.jpg'">
                        <div class="item-details">
                            <div class="item-name">${item.name || 'Unknown Product'} × ${item.quantity || 1}</div>
                            <div class="item-price">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                        </div>
                    </div>
                `;
            }).join('');

            const orderCard = `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-id">#${order.orderId || 'Unknown'}</div>
                        <div class="order-date">${new Date(order.date || Date.now()).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</div>
                        <div class="order-status ${statusClass}">${order.status || 'Pending'}</div>
                    </div>
                    <div class="customer-info">
                        <h3>Delivery Details</h3>
                        <p><strong>${order.customer?.name || 'N/A'}</strong></p>
                        <p>${order.customer?.address || 'N/A'}</p>
                        <p>${order.customer?.city || 'N/A'}, ${order.customer?.state || 'N/A'} - ${order.customer?.pincode || 'N/A'}</p>
                        <p>Phone: ${order.customer?.phone || 'N/A'}</p>
                        <p>Email: ${order.customer?.email || 'N/A'}</p>
                    </div>
                    <div class="order-items">
                        ${items}
                    </div>
                    <div class="order-summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>₹${(order.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Tax (8%):</span>
                            <span>₹${(order.tax || 0).toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping:</span>
                            <span>₹${(order.shipping || 0).toFixed(2)}</span>
                        </div>
                        ${order.codFee ? `
                        <div class="summary-row">
                            <span>COD Fee:</span>
                            <span>₹${(order.codFee || 0).toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <div class="summary-row total">
                            <span>Total:</span>
                            <span>₹${(order.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="payment-info">
                        <div class="payment-method">Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}</div>
                        ${order.utr ? `<div class="utr-number">UTR: ${order.utr}</div>` : ''}
                    </div>
                </div>
            `;
            console.log('Generated order card HTML');
            return orderCard;
        } catch (error) {
            console.error('Error creating order card:', error);
            return '';
        }
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Orders Manager');
    OrdersManager.init();
});
