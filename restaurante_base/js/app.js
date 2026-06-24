// ============================================================
// app.js - Logica principal del Restaurante Ficticio
// Autor: Jordan Fadell Marin
// GitHub: Vyro07
// Curso: Ambiente Web Cliente Servidor
// ============================================================

// ─── DATOS DEL MENU ─────────────────────────────────────────
// Array de objetos con los platillos disponibles.
// No se modifica; es la fuente unica de verdad para el menu.
const menu = [
  { nombre: 'Bruschetta Clasica',    descripcion: 'Pan tostado con tomate y albahaca fresca',    precio: 4500,  categoria: 'Entrada'      },
  { nombre: 'Tabla de Quesos',        descripcion: 'Seleccion de quesos importados con mermelada', precio: 7800,  categoria: 'Entrada'      },
  { nombre: 'Lomo al Vino Tinto',     descripcion: 'Lomo de res en reduccion de vino tinto',       precio: 15500, categoria: 'Plato Fuerte' },
  { nombre: 'Pasta Carbonara',        descripcion: 'Pasta con tocino, huevo y queso parmesano',    precio: 10200, categoria: 'Plato Fuerte' },
  { nombre: 'Salmon a la Plancha',    descripcion: 'Filete de salmon con vegetales al vapor',      precio: 13800, categoria: 'Plato Fuerte' },
  { nombre: 'Tiramisu',              descripcion: 'Postre italiano con cafe y mascarpone',          precio: 5200,  categoria: 'Postre'       },
  { nombre: 'Cheesecake de Maracuya',descripcion: 'Cheesecake cremoso con coulis de maracuya',    precio: 4800,  categoria: 'Postre'       },
];

// ─── ALMACEN DE RESERVAS ─────────────────────────────────────
// Array donde se acumulan los objetos de reserva
// cada vez que el usuario envia el formulario valido.
const reservas = [];

// ─── ESTADO DEL FILTRO ACTIVO ────────────────────────────────
// Guarda la categoria seleccionada actualmente para no perder
// contexto al validar el formulario u otras operaciones.
let categoriaActiva = 'Todos';

// ============================================================
// renderMenu()
// Muestra todos los platillos del array 'menu' como cards
// dentro del contenedor #contenedor-menu del HTML.
// Recibe un array opcional 'platillos'; si no se pasa,
// usa el array completo 'menu'.
// ============================================================
function renderMenu(platillos) {
  // Si no se indica un subconjunto, mostrar todos los platillos
  const lista = platillos || menu;

  // Referencia al contenedor de cards en el DOM
  const contenedor = document.getElementById('contenedor-menu');

  // Limpiar el contenedor antes de insertar nuevas cards
  contenedor.innerHTML = '';

  // Iterar sobre cada platillo y crear su card dinamicamente
  lista.forEach(function(plato) {

    // Columna Bootstrap para el sistema de grillas
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-4';

    // Card principal con la clase requerida .card-plato
    const card = document.createElement('div');
    card.className = 'card-plato';

    // Etiqueta de categoria (Entrada, Plato Fuerte, Postre)
    const categoria = document.createElement('span');
    categoria.className = 'card-categoria';
    categoria.textContent = plato.categoria;

    // Nombre del platillo
    const nombre = document.createElement('h3');
    nombre.className = 'card-nombre';
    nombre.textContent = plato.nombre;

    // Descripcion del platillo
    const descripcion = document.createElement('p');
    descripcion.className = 'card-descripcion';
    descripcion.textContent = plato.descripcion;

    // Precio formateado en colones costarricenses (CRC)
    const precio = document.createElement('div');
    precio.className = 'card-precio';
    precio.textContent = '\u20A1' + plato.precio.toLocaleString('es-CR');

    // Armar la card con sus elementos internos
    card.appendChild(categoria);
    card.appendChild(nombre);
    card.appendChild(descripcion);
    card.appendChild(precio);

    // Insertar la card dentro de su columna Bootstrap
    col.appendChild(card);

    // Insertar la columna en el contenedor del menu
    contenedor.appendChild(col);
  });
}

// ============================================================
// filtrarCategoria(categoria)
// Filtra los platillos del menu segun la categoria recibida
// como argumento. Actualiza el boton activo visualmente y
// llama a renderMenu con la categoría filtrada
// ============================================================
function filtrarCategoria(categoria) {
  // Actualizar el estado del filtro activo
  categoriaActiva = categoria;

  // Obtener todos los botones de filtro del DOM
  const botones = document.querySelectorAll('.btn-filtro');

  // Recorrer los botones y marcar solo el que corresponde
  // a la categoria seleccionada con la clase 'activo'
  botones.forEach(function(boton) {
    boton.classList.remove('activo');
    // Comparar el texto del boton con la categoria recibida.
    // El boton 'Platos Fuertes' debe coincidir con 'Plato Fuerte'.
    const textBoton = boton.textContent.trim();
    if (
      textBoton === categoria ||
      (categoria === 'Todos' && textBoton === 'Todos') ||
      (categoria === 'Plato Fuerte' && textBoton === 'Platos Fuertes')
    ) {
      boton.classList.add('activo');
    }
  });

  // Determinar los platillos a mostrar segun la categoria
  if (categoria === 'Todos') {
    // Sin filtro: mostrar todo el array original
    renderMenu(menu);
  } else {
    // Filtrar el array y pasar el resultado a renderMenu
    const filtrados = menu.filter(function(plato) {
      return plato.categoria === categoria;
    });
    renderMenu(filtrados);
  }
}

