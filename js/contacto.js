// CONTROLADOR de contacto.html: CREATE (ingreso de datos)

const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function (evento) {
    // Frenamos el envío normal para validar y guardar
    evento.preventDefault();

    const datos = Vista.leerCampos("");
    const errores = Negocio.validar(datos);
    Vista.mostrarErrores("", errores);

    if (Object.keys(errores).length > 0) {
        Vista.mostrarAviso("danger", "Revisa los campos marcados en rojo.");
        return;
    }

    if (Negocio.esDuplicado(Datos.obtenerTodas(), datos, null)) {
        Vista.mostrarAviso("warning", "Ya recibimos un mensaje idéntico con este correo.");
        return;
    }

    try {
        Datos.crear(Negocio.armarSugerencia(datos));
        formulario.reset();
        Vista.mostrarAviso("success", "Su formulario se envió con éxito.");
    } catch (error) {
        console.error("No se pudo guardar en localStorage:", error);
        Vista.mostrarAviso("danger", "No se pudo guardar el formulario. Intenta de nuevo.");
    }
});

formulario.addEventListener("input", function (evento) {
    evento.target.classList.remove("is-invalid");
});
