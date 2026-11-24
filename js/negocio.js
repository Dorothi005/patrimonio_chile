// No toca la pantalla ni el almacenamiento: solo decide qué es válido y qué no.
const Negocio = {
    TIPOS: {
        sugerencia: "Sugerencia",
        consulta: "Consulta",
        reclamo: "Reclamo",
        felicitacion: "Felicitación"
    },
    ESTADOS: ["nueva", "revisada", "aceptada"],
    MINIMO_MENSAJE: 10,
    MAXIMO_MENSAJE: 500,
    REGEX_CORREO: /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/,

    // Revisa los datos y devuelve un objeto con los errores encontrados (vacío si todo está bien)
    validar(datos) {
        const errores = {};
        const nombre = (datos.nombre || "").trim();
        const correo = (datos.correo || "").trim();
        const mensaje = (datos.mensaje || "").trim();

        if (nombre === "") {
            errores.nombre = "El nombre no puede estar vacío.";
        } else if (nombre.length < 3) {
            errores.nombre = "El nombre debe tener al menos 3 caracteres.";
        }

        if (correo === "") {
            errores.correo = "El correo no puede estar vacío.";
        } else if (!this.REGEX_CORREO.test(correo)) {
            errores.correo = "Ingresa un correo completo, por ejemplo: nombre@gmail.com";
        }

        if (!Object.prototype.hasOwnProperty.call(this.TIPOS, datos.tipo)) {
            errores.tipo = "Selecciona un tipo de mensaje válido.";
        }

        if (mensaje === "") {
            errores.mensaje = "El mensaje no puede estar vacío.";
        } else if (mensaje.length < this.MINIMO_MENSAJE) {
            errores.mensaje = "El mensaje debe tener al menos " + this.MINIMO_MENSAJE + " caracteres.";
        } else if (mensaje.length > this.MAXIMO_MENSAJE) {
            errores.mensaje = "El mensaje no puede superar los " + this.MAXIMO_MENSAJE + " caracteres.";
        }

        // El estado solo existe al editar
        if (datos.estado !== undefined && !this.ESTADOS.includes(datos.estado)) {
            errores.estado = "Selecciona un estado válido.";
        }

        return errores;
    },

    // Regla de negocio: no se aceptan dos mensajes idénticos del mismo correo
    esDuplicado(lista, datos, idIgnorar) {
        const correo = (datos.correo || "").trim().toLowerCase();
        const mensaje = (datos.mensaje || "").trim().toLowerCase();
        return lista.some(s =>
            s.id !== idIgnorar &&
            (s.correo || "").trim().toLowerCase() === correo &&
            (s.mensaje || "").trim().toLowerCase() === mensaje
        );
    },

    // Regla de negocio: todo mensaje nuevo parte con estado "nueva" y con su fecha
    armarSugerencia(datos) {
        return {
            nombre: datos.nombre.trim(),
            correo: datos.correo.trim(),
            tipo: datos.tipo,
            mensaje: datos.mensaje.trim(),
            estado: "nueva",
            fecha: new Date().toLocaleString("es-CL")
        };
    },

    // Datos que se pueden cambiar al editar (la fecha y el id no cambian)
    armarCambios(datos) {
        return {
            nombre: datos.nombre.trim(),
            correo: datos.correo.trim(),
            tipo: datos.tipo,
            mensaje: datos.mensaje.trim(),
            estado: datos.estado
        };
    },

    // Filtra por texto (nombre, correo o mensaje) y por tipo
    filtrar(lista, texto, tipo) {
        const buscado = (texto || "").trim().toLowerCase();
        return lista.filter(s => {
            const coincideTipo = !tipo || tipo === "todos" || s.tipo === tipo;
            const coincideTexto = buscado === "" ||
                [s.nombre, s.correo, s.mensaje].some(campo => (campo || "").toLowerCase().includes(buscado));
            return coincideTipo && coincideTexto;
        });
    },

    // Cuenta cuántos mensajes hay de cada tipo
    contarPorTipo(lista) {
        const conteo = { sugerencia: 0, consulta: 0, reclamo: 0, felicitacion: 0 };
        lista.forEach(s => {
            if (conteo[s.tipo] !== undefined) {
                conteo[s.tipo]++;
            }
        });
        return conteo;
    }
};