// ============================================================
// validarFormulario()
// Valida cada campo obligatorio del formulario de reservas.
// Muestra mensajes de error con la clase .error-campo bajo
// cada campo invalido y aplica la clase .invalido al input.
// Habilita o deshabilita el boton de envio segun el resultado.
// Retorna:
//   true  - si todos los campos obligatorios son validos
//   false - si al menos un campo falla la validacion
// ============================================================
function validarFormulario() {
  // Obtener referencias a los campos del formulario
  const campoNombre   = document.getElementById('nombre');
  const campoCorreo   = document.getElementById('correo');
  const campoFecha    = document.getElementById('fecha');
  const campoHora     = document.getElementById('hora');
  const campoPersonas = document.getElementById('personas');

  // Extraer los valores actuales de cada campo (sin espacios sobrantes)
  const nombre   = campoNombre.value.trim();
  const correo   = campoCorreo.value.trim();
  const fecha    = campoFecha.value;
  const hora     = campoHora.value;
  const personas = parseInt(campoPersonas.value, 10);

  // Bandera que acumula el estado general de validacion
  let esValido = true;

  // ── Validar: Nombre completo ──────────────────────────────
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!nombre) {
    mostrarError('nombre', 'El nombre es obligatorio.');
    esValido = false;
  } else if (nombre.length < 5) {
    mostrarError('nombre', 'El nombre debe tener al menos 5 caracteres.');
    esValido = false;
  } else if (!regexNombre.test(nombre)) {
    mostrarError('nombre', 'El nombre solo puede contener letras y espacios.');
    esValido = false;
  } else {
    limpiarError('nombre');
  }

  // ── Validar: Correo electronico ───────────────────────────
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!correo) {
    mostrarError('correo', 'El correo electronico es obligatorio.');
    esValido = false;
  } else if (!regexCorreo.test(correo)) {
    mostrarError('correo', 'Por favor ingrese un correo valido (ej. nombre@dominio.com).');
    esValido = false;
  } else {
    limpiarError('correo');
  }

  // ── Validar: Fecha de reserva ─────────────────────────────
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Comparar solo la fecha, no la hora

  if (!fecha) {
    mostrarError('fecha', 'La fecha de reserva es obligatoria.');
    esValido = false;
  } else {
    // Construir la fecha seleccionada a medianoche local para evitar
    // desfases por zona horaria al comparar con new Date(fecha)
    const partes      = fecha.split('-');
    const fechaSeleccionada = new Date(
      parseInt(partes[0], 10),
      parseInt(partes[1], 10) - 1,
      parseInt(partes[2], 10)
    );
    if (fechaSeleccionada < hoy) {
      mostrarError('fecha', 'La fecha no puede ser anterior a hoy.');
      esValido = false;
    } else {
      limpiarError('fecha');
    }
  }

  // ── Validar: Hora ─────────────────────────────────────────
  if (!hora) {
    mostrarError('hora', 'Por favor seleccione una hora.');
    esValido = false;
  } else {
    limpiarError('hora');
  }

  // ── Validar: Numero de personas ───────────────────────────
  if (!campoPersonas.value) {
    mostrarError('personas', 'El numero de personas es obligatorio.');
    esValido = false;
  } else if (isNaN(personas) || personas < 1 || personas > 20) {
    mostrarError('personas', 'El numero de personas debe estar entre 1 y 20.');
    esValido = false;
  } else {
    limpiarError('personas');
  }

  // Habilitar o deshabilitar el boton segun el resultado global
  document.getElementById('btn-enviar').disabled = !esValido;

  return esValido;
}

// ─── AUXILIARES DE VALIDACION ────────────────────────────────

// mostrarError(campo, mensaje)
// Coloca el mensaje de error en el span .error-campo del campo
// indicado y agrega la clase .invalido al input para estilo rojo.
function mostrarError(campo, mensaje) {
  const input      = document.getElementById(campo);
  const spanError  = document.getElementById('error-' + campo);
  if (input)     input.classList.add('invalido');
  if (spanError) spanError.textContent = mensaje;
}

// limpiarError(campo)
// Elimina el mensaje de error y la clase .invalido del campo
// indicado, indicando que su valor es valido.
function limpiarError(campo) {
  const input      = document.getElementById(campo);
  const spanError  = document.getElementById('error-' + campo);
  if (input)     input.classList.remove('invalido');
  if (spanError) spanError.textContent = '';
}

