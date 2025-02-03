// Storage Utility
const StorageUtil = {
    KEYS: {
        PRODUCTS: 'products',
        CART: 'cart',
        ORDERS: 'orders'
    },

    // Initialize storage with default data if empty
    init() {
        console.log('Initializing storage...');
        if (!this.getProducts()) {
            console.log('Initializing products array');
            this.setProducts([]);
        }
        if (!this.getCart()) {
            console.log('Initializing cart array');
            this.setCart([]);
        }
        if (!this.getOrders()) {
            console.log('Initializing orders array');
            this.setOrders([]);
        }
    },

    // Product related functions
    getProducts() {
        try {
            let products = localStorage.getItem(this.KEYS.PRODUCTS);
            if (!products) {
                // Initialize with sample products if none exist
                const sampleProducts = [
                    {
                        id: 'p1',
                        name: "rent your gf",
                        price: 99.99,
                        description: "rent gf for velentine weak,kindness,loyal,trustworthy,good humor etc etc ",
                        imageUrl: "image/gff.jpg"
                    },
                    {
                        id: 'p2',
                        name: "Smart Watch",
                        price: 199.99,
                        description: "Feature-rich smartwatch with health tracking",
                        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
                    },
                    {
                        id: 'p3',
                        name: "Laptop Bag",
                        price: 49.99,
                        description: "Stylish and durable laptop bag with multiple compartments",
                        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
                    }
                ];
                localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(sampleProducts));
                return sampleProducts;
            }
            return JSON.parse(products);
        } catch (error) {
            console.error('Error getting products:', error);
            return [];
        }
    },

    setProducts(products) {
        console.log('Setting products:', products);
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    },

    addProduct(product) {
        console.log('Adding product:', product);
        const products = this.getProducts() || [];
        product.id = Date.now().toString(); // Simple unique ID
        products.push(product);
        this.setProducts(products);
        return product;
    },

    deleteProduct(productId) {
        const products = this.getProducts() || [];
        const updatedProducts = products.filter(p => p.id !== productId);
        this.setProducts(updatedProducts);
    },

    // Cart related functions
    getCart() {
        const cart = localStorage.getItem(this.KEYS.CART);
        console.log('Getting cart:', cart);
        return cart ? JSON.parse(cart) : [];
    },

    setCart(cart) {
        console.log('Setting cart:', cart);
        localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
    },

    addToCart(productId) {
        console.log('Adding to cart, productId:', productId);
        const cart = this.getCart() || [];
        const products = this.getProducts() || [];
        
        const product = products.find(p => p.id === productId);
        console.log('Found product:', product);
        
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }
        
        const existingItem = cart.find(item => item.productId === productId);
        console.log('Existing cart item:', existingItem);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: productId,
                quantity: 1,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl
            });
        }
        
        this.setCart(cart);
        this.updateCartCount(); // Call to update cart count immediately
        console.log('Cart after adding:', cart); // Log the cart contents
    },

    removeFromCart(productId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.productId !== productId);
        this.setCart(updatedCart);
    },

    clearCart() {
        console.log('Clearing cart');
        this.setCart([]);
    },

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (!cartCount) return;

        const cart = this.getCart() || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        console.log('Updated cart count:', totalItems);
    },

    // Order related functions
    getOrders() {
        const orders = localStorage.getItem(this.KEYS.ORDERS);
        console.log('Getting orders:', orders);
        return orders ? JSON.parse(orders) : [];
    },

    setOrders(orders) {
        console.log('Setting orders:', orders);
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    },

    addOrder(order) {
        console.log('Adding order:', order);
        const orders = this.getOrders();
        orders.unshift(order); // Add new order at the beginning
        this.setOrders(orders);
        return order;
    },

    getOrderById(orderId) {
        const orders = this.getOrders();
        return orders.find(order => order.orderId === orderId);
    },

    updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            order.status = newStatus;
            order.lastUpdated = new Date().toISOString();
            this.setOrders(orders);
            return true;
        }
        return false;
    }
};

// Initialize storage when the file loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing StorageUtil...');
    StorageUtil.init();
    StorageUtil.updateCartCount();
});
