// Global cart management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let reviews = [];
let customAmount = 0; // Track custom amount
let selectedQuantity = 1; // Track selected quantity for product

// Tiered Pricing Function
function getTieredPrice(quantity) {
    if (quantity >= 21) return 349;
    if (quantity >= 10) return 299;
    if (quantity >= 5) return 279;
    if (quantity >= 2) return 249;
    return 199;
}

// Select quantity for product
function selectQuantity(qty) {
    selectedQuantity = qty;
    // Update UI - highlight selected button
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-qty="${qty}"]`).classList.add('selected');
    showNotification(`✓ Selected x${qty} - Rs. ${getTieredPrice(qty)}`);
}

// Add selected quantity to cart
function addSelectedToCart() {
    try {
        addToCartGlobal('bunny-pouch', 'Bunny Plushie Pouch', 199, 'https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=300', selectedQuantity);
        showNotification(`✓ Added x${selectedQuantity} to cart!`);
    } catch (error) {
        console.error('Add to Cart Error:', error);
        showNotification('Error adding to cart ❌');
    }
}

// Buy now with selected quantity
function buyNowSelected() {
    try {
        // Add item to cart
        addToCartGlobal('bunny-pouch', 'Bunny Plushie Pouch', 199, 'https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=300', selectedQuantity);
        
        // Open checkout immediately
        openCheckout();
    } catch (error) {
        console.error('Buy Now Error:', error);
        showNotification('Error with Buy Now ❌');
    }
}

// Update custom amount
function updateCustomAmount() {
    const input = document.getElementById('customAmountInput');
    const display = document.getElementById('customAmountDisplay');
    const amount = parseInt(input.value) || 0;
    customAmount = amount;
    
    if (amount > 0) {
        display.textContent = `✓ Additional Rs. ${amount} will be added!`;
        display.style.display = 'block';
        updateFinalPaymentAmount();
    } else {
        display.style.display = 'none';
    }
}

// Clear custom amount
function clearCustomAmount() {
    document.getElementById('customAmountInput').value = '';
    document.getElementById('customAmountDisplay').style.display = 'none';
    customAmount = 0;
    updateFinalPaymentAmount();
}

// Update final payment amount with custom amount
function updateFinalPaymentAmount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const baseTotal = getTieredPrice(totalQty);
    const finalTotal = baseTotal + customAmount;
    document.getElementById('methodAmountStr').textContent = `Rs. ${finalTotal}`;
    document.getElementById('btnPayText').textContent = `Pay Rs. ${finalTotal}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadReviews();
});

// Add to cart
function addToCartGlobal(id, name, price, image, qty) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ id, name, price, image, qty });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${name} added to cart! 🛒`);
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.style.display = 'flex';
            cartCount.style.width = '20px';
            cartCount.style.height = '20px';
        } else {
            cartCount.style.display = 'none';
        }
    }
}

// Open cart
function openCart() {
    // Reload cart from localStorage to ensure we have latest data
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showNotification('Your cart is empty 😢');
        return;
    }
    
    let cartHTML = `
        <div style="max-width: 600px; width: 100%;">
            <h2 style="margin-bottom: 20px; color: var(--text);">Shopping Cart 🛒</h2>
            <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
    `;
    
    // Calculate total quantity
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const total = getTieredPrice(totalQty);
    
    // Show tiered pricing info
    cartHTML += `
            <div style="background: #f0f0f0; padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 0.85rem; line-height: 1.5; color: var(--text-light);">
                <strong style="display: block; margin-bottom: 8px; color: var(--text);">📊 Tiered Pricing:</strong>
                1x = Rs. 199 | 2x = Rs. 249 | 5x = Rs. 279 | 10x = Rs. 299 | 21x = Rs. 349
            </div>
    `;
    
    cart.forEach(item => {
        cartHTML += `
            <div style="display: flex; gap: 15px; padding: 15px; background: var(--bg-light); border-radius: 8px; margin-bottom: 12px; align-items: center;">
                <img src="${item.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;">
                <div style="flex: 1;">
                    <strong style="display: block; margin-bottom: 5px;">${item.name}</strong>
                    <span style="color: var(--primary); font-weight: 700;">Starting at Rs. ${item.price}</span>
                    <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
                        <button onclick="updateCartQty('${item.id}', -1)" style="width: 24px; height: 24px; border: 1px solid var(--border); background: white; border-radius: 4px; cursor: pointer; font-weight: 700;">−</button>
                        <span style="min-width: 30px; text-align: center;">${item.qty}</span>
                        <button onclick="updateCartQty('${item.id}', 1)" style="width: 24px; height: 24px; border: 1px solid var(--border); background: white; border-radius: 4px; cursor: pointer; font-weight: 700;">+</button>
                        <button onclick="removeFromCart('${item.id}')" style="margin-left: auto; background: none; border: none; color: var(--danger); cursor: pointer; font-weight: 700; font-size: 0.9rem;">✕ Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartHTML += `
            </div>
            <div style="border-top: 2px solid var(--border); padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-light);">
                    <span>Qty: ${totalQty}</span>
                    <span>Total Price (Tiered):</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 1.2rem;">
                    <strong>Total:</strong>
                    <strong style="color: var(--primary);">Rs. ${total}</strong>
                </div>
                <button class="btn-buy" onclick="openCheckout()" style="margin-bottom: 10px; width: 100%;">Proceed to Checkout ➡️</button>
                <button class="btn-cart" onclick="closeCart()" style="width: 100%;">Continue Shopping</button>
            </div>
        </div>
    `;
    
    openCartModal(cartHTML);
}

