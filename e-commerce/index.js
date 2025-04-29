// Variables globales
let productos = [];
let paginas = [];
let paginaActual = 1;
const productosPorPagina = 12;

const productosContainer = document.getElementById("productos-container");
const paginacionContainer = document.getElementById("paginacion-container");

const loginForm = document.getElementById("loginForm");
const signInForm = document.getElementById("signInForm");

// Cuando el documento este listo

document.addEventListener("DOMContentLoaded", async function () {
    console.log("Script cargado correctamente");

    await validarToken();
    actualizarBotonCuenta();

    await cargarProductos();
    actualizarContadorCarrito();

    // Configurar modales
    const loginModalEl = document.getElementById("loginModal");
    const signInModalEl = document.getElementById("signInModal");

    const loginModal = new bootstrap.Modal(loginModalEl);
    const signInModal = new bootstrap.Modal(signInModalEl);

    document.querySelector(".switch-to-signup").addEventListener("click", (e) => {
        e.preventDefault();
        loginModal.hide();
        setTimeout(() => signInModal.show(), 500);
    });

    document.querySelector(".switch-to-login").addEventListener("click", (e) => {
        e.preventDefault();
        signInModal.hide();
        setTimeout(() => loginModal.show(), 500);
    });

    signInModalEl.addEventListener('hidden.bs.modal', function () {
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    });

    // REGISTRO (SIGN UP)
    signInForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nombre = document.getElementById("firstName").value;
        const apellido = document.getElementById("lastName").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, apellido, email, password, rol: "client" })
            });

            const data = await response.json();

            if (response.ok) {
                alert("User registered successfully!");
                signInModal.hide();
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            } else {
                alert(data.error || "Registration failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Server connection error.");
        }
    });
});

