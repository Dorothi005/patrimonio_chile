// CONTROLADOR de sugerencias.html: READ (mostrar), UPDATE (editar) y DELETE (eliminar)
const COLOR_TIPO = {
    sugerencia: "text-bg-primary",
    consulta: "text-bg-info",
    reclamo: "text-bg-danger",
    felicitacion: "text-bg-success"
};
const COLOR_ESTADO = {
    nueva: "text-bg-warning",
    revisada: "text-bg-secondary",
    aceptada: "text-bg-success"
};

const cuerpoTabla = document.getElementById("tabla");
const resumen = document.getElementById("resumen");
const buscador = document.getElementById("buscador");
const filtroTipo = document.getElementById("filtroTipo");
const formEditar = document.getElementById("formEditar");
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditar"));
let idEnEdicion = null;

// READ: dibuja las tarjetas de resumen y la tabla
function mostrarResumen(lista) {
    const conteo = Negocio.contarPorTipo(lista);
    const tarjetas = [
        ["Total", lista.length, "text-bg-dark"],
        ["Sugerencias", conteo.sugerencia, COLOR_TIPO.sugerencia],
        ["Consultas", conteo.consulta, COLOR_TIPO.consulta],
        ["Reclamos", conteo.reclamo, COLOR_TIPO.reclamo],
        ["Felicitaciones", conteo.felicitacion, COLOR_TIPO.felicitacion]
    ];
    resumen.innerHTML = tarjetas.map(t =>
        '<div class="col"><div class="card ' + t[2] + '"><div class="card-body py-2">' +
        '<div class="fs-3 fw-bold">' + t[1] + '</div><div class="small">' + t[0] + '</div>' +
        '</div></div></div>'
    ).join("");
}

function crearFila(s, numero) {
    const id = Vista.escapar(s.id);
    return '<tr>' +
        '<td>' + numero + '</td>' +
        '<td>' + Vista.escapar(s.nombre) + '</td>' +
        '<td>' + Vista.escapar(s.correo) + '</td>' +
        '<td><span class="badge ' + (COLOR_TIPO[s.tipo] || "text-bg-secondary") + '">' + Vista.escapar(Negocio.TIPOS[s.tipo] || s.tipo) + '</span></td>' +
        '<td class="mensaje-corto" title="' + Vista.escapar(s.mensaje) + '">' + Vista.escapar(s.mensaje) + '</td>' +
        '<td><span class="badge text-capitalize ' + (COLOR_ESTADO[s.estado] || "text-bg-secondary") + '">' + Vista.escapar(s.estado) + '</span></td>' +
        '<td class="small">' + Vista.escapar(s.fecha) + '</td>' +
        '<td class="text-nowrap">' +
            '<button type="button" class="btn btn-sm btn-outline-primary me-1" data-accion="editar" data-id="' + id + '">Editar</button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger" data-accion="eliminar" data-id="' + id + '">Eliminar</button>' +
        '</td>' +
        '</tr>';
}

function mostrarTabla() {
    const todas = Datos.obtenerTodas();
    const filtradas = Negocio.filtrar(todas, buscador.value, filtroTipo.value);
    mostrarResumen(todas);

    if (filtradas.length === 0) {
        const texto = todas.length === 0
            ? "Aún no hay mensajes guardados. Envía uno desde Atención al cliente o carga los ejemplos."
            : "Ningún mensaje coincide con la búsqueda.";
        cuerpoTabla.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">' + texto + '</td></tr>';
        return;
    }
    cuerpoTabla.innerHTML = filtradas.map((s, i) => crearFila(s, i + 1)).join("");
}

// UPDATE: abre el modal con los datos del registro elegido
function abrirEdicion(id) {
    const s = Datos.obtenerPorId(id);
    if (!s) {
        Vista.mostrarToast("No se encontró el mensaje seleccionado.", "danger");
        mostrarTabla();
        return;
    }
    idEnEdicion = id;
    document.getElementById("editar-nombre").value = s.nombre || "";
    document.getElementById("editar-correo").value = s.correo || "";
    document.getElementById("editar-tipo").value = s.tipo;
    document.getElementById("editar-mensaje").value = s.mensaje || "";
    document.getElementById("editar-estado").value = s.estado;
    Vista.limpiarErrores("editar-");
    modalEditar.show();
}

formEditar.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const datos = Vista.leerCampos("editar-");
    const errores = Negocio.validar(datos);

    if (Object.keys(errores).length === 0 && Negocio.esDuplicado(Datos.obtenerTodas(), datos, idEnEdicion)) {
        errores.mensaje = "Ya existe un mensaje idéntico con este correo.";
    }
    Vista.mostrarErrores("editar-", errores);
    if (Object.keys(errores).length > 0) {
        return;
    }

    try {
        const actualizado = Datos.actualizar(idEnEdicion, Negocio.armarCambios(datos));
        if (!actualizado) {
            Vista.mostrarToast("No se encontró el mensaje para actualizar.", "danger");
        } else {
            Vista.mostrarToast("Mensaje actualizado correctamente.", "success");
        }
        modalEditar.hide();
        mostrarTabla();
    } catch (error) {
        console.error(error);
        Vista.mostrarToast("No se pudo guardar el cambio.", "danger");
    }
});

formEditar.addEventListener("input", function (evento) {
    evento.target.classList.remove("is-invalid");
});

// DELETE: elimina solo el registro elegido, con confirmación
function eliminar(id) {
    const s = Datos.obtenerPorId(id);
    if (!s) {
        mostrarTabla();
        return;
    }
    if (!confirm("¿Eliminar el mensaje de " + s.nombre + "? Esta acción no se puede deshacer.")) {
        return;
    }
    try {
        Datos.eliminar(id);
        Vista.mostrarToast("Mensaje eliminado.", "success");
    } catch (error) {
        console.error(error);
        Vista.mostrarToast("No se pudo eliminar el mensaje.", "danger");
    }
    mostrarTabla();
}

// Los botones de cada fila se manejan desde la tabla completa
cuerpoTabla.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) {
        return;
    }
    if (boton.dataset.accion === "editar") {
        abrirEdicion(boton.dataset.id);
    } else if (boton.dataset.accion === "eliminar") {
        eliminar(boton.dataset.id);
    }
});

// Búsqueda, filtro y ejemplos
buscador.addEventListener("input", mostrarTabla);
filtroTipo.addEventListener("change", mostrarTabla);
document.getElementById("btnEjemplos").addEventListener("click", function () {
    try {
        const agregados = Datos.cargarEjemplos();
        Vista.mostrarToast(agregados > 0 ? agregados + " mensajes de ejemplo cargados." : "Los ejemplos ya estaban cargados.", agregados > 0 ? "success" : "info");
    } catch (error) {
        console.error(error);
        Vista.mostrarToast("No se pudieron cargar los ejemplos.", "danger");
    }
    mostrarTabla();
});

// Al abrir la página se muestra todo lo guardado
mostrarTabla();