// ============================================================
// agregarReserva()
// Lee los valores del formulario (ya validados) y crea
// un objeto de reserva que se guarda en el array 'reservas'.
// Luego crea una fila en la tabla HTML con la clase .fila-reserva
// y las filas VIP (6+ personas) reciben ademas la clase .vip.
// Al final limpia el formulario y llama a actualizarResumen().
// ============================================================
function agregarReserva() {
  // Leer los valores del formulario
  const nombre      = document.getElementById('nombre').value.trim();
  const correo      = document.getElementById('correo').value.trim();
  const fecha       = document.getElementById('fecha').value;
  const hora        = document.getElementById('hora').value;
  const personas    = parseInt(document.getElementById('personas').value, 10);
  const comentarios = document.getElementById('comentarios').value.trim();

  // Crear objeto de reserva y almacenarlo en el array
  const nuevaReserva = { nombre, correo, fecha, hora, personas, comentarios };
  reservas.push(nuevaReserva);

  // Mostrar la tabla si estaba oculta (primera reserva)
  const wrapperTabla = document.getElementById('wrapper-tabla');
  const tablaVacia   = document.getElementById('tabla-vacia');
  wrapperTabla.style.display = 'block';
  tablaVacia.style.display   = 'none';

  // Referencia al cuerpo de la tabla donde se insertan las filas
  const cuerpo = document.getElementById('cuerpo-tabla');

  // Crear la fila con la clase requerida .fila-reserva
  const fila = document.createElement('tr');
  fila.className = 'fila-reserva';

  // Las filas de grupos VIP (6 o mas personas) reciben clase extra
  if (personas >= 6) {
    fila.classList.add('vip');
  }

  // Formatear la fecha al formato local dd/mm/aaaa
  const partes        = fecha.split('-');
  const fechaFormateada = partes[2] + '/' + partes[1] + '/' + partes[0];

  // Crear las celdas de la fila
  const celdas = [
    nombre,
    correo,
    fechaFormateada,
    hora,
    personas >= 6
      ? personas + '<span class="badge-vip">VIP</span>'
      : personas
  ];

  celdas.forEach(function(contenido, indice) {
    const td = document.createElement('td');
    // La celda de personas puede contener HTML (badge VIP),
    // las demas se asignan como texto plano por seguridad
    if (indice === 4) {
      td.innerHTML = contenido;
    } else {
      td.textContent = contenido;
    }
    fila.appendChild(td);
  });

  // Insertar la nueva fila al final del cuerpo de la tabla
  cuerpo.appendChild(fila);

  // Actualizar el resumen estadistico de reservas
  actualizarResumen();

  // Limpiar todos los campos del formulario
  document.getElementById('form-reserva').reset();

  // Deshabilitar nuevamente el boton de envio hasta nueva validacion
  document.getElementById('btn-enviar').disabled = true;
}

// ============================================================
// actualizarResumen()
// Calcula y muestra en el elemento .resumen-reservas:
//   - Total de reservas registradas
//   - Total de personas esperadas
//   - Nombre del cliente con la reserva mas grande
// Se llama automaticamente despues de cada nueva reserva.
// ============================================================
function actualizarResumen() {
  // Total de reservas: simplemente la longitud del array
  const totalReservas = reservas.length;

  // Total de personas: sumar el campo 'personas' de cada reserva
  const totalPersonas = reservas.reduce(function(acum, r) {
    return acum + r.personas;
  }, 0);

  // Reserva con mayor numero de personas
  const reservaMayor = reservas.reduce(function(mayor, r) {
    return r.personas > mayor.personas ? r : mayor;
  }, reservas[0]);

  // Actualizar los elementos del DOM con los valores calculados
  document.getElementById('total-reservas').textContent = totalReservas;
  document.getElementById('total-personas').textContent = totalPersonas;

  // Mostrar el nombre del cliente con la reserva mas grande
  document.getElementById('mayor-reserva').textContent =
    reservaMayor.nombre + ' (' + reservaMayor.personas + ')';
}


// Se ejecuta cuando el documento HTML termina de cargarse.
// Renderiza el menu inicial y configura los listeners
// de validacion en tiempo real para cada campo.
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar todos los platillos al cargar la pagina
  renderMenu();

  // ── Validacion en tiempo real ─────────────────────────────
  // Escuchar cambios en cada campo obligatorio para validar
  // de forma inmediata sin esperar el submit
  const camposObligatorios = ['nombre', 'correo', 'fecha', 'hora', 'personas'];
  camposObligatorios.forEach(function(id) {
    const campo = document.getElementById(id);
    if (campo) {
      // Validar al escribir o cambiar el valor del campo
      campo.addEventListener('input', validarFormulario);
      campo.addEventListener('change', validarFormulario);
    }
  });
});


// Se previene la recarga de pagina por defecto y se ejecuta
// la validacion final antes de registrar la reserva.
// ============================================================
document.getElementById('form-reserva').addEventListener('submit', function(e) {
  // Prevenir que el formulario recargue la pagina
  e.preventDefault();

  // Ejecutar una validacion final por seguridad antes de guardar
  if (validarFormulario()) {
    agregarReserva();
  }
});