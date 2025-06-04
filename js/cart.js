// Cart management
const CartManager = {
    init() {
        this.displayCartItems();
        this.initEventListeners();
        App.updateCartCount(); // Use App.updateCartCount instead
    },

    displayCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cart = StorageUtil.getCart() || [];

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>Go back to the shop and add some products!</p>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = '';
        cart.forEach(cartItem => {
            const itemElement = this.createCartItemElement(cartItem);
            cartItemsContainer.appendChild(itemElement);
        });

        this.updateCartSummary();
    },

    createCartItemElement(cartItem) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${cartItem.imageUrl}" alt="${cartItem.name}">
            <div class="cart-item-details">
                <span class="cart-item-title">${cartItem.name}</span>
                <span class="cart-item-price">₹${cartItem.price.toFixed(2)}</span>
                ${cartItem.size ? `<span class="cart-item-size">Size: ${cartItem.size}</span>` : ''}
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-product-id="${cartItem.productId}">-</button>
                    <input type="number" value="${cartItem.quantity}" min="1" class="quantity-input" data-product-id="${cartItem.productId}" readonly>
                    <button class="quantity-btn plus" data-product-id="${cartItem.productId}">+</button>
                </div>
            </div>
            <button class="remove-item" data-product-id="${cartItem.productId}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        return div;
    },

    updateCartSummary() {
        const cart = StorageUtil.getCart() || [];
        const SHIPPING_COST = 10.00;
        const TAX_RATE = 0.08;
        
        const subtotal = cart.reduce((sum, cartItem) => {
            return sum + (cartItem.price * cartItem.quantity);
        }, 0);

        const tax = subtotal * TAX_RATE;
        let discount = 0;

        // Apply discount if coupon exists
        const currentCoupon = StorageUtil.getAppliedCoupon();
        if (currentCoupon) {
            // Recalculate discount amount based on current subtotal
            discount = Math.min(subtotal * currentCoupon.discount, currentCoupon.maxDiscount);
            currentCoupon.discountAmount = discount; // Update discount amount
            StorageUtil.setAppliedCoupon(currentCoupon); // Save updated coupon
            
            document.getElementById('couponMessage').textContent = `Coupon applied: ${currentCoupon.description}`;
            document.getElementById('couponMessage').className = 'coupon-message success';
            
            // Update coupon button state
            const couponInput = document.getElementById('couponCode');
            const applyCouponBtn = document.getElementById('applyCoupon');
            if (couponInput && applyCouponBtn) {
                couponInput.value = currentCoupon.code;
                couponInput.disabled = true;
                applyCouponBtn.textContent = 'Remove';
                applyCouponBtn.classList.add('remove-coupon');
            }
        }

        const total = subtotal + tax + SHIPPING_COST - discount;

        // Update DOM elements
        document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('cart-tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('cart-shipping').textContent = `₹${SHIPPING_COST.toFixed(2)}`;

        // Update discount display
        const discountDiv = document.querySelector('.summary-item.discount');
        if (discount > 0 && currentCoupon) {
            if (!discountDiv) {
                const discountHtml = `
                    <div class="summary-item discount">
                        <span>Discount (${currentCoupon.code}):</span>
                        <span>-₹${discount.toFixed(2)}</span>
                    </div>`;
                document.querySelector('.cart-summary .total').insertAdjacentHTML('beforebegin', discountHtml);
            } else {
                discountDiv.querySelector('span:last-child').textContent = `-₹${discount.toFixed(2)}`;
            }
        } else if (discountDiv) {
            discountDiv.remove();
        }

        document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
        App.updateCartCount();
    },

    updateOrderTotal() {
        const cart = StorageUtil.getCart() || [];
        const subtotal = cart.reduce((sum, cartItem) => {
            return sum + (cartItem.price * cartItem.quantity);
        }, 0);

        const tax = subtotal * 0.08; // 8% tax
        const shipping = 10.00; // ₹10 shipping

        // Apply discount if coupon is present
        let discount = 0;
        const currentCoupon = CouponManager.getCurrentCoupon();
        if (currentCoupon) {
            discount = currentCoupon.discountAmount;
        }

        // Calculate final total
        const total = subtotal + tax + shipping - discount;

        // Update DOM elements
        document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('cart-tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('cart-shipping').textContent = `₹${shipping.toFixed(2)}`;
        
        // Update discount display
        const discountElement = document.getElementById('cart-discount');
        if (discount > 0) {
            if (!discountElement) {
                const discountHtml = `
                    <div class="summary-item discount">
                        <span>Discount (${currentCoupon.code}):</span>
                        <span id="cart-discount">-₹${discount.toFixed(2)}</span>
                    </div>`;
                document.querySelector('.cart-summary').insertBefore(
                    createElementFromHTML(discountHtml),
                    document.querySelector('.summary-item.total')
                );
            } else {
                discountElement.textContent = `-₹${discount.toFixed(2)}`;
            }
        } else if (discountElement) {
            discountElement.parentElement.remove();
        }

        document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
    },

    updateItemQuantity(productId, delta) {
        const cart = StorageUtil.getCart() || [];
        const itemIndex = cart.findIndex(item => item.productId === productId);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity += delta;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            StorageUtil.setCart(cart);
            this.displayCartItems();
            App.updateCartCount(); // Use App.updateCartCount instead
        }
    },

    removeItem(productId) {
        const cart = StorageUtil.getCart() || [];
        const updatedCart = cart.filter(item => item.productId !== productId);
        StorageUtil.setCart(updatedCart);
        this.displayCartItems();
        App.updateCartCount(); // Use App.updateCartCount instead
    },

    initEventListeners() {
        // Event delegation for cart item interactions
        document.getElementById('cart-items')?.addEventListener('click', (e) => {
            const productId = e.target.closest('[data-product-id]')?.dataset.productId;
            if (!productId) return;

            if (e.target.classList.contains('minus')) {
                this.updateItemQuantity(productId, -1);
            } else if (e.target.classList.contains('plus')) {
                this.updateItemQuantity(productId, 1);
            } else if (e.target.closest('.remove-item')) {
                this.removeItem(productId);
            }
        });

        // Add checkout button event listener
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const cart = StorageUtil.getCart() || [];
                if (cart && cart.length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    alert('Your cart is empty!');
                }
            });
        }

        // Add coupon event listeners
        const applyCouponBtn = document.getElementById('applyCoupon');
        const couponInput = document.getElementById('couponCode');
        const couponMessage = document.getElementById('couponMessage');

        if (applyCouponBtn && couponInput) {
            applyCouponBtn.addEventListener('click', () => {
                if (applyCouponBtn.classList.contains('remove-coupon')) {
                    // Remove coupon
                    CouponManager.removeCoupon();
                    StorageUtil.removeAppliedCoupon();
                    couponInput.value = '';
                    couponInput.disabled = false;
                    applyCouponBtn.textContent = 'Apply Coupon';
                    applyCouponBtn.classList.remove('remove-coupon');
                    couponMessage.textContent = '';
                    this.updateCartSummary();
                    return;
                }

                // Apply coupon
                const code = couponInput.value.trim();
                if (!code) {
                    couponMessage.textContent = 'Please enter a coupon code';
                    couponMessage.className = 'coupon-message error';
                    return;
                }

                const subtotal = parseFloat(document.getElementById('cart-subtotal').textContent.replace('₹', ''));
                const result = CouponManager.applyCoupon(code, subtotal);

                couponMessage.textContent = result.message;
                couponMessage.className = `coupon-message ${result.success ? 'success' : 'error'}`;

                if (result.success) {
                    StorageUtil.setAppliedCoupon(result);
                    couponInput.disabled = true;
                    applyCouponBtn.textContent = 'Remove';
                    applyCouponBtn.classList.add('remove-coupon');
                    this.updateCartSummary();
                }
            });
        }
    }
};

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    CartManager.init();
});
