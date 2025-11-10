// Interacciones básicas del sitio
document.getElementById('year').textContent = new Date().getFullYear();

// Ver catálogo: ahora abre otro HTML
document.getElementById('btnCatalogo').addEventListener('click', function(){
    window.location.href = 'index 2.html';
});

//carrito
document.getElementById('btnCarrito').addEventListener('click', function(){
    window.location.href = 'index 3.html';
});


// Abrir y cerrar el modal
const modal = document.getElementById('modalBackdrop');
function openModal(contentHtml){
    document.getElementById('modalContent').innerHTML = contentHtml;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
}
function closeModal(){
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
}

// Abrir detalles del producto
function openDetails(e){
    e.stopPropagation();
    const card = e.currentTarget.closest('.card');
    const title = card.dataset.title || card.querySelector('h3').textContent;
    const desc = card.dataset.desc || card.querySelector('p').textContent;
    const price = card.querySelector('.price') ? card.querySelector('.price').textContent : '';
    const html = `
        <h3 style="margin-top:0">${title} <span style="color:var(--muted);font-weight:600;margin-left:8px">${price}</span></h3>
        <p style="color:var(--muted)">${desc}</p>
        <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn primary" onclick="checkout('${escapeHtml(title)}')">Comprar</button>
            <button class="btn" onclick="closeModal()">Cerrar</button>
        </div>
    `;
    document.getElementById('modalTitle').textContent = title;
    openModal(html);
}

// Añadir al carrito
function addToCart(e){
    e.stopPropagation();
    const card = e.currentTarget.closest('.card');
    const title = card.dataset.title || card.querySelector('h3').textContent;
    alert('Añadido al carrito: ' + title);
}

// Abrir reserva
function openBooking(){
    openModal('<h3 style="margin-top:0">Reservar cita</h3><p style="color:var(--muted)">Envíanos un mensaje o llama para confirmar la compra.</p><div style="margin-top:12px"><a href="tel:3315-7122" style="color:var(--accent);font-weight:700;text-decoration:none">Llamar — 3315-7122</a></div>');
    document.getElementById('modalTitle').textContent = 'Reservas';
}

// Comprar
function checkout(item){
    closeModal();
    alert('Proceder a compra: ' + item);
}

// Cerrar modal al click fuera
modal.addEventListener('click', function(e){
    if(e.target === modal) closeModal();
});

// Cerrar modal con ESC
document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeModal();
});

// Función de escape de seguridad
function escapeHtml(s){
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

//carrucel de promociones 
document.addEventListener('DOMContentLoaded', function(){
        const promos = [
            {img:'https://mejoresmaquinasdecortarpelo.com/wp-content/uploads/2024/02/las-mejores-maquinas-de-cortar-pelo-del-mercado.webp', title:'Descuento 20% en Combo Premium', sub:'Solo por tiempo limitado', cta:'Aprovechar'},
            {img:'https://mejoresmaquinasdecortarpelo.com/wp-content/uploads/2023/12/Mejores-maquinas-clipper-del-mercado.webp', title:'Envío gratis en compras > 3000 Lps', sub:'Oferta válida en zona local', cta:'Ver Oferta'},
            {img:'https://mejoresmaquinasdecortarpelo.com/wp-content/uploads/2024/01/Mejores-trimmers-barberia-del-mercado.webp', title:'Kit Profesional + Regalo', sub:'Incluye funda y peines', cta:'Solicitar'}
        ];

        const container = document.createElement('div');
        container.className = 'promo-carousel';
        container.innerHTML = `
            <div class="promo-wrap" role="region" aria-label="Promociones">
                <div class="promo-slides" id="promoSlides"></div>
                <div class="promo-overlay" aria-hidden="true"></div>
                <div class="promo-nav">
                    <button class="promo-arrow" id="promoPrev" aria-label="Anterior">‹</button>
                    <button class="promo-arrow" id="promoNext" aria-label="Siguiente">›</button>
                </div>
                <div class="promo-dots" id="promoDots" aria-hidden="false"></div>
            </div>
        `;

        // header
        const header = document.querySelector('.hero');
        if(header && header.parentNode){
            header.parentNode.insertBefore(container, header.nextSibling);
        } else {
            document.body.insertBefore(container, document.body.firstChild);
        }

        const slidesEl = container.querySelector('#promoSlides');
        const dotsEl = container.querySelector('#promoDots');

        promos.forEach((p, i) => {
            const slide = document.createElement('div');
            slide.className = 'promo-slide';
            slide.style.backgroundImage = `url('${p.img}')`;
            slide.innerHTML = `
                <div class="promo-content" role="group" aria-roledescription="slide" aria-label="${p.title}">
                    <div class="promo-title">${p.title}</div>
                    <div class="promo-sub">${p.sub}</div>
                    <button class="promo-cta" data-index="${i}">${p.cta}</button>
                </div>
            `;
            slidesEl.appendChild(slide);

            const dot = document.createElement('button');
            dot.className = 'promo-dot';
            dot.setAttribute('data-index', i);
            dot.setAttribute('aria-label', 'Ir a promoción ' + (i+1));
            dotsEl.appendChild(dot);
        });

        let idx = 0;
        const total = promos.length;
        const update = () => {
            slidesEl.style.transform = `translateX(-${idx * 100}%)`;
            dotsEl.querySelectorAll('.promo-dot').forEach((d, i)=> d.classList.toggle('active', i===idx));
        };

        container.querySelector('#promoPrev').addEventListener('click', ()=> { idx = (idx-1+total)%total; update(); resetTimer(); });
        container.querySelector('#promoNext').addEventListener('click', ()=> { idx = (idx+1)%total; update(); resetTimer(); });
        dotsEl.addEventListener('click', (e)=> {
            const t = e.target;
            if(t && t.matches('.promo-dot')){ idx = Number(t.getAttribute('data-index')); update(); resetTimer(); }
        });

        // botones denegacion
        slidesEl.addEventListener('click', (e)=> {
            const t = e.target;
            if(t && t.matches('.promo-cta')){
                // comportamiento: scroll a catálogo y abrir modal (si existe)
                const catalog = document.getElementById('catalogo');
                if(catalog) catalog.scrollIntoView({behavior:'smooth'});
                // si hay botón para catálogo, simular click
                const btnCatalog = document.getElementById('btnCatalogo');
                if(btnCatalog) btnCatalog.click();
            }
        });

        // autoplay
        let interval = 4000;
        let timer = setInterval(()=> { idx = (idx+1)%total; update(); }, interval);
        const resetTimer = ()=> { clearInterval(timer); timer = setInterval(()=> { idx = (idx+1)%total; update(); }, interval); };

        container.querySelector('.promo-wrap').addEventListener('mouseenter', ()=> clearInterval(timer));
        container.querySelector('.promo-wrap').addEventListener('mouseleave', ()=> resetTimer());

        // init
        update();
    });

    