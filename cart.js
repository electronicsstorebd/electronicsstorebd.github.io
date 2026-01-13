const CFG = {
  CART_KEY: 'es_cart_v1',
  ADDR_KEY: 'es_addresses_v1',
  LAST_NAME_KEY: 'es_last_name',
  LAST_PHONE_KEY: 'es_last_phone',
  WHATSAPP: '+8801872605055',
  SMS_NUMBER: '+8801872605055',
  MAIL_TO: 'officialelectronicsstore@gmail.com',
  MESSENGER_PAGE: 'officialelectronicsstore',
  IMG_BASE: '/IMG/'
};

let isSingleBuy = false;
let deliveryPrice = 80;
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const money = n => '৳' + Number(n || 0).toFixed(2);

document.addEventListener("DOMContentLoaded", ()=>document.querySelectorAll("a").forEach(e=>e.textContent.trim()=="See More"&&(e.style.display="none")),window.onload=()=>document.querySelectorAll("a").forEach(e=>e.textContent.trim() =="See More"&&(e.style.display="unset")));

function cartFtouch(p) {
  p.querySelectorAll('.cart').forEach(cart => {
    const avail = Number(cart.getAttribute('data-available') || 0);
    const sold = Number(cart.getAttribute('data-sold') || 0);
    const total = Math.max(avail + sold, 1);
    const percent = Math.round((sold / total) * 100);
    
    const availEl = cart.querySelector('.info-available');
    const soldEl = cart.querySelector('.info-sold');
    if (availEl) availEl.textContent = avail;
    if (soldEl) soldEl.textContent = sold;
    
    const bar = cart.querySelector('.progress-bar > span');
    const note = cart.querySelector('.progress-note');
    if (bar) { bar.style.width = percent + '%'; }
    if (note) { note.textContent = percent + '% of stock sold'; }
    
    const addBtn = cart.querySelector('.add-cart');
    if (addBtn) {
      if (avail <= 0) {
        addBtn.disabled = true;
        addBtn.style.opacity = '.6';
        addBtn.style.cursor = 'not-allowed';
        addBtn.closest('.cart').querySelector('.img-frame').innerHTML += '<div class="badge">Stock Out</div>';
      }
    }
    
    const buyBtn = cart.querySelector('.buy-now');
    if (buyBtn) {
      if (avail <= 0) {
        buyBtn.disabled = true;
        buyBtn.style.opacity = '.6';
        buyBtn.style.cursor = 'not-allowed';
        buyBtn.closest('.cart').querySelector('.img-frame').innerHTML += '<div class="badge">Stock Out</div>';
      }
    }
  });
  
}

function cartMake(p, product) {
  const id = String(product.ID || product.id);
  PRODUCTS[id] = product;
  p.innerHTML += `
      <article class="cart" data-available="${product.available}" data-id="${product.ID}" data-sold="${product.sold}" aria-labelledby="p1-name">
        <div class="img-frame">
          <img src="/IMG/${product.ID}.png" loading="lazy" alt="${product.name}">
        </div>
        <div class="cart-body">
          <div class="meta">
            <div>
              <div class="title" id="p1-name">${product.name}</div>
              <div class="muted" style="margin-top:6px;">${product.description}</div>
            </div>
            <div class="price">${money(product.price)}</div>
          </div>
          <div class="stats" aria-hidden="false">
            <div>Sold: <strong class="info-sold"></strong></div>
            <div>Available: <strong class="info-available"></strong></div>
          </div>
          <div class="progress-wrap">
            <div class="progress-bar" aria-hidden="true"><span></span></div>
            <div class="progress-note">— % of stock sold</div>
          </div>
          <div class="actions">
            <button class="btn primary add-cart">Add to Cart</button>
            <button class="btn ghost buy-now">Buy Now</button>
          </div>
          <div class="cart-footer">
            <div>ID: ${product.ID}</div>
            <div>${product.notice}</div>
          </div>
        </div>
      </article>
     `;
}

function safeload(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }

function saveJSON(key, v) { localStorage.setItem(key, JSON.stringify(v)); }

