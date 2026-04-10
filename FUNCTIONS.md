# Complete Function List

## ✅ ALL FUNCTIONS DEFINED IN common.js:

### 1. **Pricing Functions**
- `getTieredPrice(quantity)` - Returns tiered price based on quantity
- `updateCustomAmount()` - Updates custom amount input
- `clearCustomAmount()` - Clears custom amount
- `updateFinalPaymentAmount()` - Updates total with custom amount

### 2. **Cart Management**
- `addToCartGlobal(id, name, price, image, qty)` - Adds item to cart
- `updateCartCount()` - Updates cart badge count
- `openCart()` - Opens cart modal
- `updateCartQty(id, change)` - Changes quantity
- `removeFromCart(id)` - Removes item from cart

### 3. **Checkout Flow**
- `openCheckout()` - Opens checkout modal (Step 1: Address)
- `startCheckoutProcessing()` - Validates address → shows Step 2 (Payment)
- `updatePaymentDisplay()` - Updates payment amount with custom amount
- `selectPaymentMethod(method)` - Selects Card/UPI/COD
- `proceedToFinal()` - Routes to Razorpay or COD
- `goBackToMethods()` - Goes back to payment selection

### 4. **Payment Processing**
- `processRazorpayPayment()` - Opens Razorpay modal
- `processCODPayment()` - Processes Cash on Delivery
- `completeOrder(paymentId, method)` - Saves order and shows confirmation

### 5. **Modal Management**
- `closeCheckout()` - Closes checkout modal
- `closeCart()` - Closes cart modal
- `openCartModal(content)` - Opens cart with custom content
- `showModal(content)` - Alias for openCartModal

### 6. **UI Functions**
- `handleAccountClick()` - Handles account button click
- `detectLocation()` - Detects user location
- `createCartModal()` - Creates cart modal element
- `showNotification(message)` - Shows toast notification
- `loadReviews()` - Loads customer reviews

## 📞 FUNCTION CALL FLOW:

### Add to Cart Button:
`onclick="addToCartGlobal('bunny-pouch', 'Bunny Plushie Pouch', 101, '...', 1)"`
✓ Function exists

### Buy Now Button:
`onclick="(function() { addToCartGlobal(...); setTimeout(() => openCheckout(), 500); })()"`
✓ Functions exist

### Proceed to Payment (Step 1):
`onclick="startCheckoutProcessing()"` → `updatePaymentDisplay()`
✓ Functions exist

### Payment Method Selection:
`onclick="selectPaymentMethod('Card/UPI/COD')"`
✓ Function exists

### Custom Amount Input:
`oninput="updateCustomAmount()"` & `onclick="clearCustomAmount()"`
✓ Functions exist

### Pay Button:
`onclick="proceedToFinal()"` → `processRazorpayPayment()` or `processCODPayment()`
✓ Functions exist

### Change Payment Method:
`onclick="goBackToMethods()"`
✓ Function exists but needs fix - should call updatePaymentDisplay()

### Close Modal:
`onclick="closeCheckout()"`
✓ Function exists

---

## 🔧 ISSUE FOUND & FIXED:

**Problem:** `goBackToMethods()` doesn't update payment display
**Solution:** Added `updatePaymentDisplay()` call

**Result:** All buttons should now work! ✅