// Update cart quantity
function updateCartQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            openCart();
        }
    }
}

// Remove from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (cart.length > 0) {
        openCart();
    } else {
        closeCart();
        showNotification('Item removed from cart ✓');
    }
}

// Open checkout
function openCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        // Don't close cart, just show checkout steps
        document.getElementById('checkoutStep1').style.display = 'block';
        document.getElementById('checkoutStep2').style.display = 'none';
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('checkoutStep_Success').style.display = 'none';
        // Initialize payment method
        selectPaymentMethod('Card');
        checkoutModal.classList.add('active');
    } else {
        showNotification('Checkout modal not found ❌');
    }
}

// Start checkout processing
function startCheckoutProcessing() {
    const name = document.getElementById('custName');
    const phone = document.getElementById('custPhone');
    const house = document.getElementById('custHouse');
    const city = document.getElementById('custCity');
    
    if (!name.value || !phone.value || !house.value || !city.value) {
        showNotification('Please fill all required fields ⚠️');
        return;
    }
    
    if (phone.value.length < 10) {
        showNotification('Please enter valid phone number ⚠️');
        return;
    }
    
    document.getElementById('checkoutStep1').style.display = 'none';
    document.getElementById('checkoutLoading').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('checkoutStep2').style.display = 'block';
        updatePaymentDisplay();
    }, 2000);
}

// Update payment display
function updatePaymentDisplay() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const baseTotal = getTieredPrice(totalQty);
    const finalTotal = baseTotal + customAmount;
    document.getElementById('methodAmountStr').textContent = `Rs. ${finalTotal}`;
    document.getElementById('btnPayText').textContent = `Pay Rs. ${finalTotal}`;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayName = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    document.getElementById('deliveryDateStr').textContent = dayName;
}

// Select payment method
function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('opt' + method).classList.add('selected');
    
    document.querySelectorAll('.radio-circle').forEach(radio => {
        radio.style.backgroundColor = 'transparent';
        radio.style.borderColor = '#e0e0e0';
    });
    
    const selectedRadio = document.getElementById('radio' + method);
    if (selectedRadio) {
        selectedRadio.style.backgroundColor = '#e8719b';
        selectedRadio.style.borderColor = '#e8719b';
    }
    
    if (method === 'COD') {
        document.getElementById('codTrustNote').style.display = 'block';
    } else {
        document.getElementById('codTrustNote').style.display = 'none';
    }
}

// Proceed to final - Razorpay Integration
function proceedToFinal() {
    const method = document.querySelector('.payment-option.selected');
    if (!method) {
        showNotification('Please select a payment method ⚠️');
        return;
    }
    
    const selectedMethod = method.id.replace('opt', '');
    
    if (selectedMethod === 'UPI' || selectedMethod === 'Card') {
        // Razorpay Payment
        processRazorpayPayment();
    } else if (selectedMethod === 'COD') {
        // Cash on Delivery
        processCODPayment();
    }
}

// Razorpay Payment Processing
function processRazorpayPayment() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const baseTotal = getTieredPrice(totalQty);
    const total = baseTotal + customAmount;
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('checkoutLoading').style.display = 'block';
    
    setTimeout(() => {
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: total * 100, // Amount in paise
            currency: 'INR',
            name: 'Plushieland Gift Store',
            description: 'Bunny Plushie Order',
            image: 'https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=300',
            prefill: {
                name: name,
                contact: phone,
            },
            theme: {
                color: '#e8719b'
            },
            handler: function(response) {
                // Payment successful
                completeOrder(response.razorpay_payment_id, 'Razorpay');
            },
            modal: {
                ondismiss: function() {
                    document.getElementById('checkoutLoading').style.display = 'none';
                    document.getElementById('checkoutStep2').style.display = 'block';
                    showNotification('Payment cancelled ❌');
                }
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
        
        document.getElementById('checkoutLoading').style.display = 'none';
    }, 1500);
}