function loadCart() { return safeload(CFG.CART_KEY, {}); }

function saveCart(cart) {
  saveJSON(CFG.CART_KEY, cart);
  renderCart();
  updateFloating();
}

function addToCartFromProduct(product) {
  const id = String(product.ID || product.id);
  const cart = loadCart();
  if (!cart[id]) cart[id] = { id, name: product.name, price: product.price, qty: 0, available: product.available || null };
  const desired = cart[id].qty + 1;
  if (cart[id].available && desired > cart[id].available) { showToast('Stock Limit — Cannot Add More'); return; }
  cart[id].qty = desired;
  saveCart(cart);
  showToast('Added to cart');
}

function setQty(id, qty) {
  const cart = loadCart();
  if (!cart[id]) return;
  qty = Number(qty);
  if (qty <= 0) { delete cart[id]; } else {
    if (cart[id].available && qty > cart[id].available) qty = cart[id].available;
    cart[id].qty = qty;
  }
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = loadCart();
  delete cart[id];
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CFG.CART_KEY);
  renderCart();
  updateFloating();
}

function cartTotals() {
  const cart = loadCart();
  let count = 0,
    total = 0;
  Object.values(cart).forEach(it => {
    count += Number(it.qty || 0);
    total += (Number(it.price || 0) * Number(it.qty || 0));
  });
  return { count, total };
}

function updateFloating() {
  const { count, total } = cartTotals();
  const cnt = $('#es-cart-count');
  const tot = $('#es-cart-total');
  if (cnt) cnt.textContent = count;
  if (tot) tot.textContent = money(total);
}

(function createToast() {
  if ($('#es-toast')) return;
  const t = document.createElement('div');
  t.id = 'es-toast';
  t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:96px;background:rgba(0,0,0,.8);color:#fff;padding:8px 12px;border-radius:8px;z-index:1600;opacity:0;transition:all .18s';
  document.body.appendChild(t);
})();

let _toastTimer = null;

function showToast(msg = 'Done') {
  const t = $('#es-toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.style.opacity = '0', 1600);
}

const Sections = {
  'topSale': $('#topSaleGrid'),
  'robotics': $('#roboticsGrid'),
  'diy': $('#diyGrid'),
  'microelectronics': $('#microGrid')
};

let PRODUCTS = {};

function escapeHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function renderCart() {
  const list = $('#es-cart-list');
  if (!list) return;
  list.innerHTML = '';
  const cart = loadCart();
  const keys = Object.keys(cart);
  if (!keys.length) { $('#es-cart-empty').style.display = 'block'; } else { $('#es-cart-empty').style.display = 'none'; }
  keys.forEach(k => {
    const it = cart[k];
    const div = document.createElement('div');
    div.className = 'cart-item';
    const imgSrc = CFG.IMG_BASE + it.id + '.png';
    div.innerHTML = `
        <img src="${imgSrc}" alt="${escapeHtml(it.name)}" onerror="this.style.opacity='.4'">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:800">${escapeHtml(it.name)}</div>
            <div style="font-weight:800">${money(it.price)}</div>
          </div>
          <div style="margin-top:7px;display:flex;justify-content:space-between;align-items:center">
            <div class="qty-control">
              <button class="qty-dec" data-id="${it.id}">−</button>
              <div style="min-width:28px;text-align:center">${it.qty}</div>
              <button class="qty-inc" data-id="${it.id}">+</button>
            </div>
            <div><button class="btn remove-btn" data-id="${it.id}">Remove</button></div>
          </div>
        </div>
      `;
    list.appendChild(div);
  });
  $('#es-cart-subtotal').textContent = money(cartTotals().total);
  updateFloating();
}

function populateCheckout(singleId) {
  const container = $('#es-checkout-items');
  container.innerHTML = '';
  let items = [];
  if (singleId) {
    const p = PRODUCTS[String(singleId)];
    if (p) items = [{ id: String(p.ID || p.id), name: p.name, price: p.price, qty: 1 }];
  } else {
    const cart = loadCart();
    items = Object.values(cart).map(it => ({ id: it.id, name: it.name, price: it.price, qty: it.qty }));
  }
  if (!items.length) container.innerHTML = '<div style="color:#666">No items to checkout.</div>';
  items.forEach(it => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.innerHTML = `<div>${escapeHtml(it.name)} <small style="color:#666">x${it.qty}</small></div><div style="font-weight:800">${money(it.price*it.qty)}</div>`;
    container.appendChild(row);
  });
  const itemsTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = itemsTotal > 0 ? deliveryPrice : 0;
  $('#es-co-items').textContent = money(itemsTotal);
  $('#es-co-delivery').textContent = money(delivery);
  $('#es-co-grand').textContent = money(itemsTotal + delivery);
  
  // populate saved addresses
  const addrs = safeload(CFG.ADDR_KEY, []);
  const datalist = $('#es-address-list');
  datalist.innerHTML = '';
  addrs.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    datalist.appendChild(opt);
  });
  // prefills
  const lastName = localStorage.getItem(CFG.LAST_NAME_KEY) || '';
  const lastPhone = localStorage.getItem(CFG.LAST_PHONE_KEY) || '';
  $('#es-name').value = lastName;
  $('#es-phone').value = lastPhone;
  if (addrs.length && !$('#es-address').value) $('#es-address').value = addrs[0] || '';
}

