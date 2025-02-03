// Main application logic
const App = {
    init() {
        this.initMobileMenu();
        this.initEventListeners();
        this.loadProducts();
        this.updateCartCount();
        // Remove any existing beforeunload handlers
        window.onbeforeunload = null;
        
        // Prevent browser form validation popups globally
        document.addEventListener('invalid', (e) => {
            e.preventDefault();
        }, true);
        
        // Prevent browser confirmation dialogs
        window.onbeforeunload = null;
        window.onunload = null;
    },

    initMobileMenu() {
        const navbar = document.querySelector('.navbar');
        const navItems = document.querySelector('.nav-items');
        
        // Add mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        navbar.insertBefore(mobileMenuBtn, navItems);

        // Toggle menu on button click
        mobileMenuBtn.addEventListener('click', () => {
            navItems.classList.toggle('active');
            mobileMenuBtn.innerHTML = navItems.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navItems.classList.contains('active')) {
                navItems.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });

        // Close menu when window is resized to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navItems.classList.contains('active')) {
                navItems.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    },

    initEventListeners() {
        // Add global event listeners here
        document.addEventListener('DOMContentLoaded', () => {
            // Update cart count when page loads
            if (typeof ProductManager !== 'undefined') {
                ProductManager.updateCartCount();
            }
        });

        // Handle back-to-top functionality
        const scrollThreshold = 400;
        let backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTopBtn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },

    loadProducts() {
        const productsContainer = document.getElementById('products-container');
        if (!productsContainer) return;

        productsContainer.innerHTML = '';
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsContainer.appendChild(productCard);
        });
    },

    createProductCard(product) {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">₹${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-product-id="${product.productId}">
                Add to Cart
            </button>
        `;

        // Add to cart functionality
        const addToCartBtn = div.querySelector('.add-to-cart');
        addToCartBtn.addEventListener('click', () => this.addToCart(product));

        return div;
    },

    addToCart(product) {
        const cart = StorageUtil.getCart() || [];
        const existingItem = cart.find(item => item.productId === product.productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        StorageUtil.setCart(cart);
        this.updateCartCount();
        this.showAddToCartAnimation();
    },

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const cart = StorageUtil.getCart() || [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            console.log('Updated cart count:', totalItems);
        }
    },

    showAddToCartAnimation() {
        // Add a quick animation or feedback when item is added
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            cartIcon.classList.add('bounce');
            setTimeout(() => cartIcon.classList.remove('bounce'), 300);
        }
    }
};

// Initialize the application
App.init();
