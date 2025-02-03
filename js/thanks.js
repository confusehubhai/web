// Thanks page functionality
const ThanksManager = {
    init() {
        this.displayOrderDetails();
        App.updateCartCount();
    },

    displayOrderDetails() {
        // Get order details from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId') || this.generateOrderId();
        const paymentMethod = urlParams.get('paymentMethod') || 'UPI Payment';
        const amount = urlParams.get('amount') || '0.00';
        
        // Format the current date
        const orderDate = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Display the order details
        document.getElementById('order-id').textContent = orderId;
        document.getElementById('order-date').textContent = orderDate;
        document.getElementById('payment-method').textContent = 
            paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment';
        document.getElementById('amount-paid').textContent = `₹${amount}`;
    },

    generateOrderId() {
        // Generate a random order ID with current timestamp
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `ORD${timestamp.slice(-6)}${random}`;
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    ThanksManager.init();
});
