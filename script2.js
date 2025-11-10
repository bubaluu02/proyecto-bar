// Página: ver todos los pedidos (estilo carrito)
        // Estructura mínima de un pedido:
        // { id, createdAt, status, customerName, items:[{id,title,price,qty,img}], shipping, note }

        const STORAGE_KEY = 'mis_pedidos_demo_v1';
        const $orders = document.getElementById('orders');
        const $empty = document.getElementById('empty');
        const $q = document.getElementById('q');

        function save(data){
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        function load(){
            try{
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            }catch(e){
                return [];
            }
        }

        function formatMoney(n){
            return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
        }

        function uid(prefix='id'){
            return prefix + '_' + Math.random().toString(36).slice(2,9);
        }

        function sampleOrders(){
            const now = Date.now();
            return [
                {
                    id: uid('ord'),
                    createdAt: now - 1000*60*60*24*2,
                    status: 'pendiente',
                    customerName: 'José A.',
                    note: 'Por favor entregar después de las 18:00',
                    shipping: 3.5,
                    items: [
                        { id: uid('it'), title:'Camiseta clásica', price:18.99, qty:2, img:'' },
                        { id: uid('it'), title:'Gorra unisex', price:12.5, qty:1, img:'' }
                    ]
                },
                {
                    id: uid('ord'),
                    createdAt: now - 1000*60*60*24*10,
                    status: 'entregado',
                    customerName: 'José A.',
                    note: '',
                    shipping: 0,
                    items: [
                        { id: uid('it'), title:'Auriculares inalámbricos', price:49.99, qty:1, img:'' },
                        { id: uid('it'), title:'Cable USB-C', price:6.9, qty:2, img:'' }
                    ]
                },
                {
                    id: uid('ord'),
                    createdAt: now - 1000*60*60*5,
                    status: 'enruta',
                    customerName: 'José A.',
                    note: 'Dejar en conserjería',
                    shipping: 4.99,
                    items: [
                        { id: uid('it'), title:'Manta suave', price:29.99, qty:1, img:'' }
                    ]
                }
            ];
        }

        function calcTotal(order){
            const itemsTotal = order.items.reduce((s,it) => s + it.price * it.qty, 0);
            return itemsTotal + (order.shipping || 0);
        }

        function statusClass(status){
            switch(status){
                case 'pendiente': return 'status-pendiente';
                case 'enruta': return 'status-enruta';
                case 'entregado': return 'status-entregado';
                case 'cancelado': return 'status-cancelado';
                default: return 'status-pendiente';
            }
        }

        function render(){
            const list = load();
            const q = $q.value.trim().toLowerCase();
            const filtered = list.filter(o => {
                if(!q) return true;
                if(o.id.toLowerCase().includes(q)) return true;
                if(o.customerName && o.customerName.toLowerCase().includes(q)) return true;
                if((o.note||'').toLowerCase().includes(q)) return true;
                if(o.items.some(it => it.title.toLowerCase().includes(q))) return true;
                return false;
            });

            $orders.innerHTML = '';
            if(filtered.length === 0){
                $empty.style.display = 'block';
                return;
            } else {
                $empty.style.display = 'none';
            }

            filtered.sort((a,b)=> b.createdAt - a.createdAt);

            for(const order of filtered){
                const el = document.createElement('article');
                el.className = 'order';
                el.innerHTML = `
                    <div class="order-header">
                        <div class="order-meta">
                            <div>
                                <div style="display:flex;gap:10px;align-items:center">
                                    <div style="font-weight:600">Pedido ${order.id}</div>
                                    <div class="badge ${statusClass(order.status)}">${order.status}</div>
                                </div>
                                <div class="order-info">${new Date(order.createdAt).toLocaleString()} · ${order.customerName}</div>
                            </div>
                        </div>
                        <div style="text-align:right">
                            <div style="font-weight:700;font-size:16px">${formatMoney(calcTotal(order))}</div>
                            <div class="order-info" style="margin-top:4px">${order.items.length} artículo(s)</div>
                        </div>
                    </div>

                    <div class="order-items" data-collapsed="true" style="display:none"></div>

                    <div class="order-footer">
                        <div class="muted">${order.note ? 'Nota: '+order.note : ''}</div>
                        <div class="actions">
                            <button class="btn" data-action="toggle">Ver / Ocultar</button>
                            <button class="btn primary" data-action="mark">${order.status === 'entregado' ? 'Marcar como pendiente' : 'Marcar como entregado'}</button>
                            <button class="btn" data-action="remove" style="background:#fff1f2;border-color:rgba(239,68,68,0.12);color:var(--danger)">Eliminar</button>
                        </div>
                    </div>
                `;

                // populate items area
                const container = el.querySelector('.order-items');
                for(const it of order.items){
                    const itemEl = document.createElement('div');
                    itemEl.className = 'item';
                    itemEl.innerHTML = `
                        <div class="thumb">${(it.title||'').slice(0,2).toUpperCase()}</div>
                        <div class="item-detail">
                            <div class="item-title">${it.title}</div>
                            <div class="item-meta">${it.qty} × ${formatMoney(it.price)} · Subtotal: <span class="price">${formatMoney(it.qty * it.price)}</span></div>
                        </div>
                        <div style="min-width:100px;text-align:right" class="muted">${formatMoney(it.qty * it.price)}</div>
                    `;
                    container.appendChild(itemEl);
                }
                // shipping line
                const shipLine = document.createElement('div');
                shipLine.style.display='flex';
                shipLine.style.justifyContent='space-between';
                shipLine.style.paddingTop='8px';
                shipLine.style.borderTop='1px dashed rgba(0,0,0,0.03)';
                shipLine.innerHTML = `<div class="muted">Envío</div><div style="font-weight:700">${formatMoney(order.shipping||0)}</div>`;
                container.appendChild(shipLine);

                // attach actions
                el.querySelector('[data-action="toggle"]').addEventListener('click', ()=> {
                    const isShown = container.style.display === 'block';
                    container.style.display = isShown ? 'none' : 'block';
                });
                el.querySelector('[data-action="remove"]').addEventListener('click', ()=> {
                    if(confirm('¿Eliminar pedido ' + order.id + '?')) {
                        removeOrder(order.id);
                    }
                });
                el.querySelector('[data-action="mark"]').addEventListener('click', ()=> {
                    toggleDelivered(order.id);
                });

                $orders.appendChild(el);
            }
        }

        function removeOrder(id){
            let data = load();
            data = data.filter(o=>o.id !== id);
            save(data);
            render();
        }

        function toggleDelivered(id){
            const data = load();
            for(const o of data){
                if(o.id === id){
                    o.status = (o.status === 'entregado') ? 'pendiente' : 'entregado';
                }
            }
            save(data);
            render();
        }

        // controls
        document.getElementById('sampleBtn').addEventListener('click', ()=>{
            const s = sampleOrders();
            save(s);
            render();
        });
        document.getElementById('clearBtn').addEventListener('click', ()=>{
            if(confirm('¿Borrar todos los pedidos?')) {
                save([]);
                render();
            }
        });
        $q.addEventListener('input', ()=> render());

        // initial render
        (function init(){
            // if storage empty, show empty message
            render();
        })();

        // Expose helper for debugging (opcional)
        window.__pedidos = {
            load, save, sampleOrders, render
        };