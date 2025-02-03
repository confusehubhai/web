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
        const SHIPPING_COST = 10.00; // Shipping cost updated to ₹10
        const TAX_RATE = 0.08; // 8% tax rate
        
        const subtotal = cart.reduce((sum, cartItem) => {
            return sum + (cartItem.price * cartItem.quantity);
        }, 0);

        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax + SHIPPING_COST;

        document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('cart-tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('cart-shipping').textContent = `₹${SHIPPING_COST.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
        
        App.updateCartCount();
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
    }
};

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    CartManager.init();
});