function buildWhatsAppMessage(singleId) {
  const lines = [];
  lines.push('```আসসালামু আলাইকুম। আমি অর্ডার করতে চাই — খুব আদবসহ:```');
  lines.push('');
  lines.push('*Order Details:*');
  lines.push('');
  let items = [];
  if (singleId) {
    const p = PRODUCTS[String(singleId)];
    if (p) items = [{ name: p.name, qty: 1, price: p.price }];
  } else {
    const cart = loadCart();
    items = Object.values(cart).map(it => ({ name: it.name, qty: it.qty, price: it.price }));
  }
  items.forEach((it, i) => lines.push(`${i+1+'.'} \`${it.name}\` × \`${it.qty}\` — ${money(it.price * it.qty)}
`));
  const itemsTotal = items.reduce((s, i) => s + (i.price * i.qty), 0);
  const delivery = itemsTotal > 0 ? deliveryPrice : 0;
  lines.push('*-------------------------*');
  lines.push(`Items total: ${money(itemsTotal)}`);
  lines.push(`Delivery: ${money(delivery)}`);
  lines.push(`Grand total: \`${money(itemsTotal + delivery)}\``);
  lines.push('*-------------------------*');
  lines.push('');
  const name = $('#es-name').value.trim() || '(নাম নেই)';
  const phone = $('#es-phone').value.trim() || '(ফোন নেই)';
  const address = $('#es-address').value.trim() || '(ঠিকানা নেই)';
  lines.push(`*Name:*  \`${name}\``);
  lines.push(`*Phone:*  ${phone}`);
  lines.push(`*Address:*
> \`${address}\``);
  lines.push('');
  lines.push('```আপনি কি কনফার্ম করবেন? ধন্যবাদ।```');
  return lines.join('\n');
}

function buildPlainMessage(singleId) {
  const lines = [];
  lines.push('আসসালামু আলাইকুম। আমি অর্ডার করতে চাই —');
  lines.push('');
  lines.push('Order Details:');
  lines.push('');
  
  let items = [];
  if (singleId) {
    const p = PRODUCTS[String(singleId)];
    if (p) items = [{ name: p.name, qty: 1, price: p.price }];
  } else {
    const cart = loadCart();
    items = Object.values(cart).map(it => ({ name: it.name, qty: it.qty, price: it.price }));
  }
  
  items.forEach((it, i) => {
    lines.push(`${i+1}. ${it.name} × ${it.qty} — ${money(it.price * it.qty)}`);
  });
  
  const itemsTotal = items.reduce((s, i) => s + (i.price * i.qty), 0);
  const delivery = itemsTotal > 0 ? deliveryPrice : 0;
  
  lines.push('-------------------------');
  lines.push(`Items total: ${money(itemsTotal)}`);
  lines.push(`Delivery: ${money(delivery)}`);
  lines.push(`Grand total: ${money(itemsTotal + delivery)}`);
  lines.push('-------------------------');
  lines.push('');
  
  const name = $('#es-name').value.trim() || '(নাম নেই)';
  const phone = $('#es-phone').value.trim() || '(ফোন নেই)';
  const address = $('#es-address').value.trim() || '(ঠিকানা নেই)';
  
  lines.push(`Name: ${name}`);
  lines.push(`Phone: ${phone}`);
  lines.push(`Address: ${address}`);
  lines.push('');
  lines.push('আপনি কি কনফার্ম করবেন? ধন্যবাদ।');
  
  return lines.join('\n');
}

