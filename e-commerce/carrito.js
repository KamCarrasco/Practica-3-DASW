document.addEventListener("DOMContentLoaded", function () {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    actualizarContadorCarrito();

    const cartContainer = document.getElementById("cart-container");
    const totalPriceEl = document.getElementById("total-price");
    const clearCartBtn = document.getElementById("clear-cart");
    const goToPaymentBtn = document.getElementById("go-to-payment");

    function actualizarContadorCarrito() {
        let contador = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
        document.getElementById("cart-counter").innerText = contador;
    }

    function renderizarCarrito() {
        cartContainer.innerHTML = "";

        if (carrito.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty.</p>";
            totalPriceEl.innerText = "0.00";
            return;
        }

        carrito.forEach((producto, index) => {
            const productoHTML = `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${producto.imagen}" class="img-fluid rounded-start" alt="${producto.nombre}">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${producto.nombre}</h5>
                                <p class="card-text">Price: $${producto.precio}</p>
                                <p class="card-text">
                                    Quantity: 
                                    <input type="number" min="1" value="${producto.cantidad}" class="form-control form-control-sm cantidad-input" data-index="${index}">
                                </p>
                                <button class="btn btn-danger btn-sm delete-item" data-index="${index}">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cartContainer.insertAdjacentHTML('beforeend', productoHTML);
        });

        document.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                carrito.splice(index, 1);
                guardarCarrito();
                renderizarCarrito();
            });
        });

        document.querySelectorAll('.cantidad-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = e.target.getAttribute('data-index');
                const nuevaCantidad = parseInt(e.target.value);
                if (nuevaCantidad > 0) {
                    carrito[index].cantidad = nuevaCantidad;
                    guardarCarrito();
                    actualizarContadorCarrito();
                    renderizarCarrito();
                }
            });
        });

        actualizarTotal();
    }

    function actualizarTotal() {
        const subtotal = carrito.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
        const shippingCost = 30;
        const total = subtotal + shippingCost;
        totalPriceEl.innerText = total.toFixed(2);
    }

    function guardarCarrito() {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    clearCartBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to empty the cart?")) {
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
            actualizarContadorCarrito();
        }
    });

    goToPaymentBtn.addEventListener("click", function () {
        if (carrito.length === 0) {
            alert("Your cart is empty.");
            return;
        }
    
        // Abre el modal de pago
        const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
        paymentModal.show();
    
        const modalBody = document.getElementById("modal-body");
        modalBody.innerHTML = `
            <h5>Order Summary:</h5>
            <ul class="list-group mb-3" id="modal-order-summary"></ul>
            <p><strong>Shipping Cost:</strong> $30.00</p>
            <p><strong>Total:</strong> $${(calcularSubtotal() + 30).toFixed(2)}</p>
            <button class="btn btn-primary w-100 mb-2" id="pay-btn">Pay</button>
        `;
    
        const modalOrderSummary = document.getElementById("modal-order-summary");
    
        carrito.forEach(producto => {
            const item = document.createElement("li");
            item.classList.add("list-group-item");
            item.innerHTML = `
                ${producto.cantidad}x ${producto.nombre} - $${producto.precio}
            `;
            modalOrderSummary.appendChild(item);
        });
    
        document.getElementById("pay-btn").addEventListener("click", finalizarCompra);
    });
    
    // Función auxiliar
    function calcularSubtotal() {
        return carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    }    

    async function finalizarCompra() {
        const orderData = {
            items: carrito.map(p => ({
                name: p.nombre,
                quantity: p.cantidad,
                price: p.precio,
                image: p.imagen
            })),
            total: (carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0) + 30).toFixed(2)
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                carrito = [];
                guardarCarrito();
                renderizarCarrito();
                actualizarContadorCarrito();

                document.querySelector(".row").innerHTML = `
                    <div class="col-12 text-center">
                        <h2>Order created successfully!</h2>
                        <a href="ordenes.html" class="btn btn-success mt-3">View My Orders</a>
                    </div>
                `;
            } else {
                const data = await response.json();
                alert(data.error || "Error creating order.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Server connection error.");
        }

        // 1. Cerrar el modal
    const paymentModalInstance = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    if (paymentModalInstance) {
        paymentModalInstance.hide();
    }

    // 2. Mostrar el mensaje de éxito
    document.querySelector(".container").innerHTML = `
        <div class="text-center mt-5">
            <h2>Order created successfully!</h2>
            <a href="ordenes.html" class="btn btn-success mt-3">View My Orders</a>
        </div>
    `;
    }

    renderizarCarrito();
});