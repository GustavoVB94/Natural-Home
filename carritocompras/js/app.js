let productosGlobal = [];
let carrito = [];
let productosPorPagina = 8;
let paginaActual = 1;

async function obtenerProductos() {
    try {
        const response = await fetch('json/product.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    productosGlobal = data.productos;

    renderizarProductos();
    renderizarPaginacion();

  } catch (error) {
    console.error("Hubo un error:", error.message);
  }
}

function renderizarProductos() {
  const contenedorProductos = document.getElementById("productos-container");
  contenedorProductos.innerHTML = "";

  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productosGlobal.slice(inicio, fin);

  productosPagina.forEach(producto => {
    const divCol = document.createElement("div");
    divCol.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    const imagenPrincipal = producto.imagenes?.[0]
      ? `<img src="${producto.imagenes[0]}" class="card-img-top principal" alt="${producto.nombre}">`
      : "";
    const imagenSecundaria = producto.imagenes?.[1]
      ? `<img src="${producto.imagenes[1]}" class="card-img-top secundaria" alt="${producto.nombre}">`
      : "";

    divCol.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="imagenes-producto">
          ${imagenPrincipal}
          ${imagenSecundaria}
        </div>
        <div class="card-body d-flex flex-column">
          <h6 class="card-title fw-bold text-truncate" title="${producto.nombre}">
            ${producto.nombre}
          </h6>
          <p class="card-text text-muted mb-1">${producto.categoria}</p>
          <p class="card-text fw-bold text-success">$${producto.precio.toLocaleString()}</p>
          <button class="btn btn-success mt-auto" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio})">
            Agregar al carrito
          </button>
        </div>
      </div>
    `;

    contenedorProductos.appendChild(divCol);
  });
}


function renderizarPaginacion() {
  const paginacionContainer = document.getElementById("paginacion");
  paginacionContainer.innerHTML = "";

  const totalPaginas = Math.ceil(productosGlobal.length / productosPorPagina);

  // Botón anterior
  const liAnterior = document.createElement("li");
  liAnterior.className = `page-item ${paginaActual === 1 ? "disabled" : ""}`;
  liAnterior.innerHTML = `
    <a class="page-link" href="#" aria-label="Anterior">
      <span aria-hidden="true">&laquo;</span>
    </a>
  `;
  liAnterior.onclick = (e) => {
    e.preventDefault();
    if (paginaActual > 1) {
      paginaActual--;
      renderizarProductos();
      renderizarPaginacion();
    }
  };
  paginacionContainer.appendChild(liAnterior);

  // Números de página
  for (let i = 1; i <= totalPaginas; i++) {
    const liPagina = document.createElement("li");
    liPagina.className = `page-item ${i === paginaActual ? "active" : ""}`;
    liPagina.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    liPagina.onclick = (e) => {
      e.preventDefault();
      paginaActual = i;
      renderizarProductos();
      renderizarPaginacion();
    };
    paginacionContainer.appendChild(liPagina);
  }

  // Botón siguiente
  const liSiguiente = document.createElement("li");
  liSiguiente.className = `page-item ${paginaActual === totalPaginas ? "disabled" : ""}`;
  liSiguiente.innerHTML = `
    <a class="page-link" href="#" aria-label="Siguiente">
      <span aria-hidden="true">&raquo;</span>
    </a>
  `;
  liSiguiente.onclick = (e) => {
    e.preventDefault();
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderizarProductos();
      renderizarPaginacion();
    }
  };
  paginacionContainer.appendChild(liSiguiente);
}

function agregarAlCarrito(nombre, precio) {
    // Buscar si el producto ya está en el carrito
    const productoExistente = carrito.find(producto => producto.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad ++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }

    guardarCarritoEnLocalStorage();
    
    actualizarModalCarrito();
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function obtenerCarritoDeLocalStorage() {
    const carritoGuardado = localStorage.getItem("carrito");
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
}

carrito = obtenerCarritoDeLocalStorage();

function actualizarModalCarrito() {
    const carritoBody = document.getElementById('carrito-body');
    carritoBody.innerHTML = '';

    if (carrito.length === 0) {
        carritoBody.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-cart-x fs-1"></i>
                <p class="mt-2">Tu carrito está vacío</p>
            </div>
        `;
        document.getElementById("total-general").textContent = "0.00";
        return;
    }

    // Encabezado
    carritoBody.innerHTML = `
        <div class="row fw-semibold border-bottom pb-2 mb-3 text-center sticky-top bg-white">
            <div class="col-4 text-start">Producto</div>
            <div class="col-2">Precio</div>
            <div class="col-3">Cantidad</div>
            <div class="col-2">Total</div>
            <div class="col-1"></div>
        </div>
    `;

    let totalGeneral = 0;

    carrito.forEach((producto, index) => {
        const totalProducto = producto.precio * producto.cantidad;
        totalGeneral += totalProducto;

        const divProductoCarrito = document.createElement('div');
        divProductoCarrito.className = "row align-items-center mb-3 text-center border rounded p-2 shadow-sm producto";
        divProductoCarrito.innerHTML = `
            <div class="col-4 d-flex align-items-center text-start">
                <div>
                    <h6 class="mb-1 fw-semibold">${producto.nombre}</h6>
                </div>
            </div>
            <div class="col-2 fw-bold text-success">$${producto.precio.toFixed(2)}</div>
            <div class="col-3">
                <div class="input-group input-group-sm">
                    <button class="btn btn-outline-secondary restar">-</button>
                    <input type="text" class="form-control text-center cantidad" value="${producto.cantidad}">
                    <button class="btn btn-outline-secondary sumar">+</button>
                </div>
            </div>
            <div class="col-2 fw-bold total">$${totalProducto.toFixed(2)}</div>
            <div class="col-1">
                <button class="btn btn-outline-danger btn-sm eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        // Eventos dinámicos
        const inputCantidad = divProductoCarrito.querySelector(".cantidad");
        const btnSumar = divProductoCarrito.querySelector(".sumar");
        const btnRestar = divProductoCarrito.querySelector(".restar");
        const btnEliminar = divProductoCarrito.querySelector(".eliminar");

        btnSumar.addEventListener("click", () => {
            producto.cantidad++;
            guardarCarritoEnLocalStorage();
            actualizarModalCarrito();
        });

        btnRestar.addEventListener("click", () => {
            if (producto.cantidad > 1) {
                producto.cantidad--;
                guardarCarritoEnLocalStorage();
                actualizarModalCarrito();
            }
        });

        inputCantidad.addEventListener("input", () => {
            let nuevaCantidad = parseInt(inputCantidad.value);
            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                nuevaCantidad = 1;
            }
            producto.cantidad = nuevaCantidad;
            guardarCarritoEnLocalStorage();
            actualizarModalCarrito();
        });

        btnEliminar.addEventListener("click", () => {
            carrito.splice(index, 1);
            guardarCarritoEnLocalStorage();
            actualizarModalCarrito();
        });

        carritoBody.appendChild(divProductoCarrito);
    });

    // Mostrar total general
    document.getElementById("total-general").textContent = totalGeneral.toFixed(2);
}

actualizarModalCarrito();

obtenerProductos();

// Recuperar carrito al cargar cualquier página
document.addEventListener("DOMContentLoaded", () => {
  carrito = obtenerCarritoDeLocalStorage();
  if (document.getElementById("carrito-body")) {
    actualizarModalCarrito(); // funciona tanto para offcanvas como modal
  }
});

// CAMBIO DE IMAGEN EN MÓVILES (TOQUE)
document.addEventListener("DOMContentLoaded", () => {
  const tarjetas = document.querySelectorAll(".imagenes-producto");

  tarjetas.forEach(tarjeta => {
    let showingSecondary = false;

    tarjeta.addEventListener("touchstart", () => {
      const principal = tarjeta.querySelector(".principal");
      const secundaria = tarjeta.querySelector(".secundaria");

      if (secundaria) {
        if (!showingSecondary) {
          principal.style.opacity = "0";
          secundaria.style.opacity = "1";
        } else {
          principal.style.opacity = "1";
          secundaria.style.opacity = "0";
        }
        showingSecondary = !showingSecondary;
      }
    });
  });
});