function openWhatsApp(singleId) {
  const msg = buildWhatsAppMessage(singleId);
  const url = 'https://wa.me/' + CFG.WHATSAPP + '?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
  if (!isSingleBuy) clearCart();
  else !isSingleBuy;
}

function openSMS(singleId) {
  const msg = buildPlainMessage(singleId);
  const phone = CFG.SMS_NUMBER;
  const url = "sms:" + phone + "?body=" + encodeURIComponent(msg);
  window.open(url, "_blank");
  if (!isSingleBuy) clearCart();
  else !isSingleBuy;
}

function openMessenger(singleId) {
  const mainBtn = document.getElementById("es-messenger-send");
  const msg = buildPlainMessage(singleId);
  const page = CFG.MESSENGER_PAGE;
  const url = "https://m.me/" + page;
  
  // Already in copy mode হলে কিছুই করবে না
  if (mainBtn.dataset.mode === "copy") return;
  
  // Save original HTML
  const originalHTML = mainBtn.innerHTML;
  
  // Enter copy mode
  mainBtn.dataset.mode = "copy";
  mainBtn.classList.add("copy-mode");
  
  mainBtn.innerHTML = `
    Copy this message?
    <div class="copy-box">
        Please Copy →
        <button class="copy-btn">Copy</button>
    </div>
  `;
  
  const copyBtn = mainBtn.querySelector(".copy-btn");
  
  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    
    navigator.clipboard.writeText(msg).then(() => {
      // Restore button
      mainBtn.innerHTML = originalHTML;
      mainBtn.classList.remove("copy-mode");
      delete mainBtn.dataset.mode;
      
      // Open Messenger
      window.open(url, "_blank");
      if (!isSingleBuy) clearCart();
      else !isSingleBuy;
    });
  });
}

function openMail(singleId) {
  const msg = buildPlainMessage(singleId);
  
  const email = CFG.MAIL_TO;
  const address = $('#es-address').value.trim();
  
  const subject = address ?
    `Order FROM "${address}"` :
    `Order FROM "SECRET"`;
  
  const url =
    "mailto:" + email +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(msg);
  
  window.open(url, "_blank");
      if (!isSingleBuy) clearCart();
      else !isSingleBuy;
}

function saveAddressAndContact() {
  const name = $('#es-name').value.trim();
  const phone = $('#es-phone').value.trim();
  const addr = $('#es-address').value.trim();
  if (!addr) { alert('ঠিকানা লিখুন'); return; }
  // save addresses unique, newest first
  let addrs = safeload(CFG.ADDR_KEY, []);
  addrs = addrs.filter(a => a !== addr);
  addrs.unshift(addr);
  while (addrs.length > 10) addrs.pop();
  saveJSON(CFG.ADDR_KEY, addrs);
  if (name) localStorage.setItem(CFG.LAST_NAME_KEY, name);
  if (phone) localStorage.setItem(CFG.LAST_PHONE_KEY, phone);
  populateCheckout(window.SINGLE_BUY || null);
  showToast('Address Saved Locally');
}
let pressTimer;

async function copyToClipboard(value) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    }
  } catch (e) {
    return false;
  }
}

