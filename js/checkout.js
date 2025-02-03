const CheckoutManager = {
    init() {
        this.loadOrderSummary();
        this.initPaymentMethodToggle();
        this.initQRCode();
        App.updateCartCount();
    },

    loadOrderSummary() {
        const cart = StorageUtil.getCart() || [];
        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        // Display order items
        const orderItemsContainer = document.querySelector('.order-items');
        orderItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <img src="${item.imageUrl}" alt="${item.name}">
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p>Quantity: ${item.quantity}</p>
                        <p class="price">₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });

        this.updateOrderTotal();
    },

    updateOrderTotal() {
        const cart = StorageUtil.getCart() || [];
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const shipping = 10.00; // ₹10 shipping
        const isUPI = document.querySelector('input[name="payment"][value="upi"]').checked;
        const codFee = isUPI ? 0 : 50.00; // ₹50 COD fee if COD selected

        // Update amounts
        document.querySelector('.subtotal .amount').textContent = `₹${subtotal.toFixed(2)}`;
        document.querySelector('.tax .amount').textContent = `₹${tax.toFixed(2)}`;
        document.querySelector('.shipping .amount').textContent = `₹${shipping.toFixed(2)}`;
        
        // Show/hide and update COD fee
        const codFeeElement = document.querySelector('.cod-fee');
        codFeeElement.style.display = isUPI ? 'none' : 'block';
        
        // Calculate and update total
        const total = subtotal + tax + shipping + codFee;
        document.querySelector('.total .amount').textContent = `₹${total.toFixed(2)}`;

        // Update QR code for UPI
        if (isUPI) {
            this.updateQRCode(total);
        }
    },

    initPaymentMethodToggle() {
        const paymentOptions = document.querySelectorAll('input[name="payment"]');
        const upiDetails = document.getElementById('upiDetails');
        const codDetails = document.getElementById('codDetails');
        const utrInput = document.getElementById('utr');

        paymentOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                const isUPI = e.target.value === 'upi';
                
                // Toggle sections
                upiDetails.style.display = isUPI ? 'block' : 'none';
                codDetails.style.display = isUPI ? 'none' : 'block';
                
                // Toggle UTR requirement
                if (utrInput) {
                    utrInput.required = isUPI;
                }

                // Update totals
                this.updateOrderTotal();
            });
        });
    },

    initQRCode() {
        const qrContainer = document.getElementById('qr-code');
        if (!qrContainer) return;

        this.qrCode = new QRCode(qrContainer, {
            text: this.getUPIString(0),
            width: 128,
            height: 128,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    },

    updateQRCode(amount) {
        if (this.qrCode) {
            this.qrCode.clear();
            this.qrCode.makeCode(this.getUPIString(amount));
        }
    },

    getUPIString(amount) {
        const upiId = 'vsingh@fam';
        return `upi://pay?pa=${upiId}&pn=ConfusedShop&am=${amount.toFixed(2)}&cu=INR`;
    },

    validateOrder() {
        const missingFields = [];

        // Check if cart is empty
        const cart = StorageUtil.getCart();
        if (!cart || cart.length === 0) {
            alert('Your cart is empty!');
            return false;
        }

        // Get all form fields
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const pincode = document.getElementById('pincode').value.trim();

        // Validate contact information
        if (!name) {
            missingFields.push('Name');
            document.getElementById('name').focus();
        }

        if (!email) {
            missingFields.push('Email');
            if (!name) document.getElementById('email').focus();
        } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            alert('Please enter a valid email address');
            document.getElementById('email').focus();
            return false;
        }

        if (!phone) {
            missingFields.push('Phone Number');
            if (!name && !email) document.getElementById('phone').focus();
        } else if (!phone.match(/^\d{10}$/)) {
            alert('Please enter a valid 10-digit phone number');
            document.getElementById('phone').focus();
            return false;
        }

        // Validate address
        if (!address) {
            missingFields.push('Address');
            if (!name && !email && !phone) document.getElementById('address').focus();
        }

        if (!city) {
            missingFields.push('City');
            if (!name && !email && !phone && !address) document.getElementById('city').focus();
        }

        if (!state) {
            missingFields.push('State');
            if (!name && !email && !phone && !address && !city) document.getElementById('state').focus();
        }

        if (!pincode) {
            missingFields.push('Pincode');
            if (!name && !email && !phone && !address && !city && !state) document.getElementById('pincode').focus();
        } else if (!pincode.match(/^\d{6}$/)) {
            alert('Please enter a valid 6-digit pincode');
            document.getElementById('pincode').focus();
            return false;
        }

        // Validate payment method
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        if (!paymentMethod) {
            missingFields.push('Payment Method');
        }

        // Show missing fields alert if any
        if (missingFields.length > 0) {
            const message = `Please fill in the following required fields:\n\n${missingFields.join('\n')}`;
            alert(message);
            return false;
        }

        // Validate UTR for UPI payment
        if (paymentMethod && paymentMethod.value === 'upi') {
            const utr = document.getElementById('utr').value.trim();
            if (!utr || !/^\d{12}$/.test(utr)) {
                alert('Please enter a valid 12-digit UTR number for UPI payment');
                document.getElementById('utr').focus();
                return false;
            }
        }

        return true;
    }
};

// Initialize checkout when page loads
document.addEventListener('DOMContentLoaded', () => {
    CheckoutManager.init();
});

// Global function for placing order
function placeOrder() {
    if (!CheckoutManager.validateOrder()) return;
    
    const cart = StorageUtil.getCart();
    if (!cart || cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    try {
        // Get customer details
        const customerDetails = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            state: document.getElementById('state').value.trim(),
            pincode: document.getElementById('pincode').value.trim()
        };

        // Get order details
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const utr = paymentMethod === 'upi' ? document.getElementById('utr').value.trim() : null;
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const shipping = 10.00;
        const codFee = paymentMethod === 'cod' ? 50.00 : 0;
        const total = subtotal + tax + shipping + codFee;

        // Create order object
        const order = {
            orderId: generateOrderId(),
            date: new Date().toISOString(),
            customer: customerDetails,
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl || item.image // Handle both imageUrl and image properties
            })),
            paymentMethod: paymentMethod,
            utr: utr,
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            codFee: codFee,
            total: total,
            status: 'Pending'
        };

        // Add status to order object
        order.status = 'Pending';
        
        console.log('Saving order:', order);
        StorageUtil.addOrder(order);

        console.log('Sending notification to Telegram...');
        TelegramBot.sendOrderNotification(order)
            .then(() => {
                console.log('Telegram notification sent successfully');
                
                // Clear cart and redirect only after notification is sent
                StorageUtil.setCart([]);
                
                const params = new URLSearchParams({
                    orderId: order.orderId,
                    paymentMethod: paymentMethod,
                    amount: total.toFixed(2)
                });
                
                window.location.href = `thanks.html?${params.toString()}`;
            })
            .catch(error => {
                console.error('Failed to send Telegram notification:', error);
                // Still redirect even if notification fails
                StorageUtil.setCart([]);
                const params = new URLSearchParams({
                    orderId: order.orderId,
                    paymentMethod: paymentMethod,
                    amount: total.toFixed(2)
                });
                window.location.href = `thanks.html?${params.toString()}`;
            });
    } catch (error) {
        console.error('Error placing order:', error);
        alert('There was an error placing your order. Please try again.');
    }
}

function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${timestamp.slice(-6)}${random}`;
}
