// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.backgroundColor = 'rgba(123, 95, 169, 0.95)'; // #7b5fa9 with opacity
        } else {
            navbar.style.backgroundColor = '#7b5fa9';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add animation on scroll for work items
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const workItems = document.querySelectorAll('.work-item');
    workItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    // Initialize shopping cart
    ShoppingCart.init();
});

// Utility function to load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('../js/products.json');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// Utility function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Utility function to redirect to contact page with product parameter
function redirectToContact(productId) {
    window.location.href = `contact.html?product=${productId}`;
}

// Simple function to show page is interactive
function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #7b5fa9;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Shopping Cart Management Functions
const ShoppingCart = {
    // Get cart items from localStorage
    getItems: function() {
        try {
            const items = localStorage.getItem('mjndjcrafts_cart');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    },

    // Save cart items to localStorage
    saveItems: function(items) {
        try {
            localStorage.setItem('mjndjcrafts_cart', JSON.stringify(items));
            this.updateCartCount();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    },

    // Add item to cart
    addItem: function(product) {
        const items = this.getItems();
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        this.saveItems(items);
        return existingItem ? 'updated' : 'added';
    },

    // Remove item from cart
    removeItem: function(productId) {
        const items = this.getItems();
        const updatedItems = items.filter(item => item.id !== productId);
        this.saveItems(updatedItems);
    },

    // Update item quantity
    updateQuantity: function(productId, quantity) {
        const items = this.getItems();
        const item = items.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveItems(items);
            }
        }
    },

    // Get total item count
    getTotalCount: function() {
        const items = this.getItems();
        return items.reduce((total, item) => total + item.quantity, 0);
    },

    // Get total price
    getTotalPrice: function() {
        const items = this.getItems();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Clear cart
    clear: function() {
        localStorage.removeItem('mjndjcrafts_cart');
        this.updateCartCount();
    },

    // Update cart count display
    updateCartCount: function() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const count = this.getTotalCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    // Initialize cart (call on page load)
    init: function() {
        this.updateCartCount();
    }
};

// Function to add product to cart (called from shop page)
function addToCart(productId) {
    // First load all products to get product details
    loadProducts().then(products => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const result = ShoppingCart.addItem(product);
            if (result === 'added') {
                showMessage(`${product.name} added to cart!`);
            } else {
                showMessage(`${product.name} quantity updated in cart!`);
            }
        } else {
            showMessage('Product not found!', 'error');
        }
    }).catch(error => {
        console.error('Error adding to cart:', error);
        showMessage('Error adding to cart!', 'error');
    });
}

// Function to navigate to cart (contact page with cart items)
function goToCart() {
    const cartItems = ShoppingCart.getItems();
    if (cartItems.length === 0) {
        showMessage('Your cart is empty!', 'info');
        return;
    }
    
    // Navigate to contact page - the contact page will detect and load cart items
    const isInPagesFolder = window.location.pathname.includes('/pages/');
    const contactUrl = isInPagesFolder ? 'contact.html?cart=true' : 'pages/contact.html?cart=true';
    window.location.href = contactUrl;
}