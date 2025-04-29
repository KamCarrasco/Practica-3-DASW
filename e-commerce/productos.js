document.addEventListener("DOMContentLoaded", function () {
    let productos = []; // ← Aquí inicializamos productos vacío
    const productListContainer = document.getElementById('productList');
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductForm = document.getElementById('addProductForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const productForm = document.getElementById('productForm');
    const resetBtn = document.getElementById('resetBtn');
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const editProductForm = document.getElementById('editProductForm');

    async function cargarProductos() {
        try {
            const response = await fetch('/api/productos');
            productos = await response.json();
            renderizarProductos(productos);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    function renderizarProductos(listaProductos) {
        productListContainer.innerHTML = '';

        listaProductos.forEach((producto) => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image">
                <h3>${producto.nombre}</h3>
                <p>Precio: $${producto.precio}</p>
                <p>Categoría: ${producto.categoria}</p>
                <p>Stock: ${producto.stock}</p>
                <button class="edit-btn" data-id="${producto._id}">Edit</button>
                <button class="delete-btn" data-id="${producto._id}">Delete</button>
            `;
            productListContainer.appendChild(productItem);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idProducto = e.target.getAttribute('data-id');
                if (confirm("¿Seguro que deseas eliminar este producto?")) {
                    eliminarProducto(idProducto);
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idProducto = e.target.getAttribute('data-id');

                try {
                    const response = await fetch(`/api/productos/${idProducto}`);
                    const producto = await response.json();

                    document.getElementById('editProductId').value = producto._id;
                    document.getElementById('editName').value = producto.nombre;
                    document.getElementById('editPrice').value = producto.precio;
                    document.getElementById('editCategory').value = producto.categoria;
                    document.getElementById('editImage').value = producto.imagen;
                    document.getElementById('editStock').value = producto.stock;

                    const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
                    editModal.show();
                } catch (error) {
                    console.error('Error al cargar producto:', error);
                    alert('No se pudo cargar la información del producto.');
                }
            });
        });
    }

    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editProductId').value;
        const nombre = document.getElementById('editName').value;
        const precio = document.getElementById('editPrice').value;
        const categoria = document.getElementById('editCategory').value;
        const imagen = document.getElementById('editImage').value;
        const stock = document.getElementById('editStock').value;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ nombre, precio, categoria, imagen, stock })
            });

            if (response.ok) {
                alert('Producto actualizado exitosamente!');
                const editModalInstance = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
                editModalInstance.hide();
                cargarProductos();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al actualizar producto.');
            }
        } catch (error) {
            console.error('Error al actualizar producto:', error);
        }
    });

    function filtrarProductos() {
        const searchText = searchInput.value.trim().toLowerCase();

        const productosFiltrados = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(searchText) ||
            producto.categoria?.toLowerCase().includes(searchText)
        );

        renderizarProductos(productosFiltrados);
    }

    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            filtrarProductos();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", filtrarProductos);
    }

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => addProductForm.style.display = 'flex');
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => addProductForm.style.display = 'none');
    }

    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nuevoProducto = {
                nombre: document.getElementById('name').value,
                precio: document.getElementById('price').value,
                categoria: document.getElementById('category').value,
                imagen: document.getElementById('image').value,
                stock: document.getElementById('stock').value
            };

            try {
                const token = localStorage.getItem('token');

                const response = await fetch('/api/productos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify(nuevoProducto)
                });

                if (response.ok) {
                    alert('Producto agregado exitosamente!');
                    productForm.reset();
                    addProductForm.style.display = 'none';
                    cargarProductos();
                } else {
                    const data = await response.json();
                    alert(data.error || 'Error al agregar producto.');
                }
            } catch (error) {
                console.error('Error al agregar producto:', error);
            }
        });
    }

    async function eliminarProducto(id) {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token
                }
            });

            if (response.ok) {
                alert('Producto eliminado exitosamente!');
                cargarProductos();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al eliminar producto.');
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    }

    // Llamamos al cargar la página
    cargarProductos();
    actualizarContadorCarrito();
});