async function handleLongPress(id) {
  if (navigator.vibrate) navigator.vibrate(80);
  
  const link = `https://electronicsstorebd.github.io/SEARCH?id=${id}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Product Link', url: link });
    } catch (err) {
      return false;
    }
  } else {
    copyToClipboard(link).then(e => {
      if (!e) alert('Please use a better browser2.');
      else showToast('Link Copied!');
    });
  }
}

$('#es-open-cart').addEventListener('click', () => {
  $('#es-cart-overlay').style.display = 'flex';
  $('#es-cart-overlay').classList.add('show');
  renderCart();
});
$('#es-close-cart').addEventListener('click', () => {
  $('#es-cart-overlay').style.display = 'none';
  $('#es-cart-overlay').classList.remove('show');
});
// proceed to checkout from cart
$('#es-proceed-checkout').addEventListener('click', () => {
  $('#es-cart-overlay').style.display = 'none';
  $('#es-cart-overlay').classList.remove('show');
  window.SINGLE_BUY = null;
  populateCheckout(null);
  $('#es-checkout-overlay').style.display = 'flex';
  $('#es-checkout-overlay').classList.add('show');
  runAutoShowTooltip(button, showTooltip, hideTooltip);
});
$('#es-clear-cart').addEventListener('click', () => {
  if (confirm('Clear cart?')) {
    clearCart();
    showToast('Cart cleared');
  }
});

$('#es-close-checkout').addEventListener('click', () => {
  $('#es-checkout-overlay').style.display = 'none';
  $('#es-checkout-overlay').classList.remove('show');
  if (isSingleBuy) !isSingleBuy;
});
$('#es-back-to-cart').addEventListener('click', () => {
  $('#es-checkout-overlay').style.display = 'none';
  $('#es-checkout-overlay').classList.remove('show');
  $('#es-cart-overlay').style.display = 'flex';
  $('#es-cart-overlay').classList.add('show');
  if (isSingleBuy) !isSingleBuy;
});

$('#es-save-address').addEventListener('click', saveAddressAndContact);
document.addEventListener('DOMContentLoaded', () => {
  const link = document.querySelector('#es-confirm-purchase');
  const container = document.querySelector('.sBtnCon');
  container.style.display = 'none';
  
  link.addEventListener('click', function(event) {
    event.preventDefault();
    
    const modal = $('#es-checkout-overlay .modal');
    if (container.style.display === 'none') {
      container.style.display = 'flex';
      this.classList.add('hide');
    }
    modal.scrollTo({
      top: modal.scrollHeight,
      behavior: 'smooth'
    });
  });
});



$('#es-whatsapp-send').addEventListener('click', (ev) => {
  ev.preventDefault();
  openWhatsApp(window.SINGLE_BUY || null);
});

$('#es-messenger-send').addEventListener('click', (ev) => {
  ev.preventDefault();
  openMessenger(window.SINGLE_BUY || null);
});

$('#es-messages-send').addEventListener('click', (ev) => {
  ev.preventDefault();
  openSMS(window.SINGLE_BUY || null);
});

$('#es-mail-send').addEventListener('click', (ev) => {
  ev.preventDefault();
  openMail(window.SINGLE_BUY || null);
});

async function startBoxPiP(boxId, fps = 2) {

  const box = document.getElementById(boxId);

  function boxToImage() {
    const xml = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${box.offsetWidth}" height="${box.offsetHeight}">
        <foreignObject width="100%" height="100%">
          ${new XMLSerializer().serializeToString(box)}
        </foreignObject>
      </svg>`;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    return img;
  }

  let video = document.getElementById("pipVideo");
  if (!video) {
    video = document.createElement("video");
    video.id = "pipVideo";
    video.muted = true;
    video.playsInline = true;
    video.style.display = "none";
    document.body.appendChild(video);
  }

  const off = document.createElement("canvas");
  const ctx = off.getContext("2d");

  const firstImg = boxToImage();
  await new Promise(res => firstImg.onload = res);

  off.width = firstImg.width;
  off.height = firstImg.height;
  ctx.drawImage(firstImg, 0, 0);

  const stream = off.captureStream(fps);
  video.srcObject = stream;
  await video.play();
  video.requestPictureInPicture().catch(() => {});
  window.location.href = "tel:+8801872605055";

  // Continue updating PiP
  const loop = setInterval(() => {
    const img = boxToImage();
    img.onload = () => {
      ctx.clearRect(0, 0, off.width, off.height);
      ctx.drawImage(img, 0, 0);
    };
  }, 1500);

  video.addEventListener("leavepictureinpicture", () => {
    clearInterval(loop);
    stream.getTracks().forEach(t => t.stop());
  });

}