// COD Payment Processing
function processCODPayment() {
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('checkoutLoading').style.display = 'block';
    
    setTimeout(() => {
        completeOrder('COD-' + Date.now(), 'Cash on Delivery');
    }, 2000);
}

// Complete Order
function completeOrder(paymentId, method) {
    document.getElementById('checkoutLoading').style.display = 'none';
    document.getElementById('checkoutStep_Success').style.display = 'block';
    
    const randomID = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('randomOrderID').textContent = randomID;
    
    // Store order details
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const baseTotal = getTieredPrice(totalQty);
    const order = {
        orderId: randomID,
        paymentId: paymentId,
        paymentMethod: method,
        items: cart,
        quantity: totalQty,
        basePrice: baseTotal,
        customAmount: customAmount,
        total: baseTotal + customAmount,
        customerName: document.getElementById('custName').value,
        customerPhone: document.getElementById('custPhone').value,
        address: {
            house: document.getElementById('custHouse').value,
            street: document.getElementById('custStreet').value,
            landmark: document.getElementById('custLandmark').value,
            pincode: document.getElementById('custPincode').value,
            city: document.getElementById('custCity').value,
        },
        timestamp: new Date().toISOString()
    };
    
    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Go back to methods
function goBackToMethods() {
    document.getElementById('checkoutStep2').style.display = 'block';
    updatePaymentDisplay();
    selectPaymentMethod('Card');
}

// Close checkout
function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
        // Reset form
        document.getElementById('checkoutStep1').style.display = 'block';
        document.getElementById('checkoutStep2').style.display = 'none';
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('checkoutStep_Success').style.display = 'none';
        // Clear form inputs
        document.getElementById('custName').value = '';
        document.getElementById('custPhone').value = '';
        document.getElementById('custHouse').value = '';
        document.getElementById('custStreet').value = '';
        document.getElementById('custLandmark').value = '';
        document.getElementById('custPincode').value = '';
        document.getElementById('custCity').value = '';
        // Clear custom amount
        clearCustomAmount();
    }
}

// Close cart
function closeCart() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
    }
}

// Open cart modal
function openCartModal(content) {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        const box = modal.querySelector('.checkout-box');
        // Clear existing checkout form
        box.innerHTML = `<button class="modal-close checkout-close" onclick="closeCart()">✕</button>${content}`;
        // Make sure checkout steps are hidden to show cart view
        document.getElementById('checkoutStep1').style.display = 'none';
        document.getElementById('checkoutStep2').style.display = 'none';
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('checkoutStep_Success').style.display = 'none';
        modal.classList.add('active');
    }
}

// Show modal (alias for compatibility)
function showModal(content) {
    openCartModal(content);
}

// Create cart modal
function createCartModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.id = 'cartModalOverlay';
    modal.innerHTML = `<div class="checkout-box"></div>`;
    document.body.appendChild(modal);
    return modal;
}

// Account click
function handleAccountClick() {
    alert('Account features coming soon! 👤');
}

// Detect location
function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            showNotification('Location detected! 📍');
            document.getElementById('custCity').value = 'Current Location';
        });
    } else {
        showNotification('Geolocation not supported');
    }
}

// Load reviews
function loadReviews() {
    const reviews = [
        { name: 'Priya Singh', rating: 5, text: 'Amazing products! The bangles are stunning and arrived on time. 😍' },
        { name: 'Rahul Patel', rating: 5, text: 'Great service and fast delivery. Will definitely order again! 🚀' },
        { name: 'Neha Sharma', rating: 5, text: 'The bunny plushie is adorable. My daughter loves it! 🐰' },
        { name: 'Arjun Kumar', rating: 4, text: 'Good quality products. Packaging could be better but overall satisfied.' },
        { name: 'Anjali Desai', rating: 5, text: 'The jhumkas are beautiful and authentic. Highly recommended! ✨' },
        { name: 'Vikram Singh', rating: 5, text: 'Best gift delivery service in town. Never disappointed!' }
    ];
    
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (reviewsGrid) {
        reviewsGrid.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-name">👤 ${review.name}</div>
                <div class="review-stars">${'⭐'.repeat(review.rating)}</div>
                <div class="review-text">"${review.text}"</div>
            </div>
        `).join('');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: var(--primary);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(-400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

