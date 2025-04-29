document.addEventListener("DOMContentLoaded", function () {
    actualizarContadorCarrito();

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        if (email && password) {
            alert("Login successful!");
            loginForm.reset();

            // Verifica si el modal ya está inicializado
            const loginModalEl = document.getElementById('loginModal');
            let loginModal = bootstrap.Modal.getInstance(loginModalEl);
            if (!loginModal) {
                loginModal = new bootstrap.Modal(loginModalEl);
            }
            loginModal.hide(); // Cierra el modal después de iniciar sesión
        } else {
            alert("Please fill in all fields.");
        }
    });

    const loginModalEl = document.getElementById("loginModal");
    const signInModalEl = document.getElementById("signInModal");

    const loginModal = new bootstrap.Modal(loginModalEl);
    const signInModal = new bootstrap.Modal(signInModalEl);

    document.querySelector(".switch-to-signup").addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.hide();
        setTimeout(() => signInModal.show(), 500); // Espera un poco para evitar conflictos
    });

    document.querySelector(".switch-to-login").addEventListener("click", (e) => {
        e.preventDefault();
        signInModal.hide();
        setTimeout(() => loginModal.show(), 500);

        signInModalEl.addEventListener("hidden.bs.modal", () => {
            document.body.classList.remove("modal-open"); // Elimina la clase que oscurece la pantalla
            document.querySelector(".modal-backdrop")?.remove(); // Elimina el fondo oscuro si sigue ahí
        });
    });

    function actualizarContadorCarrito() {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        let contador = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
        document.getElementById("cart-counter").innerText = contador;
    }    

    const ordersContainer = document.getElementById("orders-container");

    async function cargarOrdenes() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': token
                }
            });

            const ordenes = await response.json();

            if (ordenes.length === 0) {
                ordersContainer.innerHTML = "<p class='text-center'>You don't have any orders yet.</p>";
                return;
            }

            ordenes.forEach((order, index) => {
                const orderDiv = document.createElement("div");
                orderDiv.classList.add("card", "mb-3", "p-3");

                let itemsHTML = "";
                order.items.forEach(item => {
                    const totalItemPrice = item.price * item.quantity;
                    itemsHTML += `
                        <li class="list-group-item">
                            ${item.quantity}x ${item.name} - $${item.price} each (Total: $${totalItemPrice})
                        </li>
                    `;
                });

                orderDiv.innerHTML = `
                    <h5><strong>Order ID:</strong> ${order._id}</h5>
                    <ul class="list-group mb-3">
                        ${itemsHTML}
                    </ul>
                    <p><strong>Total:</strong> $${order.total}</p>
                `;

                ordersContainer.appendChild(orderDiv);
            });
        } catch (error) {
            console.error("Error loading orders:", error);
            ordersContainer.innerHTML = "<p class='text-center'>Error loading your orders.</p>";
        }
    }

    cargarOrdenes();
});
