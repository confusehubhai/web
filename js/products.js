// Product management functions
const ProductManager = {
    // Add some sample products if none exist
    initSampleProducts() {
        console.log('Initializing sample products...');
        const sampleProducts = [
            {
                id: 'p1',
                name: "rent a girlfriend",
                price: 199.99,
                description: "rent gf for velentine weak<br>kind<br>loyal<br>rustworthy<br>good humor etc etc ",
                imageUrl: "https://images.hdqwalls.com/wallpapers/anime-girl-portrait-4w.jpg"
            },
            {
                id: 'p2',
                name: "another girlfriend",
                price: 1999.99,
                description: "Manipulative <br> Mysterious <br>Ruthless",
                imageUrl: "https://th.bing.com/th/id/OIP.WUNoayh5vCpDgw_YMzRDxwHaEK?w=208&h=117&c=7&r=0&o=5&dpr=1.3&pid=1.7"
            },
            {
                id: 'p3',
                name: "iron underwear",
                price: 299.99,
                description: "amul macho<br> pahin ke nacho",
                imageUrl: "https://th.bing.com/th/id/OIP.2nK735-L8o4QQhhCG9ZZ0QHaHa?rs=1&pid=ImgDetMain"
            }
        ];
        StorageUtil.setProducts(sampleProducts);
        console.log('Sample products added:', sampleProducts);
    },

    // Create HTML for a single product
    createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        productDiv.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">₹${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
            </div>
            <button class="add-to-cart" data-product-id="${product.id}">
                Add to Cart
            </button>
        `;

        // Add event listener for the Add to Cart button
        productDiv.querySelector('.add-to-cart').addEventListener('click', () => {
            console.log('Adding product to cart:', product.id);
            StorageUtil.addToCart(product.id);
            this.updateCartCount();
            alert('Product added to cart!');
        });

        return productDiv;
    },

    // Display all products on the page
    displayProducts() {
        console.log('Displaying products...');
        const container = document.getElementById('products-container');
        if (!container) {
            console.error('Products container not found!');
            return;
        }

        const products = StorageUtil.getProducts() || [];
        console.log('Products to display:', products);
        container.innerHTML = '';

        products.forEach(product => {
            const productElement = this.createProductElement(product);
            container.appendChild(productElement);
        });
    },

    init() {
        this.initSampleProducts();
        this.displayProducts();
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing ProductManager...');
    ProductManager.init();
});
