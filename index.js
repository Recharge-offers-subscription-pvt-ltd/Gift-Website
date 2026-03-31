const images = [
    'https://www.hellokidology.in/cdn/shop/files/7_c1ccd535-9aeb-4dd8-8a58-77f606a7223f.jpg?v=1741688694&width=1220',
    'https://www.hellokidology.in/cdn/shop/files/9_2fb84739-1713-49ac-a6f7-1e96235c5a9b.jpg?v=1699973060&width=610',
    'https://www.hellokidology.in/cdn/shop/files/6_7015c966-236d-43b6-a9f5-5c086e0feef3.jpg?v=1741688694&width=610',
    'https://www.hellokidology.in/cdn/shop/files/71XMNIZYqOL._SL1500_7d9e3582-b956-48fd-8fc9-87ba132e04fd.jpg?v=1741688694&width=1220',
    'https://www.hellokidology.in/cdn/shop/files/adorable-strawberry-rabbit-plushie-cute-bunny-soft-toy-35-cm-original-imah2edhnbhahuyv_eb9a0bdb-e40a-4c9b-8976-7371d645476d.webp?v=1741688694&width=1220'
  ];

  let currentImg = 0;
  let qty = 1;
  let cartCount = 0;

  // Build thumbnails
  const thumbsEl = document.getElementById('thumbnails');
  if (thumbsEl) {
    images.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'thumb' + (i === 0 ? ' active' : '');
      div.innerHTML = `<img src="${src}" alt="thumb ${i+1}">`;
      div.onclick = () => setMainImage(i);
      thumbsEl.appendChild(div);
    });
  }

  function setMainImage(i) {
    currentImg = i;
    const mainImgEl = document.getElementById('mainImage');
    if (mainImgEl) mainImgEl.src = images[i];
    document.querySelectorAll('.thumb').forEach((t, idx) => {
      t.classList.toggle('active', idx === i);
    });
  }

  function changeQty(delta) {
    qty = Math.max(1, qty + delta);
    const qtyValueEl = document.getElementById('qtyValue');
    if (qtyValueEl) qtyValueEl.textContent = qty;
  }

  function selectStyle(btn, name) {
    document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const selectedStyleEl = document.getElementById('selectedStyle');
    if (selectedStyleEl) selectedStyleEl.textContent = name;
  }

  function addToCart() {
    cartCount += qty;
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.textContent = cartCount;
    const btn = document.querySelector('.btn-cart');
    if (btn) {
      btn.textContent = '✅ Added to Cart!';
      btn.style.background = '#4caf7d';
      setTimeout(() => {
        btn.textContent = '🛒 Add to Cart';
        btn.style.background = '';
      }, 1800);
    }
  }

  function openModal() {
    const modalImgEl = document.getElementById('modalImg');
    if (modalImgEl) modalImgEl.src = images[currentImg];
    document.getElementById('modal').classList.add('open');
  }
  function closeModal() {
    document.getElementById('modal').classList.remove('open');
  }

  // Reviews
  const reviews = [
    { name: 'Sushil', stars: 5, text: 'Really love it by my friends to whom I gifted this. Super soft and adorable!' },
    { name: 'Priya M.', stars: 5, text: 'My daughter hasn\'t let go of it since it arrived. The quality is amazing for the price.' },
    { name: 'Ravi K.', stars: 4, text: 'Arrived quickly and packaged beautifully. Very cute bunny, kids love it!' },
    { name: 'Anita S.', stars: 5, text: 'Gifted this to my niece. She absolutely adores it. Worth every rupee!' },
    { name: 'Deepak R.', stars: 5, text: 'Superb quality! My son sleeps with it every night now. Very happy purchase.' },
    { name: 'Meera T.', stars: 4, text: 'Cute and cuddly. The strawberry design is so unique – loved the concept!' },
  ];

  const grid = document.getElementById('reviewsGrid');
  if (grid) {
    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
        <div class="review-name">${r.name}</div>
        <div class="review-text">"${r.text}"</div>
      `;
      grid.appendChild(card);
    });
  }

  // Wishlist toggle
  const wf = document.querySelector('.wishlist-float');
  let wishlisted = false;
  if (wf) {
    wf.addEventListener('click', () => {
      wishlisted = !wishlisted;
      wf.textContent = wishlisted ? '❤️' : '🤍';
    });
  }

  // --- CHECKOUT LOGIC ---
  const PRICE_PER_ITEM = 99;

  function openCheckout() {
    document.getElementById('checkoutModal').classList.add('open');
    document.getElementById('checkoutStep1').style.display = 'block';
    document.getElementById('checkoutStep2').style.display = 'none';
  }

  function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('open');
  }

  function detectLocation() {
    const locBtn = document.querySelector('.btn-location');
    locBtn.textContent = '⏳';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(res => res.json())
                .then(data => {
                    document.getElementById('custAddress').value = data.display_name;
                    if(data.address && data.address.postcode) {
                        const cityObj = data.address.city || data.address.state || '';
                        document.getElementById('custPincode').value = `${data.address.postcode}, ${cityObj}`;
                    }
                    locBtn.textContent = '📍';
                }).catch(e => {
                    locBtn.textContent = '📍';
                    alert("Could not fetch address details automatically.");
                });
        }, () => {
            locBtn.textContent = '📍';
            alert("Location access denied. Please enter manually.");
        });
    } else {
        alert("Geolocation not supported on this device.");
    }
  }

  function goToPayment() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    if(!name || !phone) {
        alert("Please enter Name and Phone Number to continue.");
        return;
    }
    
    const amount = qty * PRICE_PER_ITEM;
    document.getElementById('finalAmountStr').textContent = `Rs. ${amount}`;
    
    const safeName = encodeURIComponent(name);
    const upiLink = `upi://pay?pa=yoshivam@fam&pn=Plushieland&am=${amount}&tn=Order%20for%20${safeName}`;
    document.getElementById('upiLinkBtn').href = upiLink;
    
    const qrContainer = document.getElementById('paymentQR');
    qrContainer.innerHTML = ''; 
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
          text: upiLink,
          width: 150,
          height: 150,
          colorDark : "#3a2a35",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.H
      });
    }
    
    document.getElementById('checkoutStep1').style.display = 'none';
    document.getElementById('checkoutStep2').style.display = 'block';
  }

  function goBackToDetails() {
    document.getElementById('checkoutStep2').style.display = 'none';
    document.getElementById('checkoutStep1').style.display = 'block';
  }