document.body.addEventListener('click', (ev) => {
  const inc = ev.target.closest('.qty-inc');
  if (inc) { const id = inc.dataset.id; const cart = loadCart(); const it = cart[id]; if (it) setQty(id, Number(it.qty) + 1); return; }
  const dec = ev.target.closest('.qty-dec');
  if (dec) { const id = dec.dataset.id; const cart = loadCart(); const it = cart[id]; if (it) setQty(id, Number(it.qty) - 1); return; }
  const rem = ev.target.closest('.remove-btn');
  if (rem) { const id = rem.dataset.id; if (confirm('Remove item?')) removeFromCart(id); return; }
});

function attachToExistingButtons() {
  $$('.add-cart').forEach(btn => {
    if (btn.dataset.esAttached) return;
    btn.dataset.esAttached = '1';
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const cart = btn.closest('.cart');
      const id = cart.dataset.id;
      if (!id) { showToast('ID NOT FOUND'); return; }
      const prod = PRODUCTS[id] || { ID: id, name: cart.querySelector('.title')?.textContent?.trim() || ('Product ' + id), price: Number((cart.querySelector('.price')?.textContent || '').replace(/[^\d.]/g, '')) || 0, available: null };
      addToCartFromProduct(prod);
    });
  });
  $$('.buy-now').forEach(btn => {
    if (btn.dataset.esAttached) return;
    btn.dataset.esAttached = '1';
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const cart = btn.closest('.cart');
      const id = cart.dataset.id;
      if (!id) { showToast('ID NOT FOUND'); return; }
      window.SINGLE_BUY = id;
      populateCheckout(id);
      $('#es-checkout-overlay').style.display = 'flex';
      $('#es-checkout-overlay').classList.add('show');
      runAutoShowTooltip(button, showTooltip, hideTooltip);
      isSingleBuy = true;
    });
  });
  $$('.cart').forEach(btn => {
    // --- Mobile Touch ---
    btn.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => handleLongPress(btn.dataset.id), 600);
    });
    btn.addEventListener('touchend', () => clearTimeout(pressTimer));
    btn.addEventListener('touchmove', () => clearTimeout(pressTimer));
    
    // --- Desktop Mouse ---
    btn.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => handleLongPress(btn.dataset.id), 600);
    });
    btn.addEventListener('mouseup', () => clearTimeout(pressTimer));
    btn.addEventListener('mouseleave', () => clearTimeout(pressTimer));
  });
}
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());
var globalList;

(function bootstrap() {
  fetch('/cart.json').then(r => r.json()).then(data => {
    const list = Array.isArray(data) ? data : (data.products || []);
    globalList = list;
    renderProducts(list);
    updateFloating();
    renderCart();
    attachToExistingButtons();
  })
})();
updateFloating();
renderCart();

