// Product Gallery Implementation

// First, let's modify the product data structure to include multiple images
const ProductManager = {
    // Add some sample products if none exist
    initSampleProducts() {
        console.log('Initializing sample products...');
        const sampleProducts = [
            {
                id: 'p3',
                name: "Stylish Shirt",
                price: 299.99,
                description: "Imported Green Popcorn Stylish Shirt For Men",
                details: {
                    specifications: "• Model: Regular Fit\n• Colour: Green\n• Occasion: Casual, Party Wear\n• Pattern: Solid\n• Fabric Care: Machine Wash\n• Country of Origin: India",
                    sizeFit: "• Fit Type: Regular Fit\n• Length: Standard Length\n• Sleeve Length: Full Sleeves\n• Collar: Regular Collar\n• Hemline: Straight",
                    materialCare: "• Material: Premium Cotton Blend\n• Machine Wash\n• Do Not Bleach\n• Warm Iron\n• Dry in Shade",
                    additionalInfo: "• Product Code: IMPSS123\n• Manufacturer: Imported Popcorn Ltd.\n• Return Policy: 7 Days\n• Warranty: 30 Days Manufacturing Warranty         "
                },
                imageUrl: "./image/prophoto1.jpg",
                galleryImages: [
                    "./image/prophoto2.jpg",
                    "./image/pr.jpg",
                    "./image/prr.jpg"
                ],
                sizes: {
                    'S': 299.99,
                    'M': 299.99,
                    'L': 299.99, 
                    'XL': 299.99,
                    'XXL': 299.99
                }
            }
        ];
        StorageUtil.setProducts(sampleProducts);
        console.log('Sample products added:', sampleProducts);
    },

    // Create HTML for a single product - modified to include gallery button, size selector, and additional details
    createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        
        const sizeSelector = product.sizes ? `
            <div class="size-selector">
                <label for="size-${product.id}">Size:</label>
                <select id="size-${product.id}" class="size-select">
                    ${Object.keys(product.sizes).map(size => `<option value="${size}">${size} - ₹${product.sizes[size].toFixed(2)}</option>`).join('')}
                </select>
            </div>
        ` : '';

        productDiv.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                <button class="view-gallery-btn" data-product-id="${product.id}">
                    <i class="fa fa-images"></i> View Gallery
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">₹${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
                ${sizeSelector}
                <div class="details-container">
                    <button class="details-toggle" aria-expanded="false">
                        <span>Product Details</span>
                        <i class="fa fa-chevron-down"></i>
                    </button>
                    <div class="details-content">
                        <div class="details-section">
                            <h4>Specifications</h4>
                            ${product.details.specifications.split('\n').join('<br>')}
                        </div>
                        <div class="details-section">
                            <h4>Size & Fit</h4>
                            ${product.details.sizeFit.split('\n').join('<br>')}
                        </div>
                        <div class="details-section">
                            <h4>Material & Care</h4>
                            ${product.details.materialCare.split('\n').join('<br>')}
                        </div>
                        <div class="details-section">
                            <h4>Additional Information</h4>
                            ${product.details.additionalInfo.split('\n').join('<br>')}
                        </div>
                    </div>
                </div>
            </div>
            <button class="add-to-cart" data-product-id="${product.id}">
                Add to Cart
            </button>
        `;

        // Add event listener for the details toggle
        const detailsToggle = productDiv.querySelector('.details-toggle');
        const detailsContent = productDiv.querySelector('.details-content');
        
        if (detailsToggle && detailsContent) {
            detailsToggle.addEventListener('click', () => {
                const isExpanded = detailsToggle.getAttribute('aria-expanded') === 'true';
                detailsToggle.setAttribute('aria-expanded', !isExpanded);
                detailsContent.style.maxHeight = isExpanded ? '0' : `${detailsContent.scrollHeight}px`;
                detailsToggle.querySelector('i').className = isExpanded ? 'fa fa-chevron-down' : 'fa fa-chevron-up';
            });
        }

        // Add event listener for the Add to Cart button
        const addButton = productDiv.querySelector('.add-to-cart');
        addButton.addEventListener('click', (event) => {
            console.log('Adding product to cart:', product.id);
            try {
                StorageUtil.addToCart(product.id);
                if (typeof ProductManager.updateCartCount === 'function') {
                    ProductManager.updateCartCount();
                }
                ProductManager.showToast(`${product.name} added to cart!`, 'success');
            } catch (error) {
                console.error('Error adding to cart:', error);
                ProductManager.showToast('Error adding product to cart', 'error');
            }
        });

        // Add event listener for the View Gallery button
        const galleryButton = productDiv.querySelector('.view-gallery-btn');
        galleryButton.addEventListener('click', () => {
            console.log('Opening gallery for product:', product.id);
            ProductManager.openGallery(product);
        });

        return productDiv;
    },

    // Function to open image gallery popup
    openGallery(product) {
        // Check if product has gallery images
        if (!product.galleryImages || product.galleryImages.length === 0) {
            this.showToast('No additional images available', 'info');
            return;
        }

        // Create gallery overlay
        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        
        // Create gallery container
        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'gallery-container';
        
        // Create gallery content
        galleryContainer.innerHTML = `
            <button class="gallery-close">&times;</button>
            <div class="gallery-content">
                <div class="gallery-image-container">
                    <img src="${product.galleryImages[0]}" class="gallery-image active" alt="${product.name}">
                </div>
                <div class="gallery-controls">
                    <button class="gallery-prev"><i class="fa fa-chevron-left"></i></button>
                    <div class="gallery-pagination"></div>
                    <button class="gallery-next"><i class="fa fa-chevron-right"></i></button>
                </div>
            </div>
        `;
        
        // Add pagination dots
        const paginationContainer = galleryContainer.querySelector('.gallery-pagination');
        product.galleryImages.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'gallery-dot' + (index === 0 ? ' active' : '');
            dot.dataset.index = index;
            paginationContainer.appendChild(dot);
        });
        
        overlay.appendChild(galleryContainer);
        document.body.appendChild(overlay);
        
        // Current image index
        let currentIndex = 0;
        
        // Function to update displayed image
        const updateImage = (index) => {
            const imageContainer = overlay.querySelector('.gallery-image-container');
            
            // Create new image with fade-in effect
            const newImage = document.createElement('img');
            newImage.className = 'gallery-image fade-in';
            newImage.src = product.galleryImages[index];
            newImage.alt = `${product.name} - Image ${index + 1}`;
            
            // Remove old images
            const oldImage = imageContainer.querySelector('.gallery-image');
            if (oldImage) {
                oldImage.className = 'gallery-image fade-out';
                setTimeout(() => {
                    if (oldImage.parentNode === imageContainer) {
                        imageContainer.removeChild(oldImage);
                    }
                }, 300);
            }
            
            // Add new image
            imageContainer.appendChild(newImage);
            
            // Update dots
            const dots = overlay.querySelectorAll('.gallery-dot');
            dots.forEach((dot, i) => {
                dot.className = 'gallery-dot' + (i === index ? ' active' : '');
            });
            
            currentIndex = index;
        };
        
        // Event listeners
        // Close button
        galleryContainer.querySelector('.gallery-close').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        });
        
        // Next button
        galleryContainer.querySelector('.gallery-next').addEventListener('click', () => {
            const nextIndex = (currentIndex + 1) % product.galleryImages.length;
            updateImage(nextIndex);
        });
        
        // Previous button
        galleryContainer.querySelector('.gallery-prev').addEventListener('click', () => {
            const prevIndex = (currentIndex - 1 + product.galleryImages.length) % product.galleryImages.length;
            updateImage(prevIndex);
        });
        
        // Pagination dots
        galleryContainer.querySelectorAll('.gallery-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                updateImage(index);
            });
        });
        
        // Close on outside click
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
            }
        });
        
        // Keyboard navigation
        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'ArrowRight':
                    const nextIndex = (currentIndex + 1) % product.galleryImages.length;
                    updateImage(nextIndex);
                    break;
                case 'ArrowLeft':
                    const prevIndex = (currentIndex - 1 + product.galleryImages.length) % product.galleryImages.length;
                    updateImage(prevIndex);
                    break;
                case 'Escape':
                    overlay.classList.add('fade-out');
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                    }, 300);
                    document.removeEventListener('keydown', handleKeyDown);
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        // Add animation class after a small delay (for entrance animation)
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    },

    // Other functions remain unchanged
    showToast(message, type = 'success') {
        console.log('Showing toast:', message, type);
        
        // Create toast element
        const toast = document.createElement('div');
        
        // Set styles based on type
        let backgroundColor;
        switch(type) {
            case 'success':
                backgroundColor = '#4CAF50'; // Green
                break;
            case 'error':
                backgroundColor = '#f44336'; // Red
                break;
            case 'info':
                backgroundColor = '#2196F3'; // Blue
                break;
            default:
                backgroundColor = '#4CAF50'; // Default green
        }
        
        // Apply inline styles
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '-300px';
        toast.style.backgroundColor = backgroundColor;
        toast.style.color = 'white';
        toast.style.padding = '15px';
        toast.style.borderRadius = '4px';
        toast.style.minWidth = '250px';
        toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        toast.style.zIndex = '1000';
        toast.style.fontWeight = 'bold';
        toast.style.transition = 'right 0.5s ease';
        toast.style.opacity = '1';
        
        // Set the message
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Trigger reflow to ensure the transition works
        toast.offsetWidth;
        
        // Animate in
        setTimeout(() => {
            toast.style.right = '20px';
        }, 50);
        
        // Remove after delay
        setTimeout(() => {
            // Animate out
            toast.style.right = '-300px';
            
            // Remove element after animation
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 500);
        }, 3000);

        return toast; // Return the toast element for testing
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