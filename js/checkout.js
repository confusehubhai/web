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
        const codFee = isUPI ? 0 : 89.00; // ₹89 COD fee if COD selected

        // Apply discount if coupon exists
        let discount = 0;
        const currentCoupon = StorageUtil.getAppliedCoupon();
        if (currentCoupon) {
            // Recalculate discount based on current subtotal
            discount = Math.min(subtotal * currentCoupon.discount, currentCoupon.maxDiscount);
            document.getElementById('couponMessage').textContent = `Coupon applied: ${currentCoupon.description}`;
            document.getElementById('couponMessage').className = 'coupon-message success';
        }

        const total = subtotal + tax + shipping + codFee - discount;

        // Update amounts
        document.querySelector('.subtotal .amount').textContent = `    ₹${subtotal.toFixed(2)}`;
        document.querySelector('.tax .amount').textContent = `    ₹${tax.toFixed(2)}`;
        document.querySelector('.shipping .amount').textContent = `    ₹${shipping.toFixed(2)}`;
        
        // Show/hide and update COD fee
        const codFeeElement = document.querySelector('.cod-fee');
        if (codFeeElement) {
            codFeeElement.style.display = isUPI ? 'none' : 'block';
            codFeeElement.querySelector('.amount').textContent = `    ₹${codFee.toFixed(2)}`;
        }
        
        // Update discount display
        if (discount > 0 && currentCoupon) {
            const discountHtml = `
                <div class="summary-item discount">
                    <span>Discount (${currentCoupon.code}):</span>
                    <span class="amount">    -₹${discount.toFixed(2)}</span>
                </div>`;
            
            let discountElement = document.querySelector('.discount');
            if (!discountElement) {
                document.querySelector('.order-total').insertAdjacentHTML('beforeend', discountHtml);
            } else {
                discountElement.querySelector('.amount').textContent = `    -₹${discount.toFixed(2)}`;
            }
        }

        // Calculate and update total
        document.querySelector('.total .amount').textContent = `    ₹${total.toFixed(2)}`;

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
async function placeOrder() {
    if (!CheckoutManager.validateOrder()) return;
    
    try {
        const cart = StorageUtil.getCart(); // Get cart here
        if (!cart || cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

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
        const codFee = paymentMethod === 'cod' ? 89.00 : 0;

        // Get coupon details
        const appliedCoupon = StorageUtil.getAppliedCoupon();
        const discount = appliedCoupon ? Math.min(subtotal * appliedCoupon.discount, appliedCoupon.maxDiscount) : 0;

        // Update total calculation including discount
        const total = subtotal + tax + shipping + codFee - discount;

        // Create order object with coupon details
        const order = {
            orderId: generateOrderId(),
            date: new Date().toISOString(),
            customer: customerDetails,
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl || item.image,
                size: item.size
            })),
            paymentMethod: paymentMethod,
            utr: utr,
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            codFee: codFee,
            coupon: appliedCoupon ? {
                code: appliedCoupon.code,
                discount: appliedCoupon.discount,
                discountAmount: discount
            } : null,
            discount: discount,
            total: total,
            status: 'Pending'
        };

        // Save order first
        console.log('Saving order:', order);
        StorageUtil.addOrder(order);

        // Prepare telegram message with enhanced coupon details
        const telegramMessage = `
🛍️ New Order Alert!
------------------
🆔 Order ID: ${order.orderId}
👤 Customer: ${order.customer.name}
📞 Phone: ${order.customer.phone}
📍 Complete Address:
${order.customer.address}
${order.customer.city}, ${order.customer.state}
PIN: ${order.customer.pincode}

🛒 Order Details:
${order.items.map(item => `• ${item.name} ${item.size ? `(Size: ${item.size})` : ''} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

💰 Order Summary:
• Subtotal: ₹${order.subtotal.toFixed(2)}
• Tax (8%): ₹${order.tax.toFixed(2)}
• Shipping: ₹${order.shipping.toFixed(2)}
${order.codFee ? `• COD Fee: ₹${order.codFee.toFixed(2)}\n` : ''}${order.coupon ? `
🎟️ Coupon Applied:
• Code: ${order.coupon.code}
• Discount Rate: ${(order.coupon.discount * 100).toFixed(0)}%
• Discount Amount: -₹${order.discount.toFixed(2)}` : ''}

💵 Total Amount: ₹${order.total.toFixed(2)}

💳 Payment Method: ${order.paymentMethod.toUpperCase()}
${order.utr ? `📝 UTR Number: ${order.utr}` : ''}
📊 Status: ${order.status}
------------------
Order placed on ${new Date().toLocaleString()}`;

        // Send telegram notification and handle redirect
        const notificationSent = await TelegramBot.sendMessage(telegramMessage);
        console.log('Telegram notification status:', notificationSent);
        
        // Clear cart and coupon
        StorageUtil.setCart([]);
        StorageUtil.removeAppliedCoupon();
        
        // Redirect to thanks page
        const params = new URLSearchParams({
            orderId: order.orderId,
            paymentMethod: order.paymentMethod,
            amount: order.total.toFixed(2)
        });
        
        window.location.href = `thanks.html?${params.toString()}`;
    } catch (error) {
        console.error('Error placing order:', error);
    }
}

function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${timestamp.slice(-6)}${random}`;
}
