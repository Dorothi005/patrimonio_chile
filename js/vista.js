// CAPA DE PRESENTACIÓN (funciones compartidas): lo que se muestra en pantalla.
const Vista = {
    CAMPOS: ["nombre", "correo", "tipo", "mensaje", "estado"],

    // Evita que el texto escrito por el usuario se interprete como código HTML
    escapar(texto) {
        return String(texto === undefined || texto === null ? "" : texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    },

    // Lee los campos del formulario. El prefijo permite reutilizar esto en el modal ("editar-")
    leerCampos(prefijo) {
        const datos = {};
        this.CAMPOS.forEach(campo => {
            const elemento = document.getElementById(prefijo + campo);
            if (elemento) {
                datos[campo] = elemento.value;
            }
        });
        return datos;
    },

    // Marca en rojo los campos con error y escribe el mensaje debajo
    mostrarErrores(prefijo, errores) {
        this.CAMPOS.forEach(campo => {
            const elemento = document.getElementById(prefijo + campo);
            const mensaje = document.getElementById("error-" + prefijo + campo);
            if (!elemento || !mensaje) {
                return;
            }
            if (errores[campo]) {
                elemento.classList.add("is-invalid");
                mensaje.textContent = errores[campo];
            } else {
                elemento.classList.remove("is-invalid");
                mensaje.textContent = "";
            }
        });
    },

    limpiarErrores(prefijo) {
        this.mostrarErrores(prefijo, {});
    },

    // Aviso dentro de la página (tipo: success, danger o warning)
    mostrarAviso(tipo, texto) {
        const aviso = document.getElementById("aviso");
        if (!aviso) {
            return;
        }
        aviso.className = "alert alert-" + tipo;
        aviso.textContent = texto;
        aviso.hidden = false;
    },

    // Aviso emergente en la esquina (tipo: success, danger, warning o info)
    mostrarToast(texto, tipo) {
        const toast = document.getElementById("toastAviso");
        if (!toast) {
            return;
        }
        toast.className = "toast align-items-center border-0 text-bg-" + (tipo || "success");
        document.getElementById("toastTexto").textContent = texto;
        bootstrap.Toast.getOrCreateInstance(toast).show();
    }
};