// Cargar productos
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        productos = await response.json();

        productos.sort((a, b) => a.categoria.localeCompare(b.categoria));

        dividirEnPaginas();
        mostrarPaginaActual();

        console.log("Productos cargados:", productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function dividirEnPaginas() {
    paginas = [];
    let paginaTemp = [];

    productos.forEach(producto => {
        if (paginaTemp.length < productosPorPagina) {
            paginaTemp.push(producto);
        } else {
            paginas.push(paginaTemp);
            paginaTemp = [producto];
        }
    });

    if (paginaTemp.length > 0) {
        paginas.push(paginaTemp);
    }
}

function mostrarPaginaActual() {
    productosContainer.innerHTML = "";

    if (!paginas.length) {
        productosContainer.innerHTML = "<p>No se encontraron productos.</p>";
        return;
    }

    const productosPagina = paginas[paginaActual - 1];

    productosPagina.forEach((producto) => {
        const productoHTML = `
            <div class="col-md-3 producto">
                <div class="card">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">$${producto.precio}</p>
                        <p class="card-text"><strong>${producto.categoria}</strong></p>
                        <p class="card-text"><strong>Stock:</strong> ${producto.stock}</p>
                        <button class="btn btn-add-to-cart" data-nombre="${producto.nombre}">
                            Add to Cart <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        productosContainer.insertAdjacentHTML("beforeend", productoHTML);
    });

    actualizarBotonesAddToCart();
    actualizarPaginacion();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function actualizarBotonesAddToCart() {
    const botones = document.querySelectorAll('.btn-add-to-cart');
    botones.forEach(btn => {
        btn.onclick = function () {
            const nombreProducto = btn.getAttribute('data-nombre');
            const producto = productos.find(p => p.nombre === nombreProducto);
            if (producto) {
                agregarAlCarrito(producto);
            }
        };
    });
}

function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let productoExistente = carrito.find(item => item.nombre === producto.nombre);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarMensaje("Item successfully added to cart!");
}

function mostrarMensaje(mensaje) {
    let mensajeExito = document.getElementById("mensaje-exito");
    mensajeExito.textContent = mensaje;
    mensajeExito.classList.add("mostrar");
    mensajeExito.classList.remove("oculto");

    setTimeout(() => {
        mensajeExito.classList.remove("mostrar");
        mensajeExito.classList.add("oculto");
    }, 3000);
}

function actualizarContadorCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contador = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    document.getElementById("cart-counter").innerText = contador;
}

function actualizarBotonCuenta() {
    const accountLink = document.querySelector('.account');
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        accountLink.innerHTML = `<i class="fas fa-user"></i> ${user.nombre}`;
        accountLink.href = "#";
        accountLink.removeAttribute('data-bs-toggle');
        accountLink.removeAttribute('data-bs-target');
        accountLink.onclick = mostrarCuenta;
    } else {
        accountLink.innerHTML = '<i class="fas fa-user"></i> My Account';
        accountLink.href = "#";
        accountLink.setAttribute('data-bs-toggle', 'modal');
        accountLink.setAttribute('data-bs-target', '#loginModal');
        accountLink.onclick = null;
    }
}

function mostrarCuenta() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) return;

    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    const email = user.email || '';
    const rol = user.rol || 'client';

    const accountInfo = document.getElementById('accountInfo');
    accountInfo.innerHTML = `
        <p><strong>Name:</strong> ${nombre} ${apellido}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${rol}</p>
        <div class="d-flex flex-column align-items-center mt-4">
            <button id="editProfileBtn" class="btn btn-secondary mb-2" style="width: 60%;">Edit Profile</button>
            <button id="logoutBtn" class="btn btn-danger" style="width: 60%;">Logout</button>
        </div>
    `;

    const accountModal = new bootstrap.Modal(document.getElementById('accountModal'));
    accountModal.show();

    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Botón para mostrar formulario de edición
    setTimeout(() => {
        document.getElementById('editProfileBtn').addEventListener('click', function () {
            document.getElementById('editProfileForm').style.display = 'block';
            document.getElementById('editNombre').value = nombre;
            document.getElementById('editApellido').value = apellido;
            document.getElementById('editEmail').value = email;
        });
    }, 200);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    actualizarBotonCuenta();

    const accountModalInstance = bootstrap.Modal.getInstance(document.getElementById('accountModal'));
    if (accountModalInstance) {
        accountModalInstance.hide();
    }

    alert('Logged out successfully!');
}

function actualizarPaginacion() {
    paginacionContainer.innerHTML = "";

    if (paginas.length > 1) {
        const contenedorBotones = document.createElement("div");
        contenedorBotones.classList.add("paginacion-botones");

        const btnAnterior = document.createElement("button");
        btnAnterior.textContent = "←";
        btnAnterior.classList.add("btn-paginacion");
        btnAnterior.disabled = (paginaActual === 1);
        btnAnterior.addEventListener("click", function () {
            if (paginaActual > 1) {
                paginaActual--;
                mostrarPaginaActual();
            }
        });
        contenedorBotones.appendChild(btnAnterior);

        for (let i = 1; i <= paginas.length; i++) {
            const boton = document.createElement("button");
            boton.textContent = i;
            boton.classList.add("btn-paginacion");
            if (i === paginaActual) {
                boton.style.fontWeight = "bold";
            }
            boton.addEventListener("click", function () {
                paginaActual = i;
                mostrarPaginaActual();
            });
            contenedorBotones.appendChild(boton);
        }

        const btnSiguiente = document.createElement("button");
        btnSiguiente.textContent = "→";
        btnSiguiente.classList.add("btn-paginacion");
        btnSiguiente.disabled = (paginaActual === paginas.length);
        btnSiguiente.addEventListener("click", function () {
            if (paginaActual < paginas.length) {
                paginaActual++;
                mostrarPaginaActual();
            }
        });
        contenedorBotones.appendChild(btnSiguiente);

        paginacionContainer.appendChild(contenedorBotones);
    }
}

// EVENTOS DEL LOGIN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem('user', JSON.stringify(payload));
            alert('Login successful!');
            const loginModalEl = document.getElementById('loginModal');
            const loginModalInstance = bootstrap.Modal.getInstance(loginModalEl);
            if (loginModalInstance) {
                loginModalInstance.hide();
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '';
            }
            actualizarBotonCuenta();
        } else {
            alert(data.error || 'Invalid credentials.');
        }
    } catch (error) {
        console.error(error);
        alert('Connection error.');
    }
});

// BÚSQUEDA
document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    filtrarProductos();
});

document.getElementById("search-input").addEventListener("input", function () {
    filtrarProductos();
});

function filtrarProductos() {
    const texto = document.getElementById("search-input").value.trim().toLowerCase();

    if (texto === "") {
        dividirEnPaginas();
    } else {
        const productosFiltrados = productos.filter(producto => 
            producto.nombre.toLowerCase().includes(texto) || 
            producto.categoria.toLowerCase().includes(texto)
        );

        paginas = [];
        let paginaTemp = [];

        productosFiltrados.forEach(producto => {
            if (paginaTemp.length < productosPorPagina) {
                paginaTemp.push(producto);
            } else {
                paginas.push(paginaTemp);
                paginaTemp = [producto];
            }
        });

        if (paginaTemp.length > 0) {
            paginas.push(paginaTemp);
        }
    }

    paginaActual = 1;
    mostrarPaginaActual();
}

async function validarToken() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/users/validate-token', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        const data = await response.json();

        if (data.valid && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    } catch (error) {
        console.error("Error al validar el token:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

document.getElementById('editProfileForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('editNombre').value;
    const apellido = document.getElementById('editApellido').value;
    const email = document.getElementById('editEmail').value;
    const password = document.getElementById('editPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (password && password !== confirm) {
        alert('Passwords do not match.');
        return;
    }

    const data = { nombre, apellido, email };
    if (password) data.password = password;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        });

        const resData = await response.json();

        if (response.ok) {
            alert('Profile updated!');
            localStorage.setItem('user', JSON.stringify(resData.user));
            location.reload();
        } else {
            alert(resData.error || 'Error updating profile.');
        }
    } catch (error) {
        console.error(error);
        alert('Server connection error.');
    }
});