(function() {
  const infoBtn = document.getElementById('infoBtn');
  let popup = null;
  let lastSelected = null;
  
  const options = [
    { id: 'narayanganj', name: 'Inside of Narayanganj', price: 80 },
    { id: 'dhaka', name: 'Inside of Dhaka', price: 110 },
    { id: 'rest', name: 'All over Bangladesh', price: 130 }
  ];
  
  function createPopup() {
    const el = document.createElement('div');
    el.className = 'info-popup';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    
    el.innerHTML = `
          <div class="info-header">
            <div class="info-title">Delivery charge info</div>
            <button class="icon-btn" id="closePopup" aria-label="close">✕</button>
          </div>
          <div class="info-desc">Choose a delivery zone to see the charge. Select and confirm.</div>
          <form id="zoneForm">
            <div class="zone">
              ${options.map(opt => `
                <label class="zone-item" for="${opt.id}">
                  <input type="radio" name="delivery_zone" id="${opt.id}" value="${opt.price}" ${lastSelected === opt.id ? 'checked' : ''}>
                  <div class="zone-meta">
                    <div class="zone-name">${opt.name}</div>
                    <div class="zone-price">Tk ${opt.price}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </form>

          <div class="actions">
            <div class="selected-price">Selected: Tk <span id="selectedValue">${lastSelected ? options.find(o=>o.id===lastSelected).price : '-'}</span></div>
            <div style="margin-left:auto;display:flex;gap:8px">
              <button class="btn ghost" id="closeBtn">Cancel</button>
              <button class="btn primary" id="confirmBtn">Confirm</button>
            </div>
          </div>
        `;
    
    setTimeout(() => {
      el.querySelectorAll('input[name="delivery_zone"]').forEach(r => {
        r.addEventListener('change', onRadioChange);
      });
      el.querySelector('#confirmBtn').addEventListener('click', onConfirm);
      el.querySelector('#closeBtn').addEventListener('click', removePopup);
      el.querySelector('#closePopup').addEventListener('click', removePopup);
      document.addEventListener('keydown', onKeyDown);
    }, 0);
    
    return el;
  }
  
  function onRadioChange(e) {
    const val = e.target.value;
    const span = popup.querySelector('#selectedValue');
    if (span) span.textContent = val;
  }
  
  function onConfirm(e) {
    e.preventDefault();
    let pPrice = parseFloat($('#es-co-grand').textContent.replace(/[^\d.]/g, '')) - deliveryPrice;
    const checked = popup.querySelector('input[name="delivery_zone"]:checked');
    deliveryPrice = checked ? parseFloat(checked.value) : 0;
    $('#es-co-delivery').textContent = money(deliveryPrice);
    $('#es-co-grand').textContent = money(pPrice + deliveryPrice);
    if (checked) {
      lastSelected = checked.id;
      showToast(`Selected delivery charge: Tk ${checked.value}`);
    }
    removePopup();
  }
  function onKeyDown(e) { if (e.key === 'Escape') removePopup(); }
  
  function removePopup() {
    if (!popup) return;
    document.removeEventListener('keydown', onKeyDown);
    popup.remove();
    popup = null;
  }

  function openPopupNear(target) {
    removePopup();
    popup = createPopup();
    document.body.appendChild(popup);
    
    const rect = target.getBoundingClientRect();
    const pw = popup.offsetWidth;
    const ph = popup.offsetHeight;
    const margin = 10;
    
    let top = rect.bottom + margin;
    let left = rect.right - pw;
    
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (left < 8) left = 8;
    if (top + ph > window.innerHeight - 8) top = rect.top - ph - margin;
    if (top < 8) top = 8;
    
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
  }
  
  document.addEventListener('click', function(e) {
    if (!popup) return;
    if (popup.contains(e.target)) return;
    if (infoBtn.contains(e.target)) return;
    removePopup();
  });
  
  infoBtn?.addEventListener('click', function(e) {
    if (popup) { removePopup(); return; }
    openPopupNear(infoBtn);
  });
  
})();

document.addEventListener("DOMContentLoaded", () => {
  
  if (!button) return;
  const tooltipText = "Check Delivery Details for Your Location.";
  const wrapper = document.createElement("div");
  wrapper.className = "tooltip-wrapper";
  
  if (button.parentNode) {
    button.parentNode.insertBefore(wrapper, button);
    wrapper.appendChild(button);
  } else return;
  
  tooltip.className = "dynamic-tooltip";
  tooltip.innerHTML = `${tooltipText} <div class="tooltip-arrow"></div>`;
  wrapper.appendChild(tooltip);
});

const tooltip = document.createElement("div");
const button = document.getElementById("infoBtn");
const showTooltip = () => tooltip.classList.add("visible");
const hideTooltip = () => tooltip.classList.remove("visible");

function runAutoShowTooltip(targetButton, showFn, hideFn, delay = 1000, duration = 5000) {
  if (!targetButton || !showFn || !hideFn) return;
  setTimeout(() => {
    showFn();
    setTimeout(() => {
      hideFn();
    }, duration);
  }, delay);
}
