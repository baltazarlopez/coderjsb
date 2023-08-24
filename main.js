document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("buscarBtn")
    .addEventListener("click", buscarProductos);
  inicioVenta();
});

const productos = [];

let carrito = [];

function agregarProductoAlCarrito(productoId, cantidad = 1) {
  const producto = productos.find((p) => p.id === productoId);
  if (producto) {
    const carritoItem = carrito.find((item) => item.id === productoId);
    if (carritoItem) {
      carritoItem.cantidad += cantidad;
    } else {
      carrito.push({ ...producto, cantidad: cantidad });
    }
  } else {
    alert("El producto seleccionado no existe.");
  }

  actualizarCarrito();
  calcularTotalCompras();
  guardarEnStorage();
}

function eliminarProductoDelCarrito(productoId) {
  const producto = carrito.find((item) => item.id === productoId);

  if (!producto) {
    alert("El producto seleccionado no existe.");
    return;
  }

  Swal.fire({
    title: "¿Estás seguro?",
    text: `Vas a eliminar el producto: ${producto.nombre}!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = carrito.filter((item) => item.id !== productoId);
      actualizarCarrito();
      calcularTotalCompras();
      guardarEnStorage();

      Swal.fire("Eliminado!", "El producto ha sido eliminado.", "success");
    }
  });
}

function calcularTotalCompras() {
  const total = carrito.reduce(
    (total, producto) => total + producto.precio * producto.cantidad,
    0
  );
  document.getElementById(
    "resultado"
  ).innerHTML = `<h2>Total de Compras: $${total.toFixed(2)}</h2>`;
}

function actualizarCarrito() {
  const carritoDiv = document.getElementById("carrito");
  carritoDiv.innerHTML = "<h2>Tu carrito de compras</h2>";

  carrito.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.className = "producto-card";

    // Agregar imagen del producto en el carrito
    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    productoDiv.appendChild(imagen);

    // Agregar nombre y precio del producto en el carrito
    const nombrePrecio = document.createElement("p");
    nombrePrecio.textContent = `${producto.nombre} - $${producto.precio.toFixed(
      2
    )} x ${producto.cantidad} = $${(
      producto.precio * producto.cantidad
    ).toFixed(2)}`;
    productoDiv.appendChild(nombrePrecio);

    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "Eliminar";
    eliminarBtn.addEventListener("click", () =>
      eliminarProductoDelCarrito(producto.id)
    );
    productoDiv.appendChild(eliminarBtn);

    carritoDiv.appendChild(productoDiv);
  });
}

function guardarEnStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarDesdeStorage() {
  const carritoStorage = localStorage.getItem("carrito");
  if (carritoStorage) {
    carrito = JSON.parse(carritoStorage);
    actualizarCarrito();
    calcularTotalCompras();
  }
}

//Fetch y API
async function obtenerDatos() {
  try {
    const response = await fetch("../stock.json");
    if (!response.ok) {
      throw new Error("No se pudieron obtener los datos. Inténtalo más tarde.");
    }
    const datos = await response.json();
    return datos;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function mostrarProductos(productos) {
  productos.forEach((producto) => {
    const productoDiv = document.createElement("div");
    productoDiv.className = "producto-card";
    productoDiv.style.opacity = "0";
    productoDiv.dataset.productId = producto.id;

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    productoDiv.appendChild(imagen);

    const nombrePrecio = document.createElement("p");
    nombrePrecio.textContent = `${producto.nombre} - $${producto.precio.toFixed(
      2
    )}`;
    productoDiv.appendChild(nombrePrecio);

    const cantidadInput = document.createElement("input");
    cantidadInput.type = "number";
    cantidadInput.value = 1;
    productoDiv.appendChild(cantidadInput);

    const agregarBtn = document.createElement("button");
    agregarBtn.textContent = "Agregar al carrito";
    agregarBtn.addEventListener("click", () => {
      const cantidad = parseInt(cantidadInput.value);
      if (!isNaN(cantidad) && cantidad > 0) {
        agregarProductoAlCarrito(producto.id, cantidad);
      }
    });
    productoDiv.appendChild(agregarBtn);

    productosDiv.appendChild(productoDiv);
  });

  productosDiv.querySelectorAll(".producto-card").forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = "1";
    }, index * 100);
  });
}

async function cargarProductos() {
  try {
    const datos = await obtenerDatos();
    productos.push(...datos);
    mostrarProductos(productos);
  } catch (error) {
    console.error(error);
  }
}

function inicioVenta() {
  cargarDesdeStorage();
  cargarProductos();
}

const productosDiv = document.getElementById("productos");
productosDiv.innerHTML = "";

function buscarProductos() {
  const input = document.getElementById("searchInput").value;
  const buscado = productos.find((prod) =>
    prod.nombre.toLowerCase().includes(input.toLowerCase())
  );

  const resultadoDiv = document.getElementById("resultado");
  if (buscado) {
    resultadoDiv.innerHTML = `<p>Producto encontrado: ${
      buscado.nombre
    } - Precio: $${buscado.precio.toFixed(2)}</p>`;
  } else {
    resultadoDiv.innerHTML = "<p>Producto no encontrado.</p>";
  }
}
