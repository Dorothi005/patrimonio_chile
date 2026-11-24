// CAPA DE DATOS: lee y guarda las sugerencias en localStorage (en formato JSON).
// Aquí NO hay validaciones ni nada de pantalla, solo guardar y recuperar.
const Datos = {
    CLAVE: "sugerencias",

    // Mensajes de ejemplo para la demostración (ficticios)
    EJEMPLOS: [
        { id: "ej-1", nombre: "Camila Torres", correo: "camila.torres@example.com", tipo: "sugerencia", mensaje: "Sería genial agregar una ficha del Valle de la Luna con más fotos del lugar.", estado: "nueva", fecha: "20-11-2026, 10:15:00" },
        { id: "ej-2", nombre: "Diego Fuentes", correo: "diego.fuentes@example.com", tipo: "consulta", mensaje: "¿Cada cuánto tiempo actualizan la información de las fichas de patrimonio?", estado: "revisada", fecha: "21-11-2026, 16:40:12" },
        { id: "ej-3", nombre: "Valentina Rojas", correo: "valentina.rojas@example.com", tipo: "reclamo", mensaje: "La imagen de la ficha de Valparaíso se demora mucho en cargar en mi celular.", estado: "nueva", fecha: "22-11-2026, 09:05:33" },
        { id: "ej-4", nombre: "Matías Soto", correo: "matias.soto@example.com", tipo: "felicitacion", mensaje: "Excelente trabajo, el sitio es claro y fácil de recorrer.", estado: "aceptada", fecha: "22-11-2026, 19:22:48" },
        { id: "ej-5", nombre: "Javiera Muñoz", correo: "javiera.munoz@example.com", tipo: "sugerencia", mensaje: "Podrían incluir un mapa con la ubicación de cada elemento patrimonial.", estado: "revisada", fecha: "23-11-2026, 11:10:07" }
    ],

    // Crea un identificador único para cada registro
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    },

    // READ: devuelve todos los registros (o una lista vacía si no hay nada)
    obtenerTodas() {
        let lista = [];
        try {
            const texto = localStorage.getItem(this.CLAVE);
            lista = texto ? JSON.parse(texto) : [];
        } catch (error) {
            console.error("No se pudieron leer los datos:", error);
            return [];
        }
        if (!Array.isArray(lista)) {
            return [];
        }
            // Compatibilidad: mensajes guardados antes no tenían id ni estado
        let huboCambios = false;
        lista.forEach(s => {
            if (!s.id) { s.id = this.generarId(); huboCambios = true; }
            if (!s.estado) { s.estado = "nueva"; huboCambios = true; }
        });
        if (huboCambios) {
            try { this.guardarTodas(lista); } catch (error) { console.error(error); }
        }
        return lista;
    },

    // Guarda la lista completa convertida a texto JSON
    guardarTodas(lista) {
        localStorage.setItem(this.CLAVE, JSON.stringify(lista));
    },

    obtenerPorId(id) {
        return this.obtenerTodas().find(s => s.id === id) || null;
    },

    // CREATE: agrega un registro nuevo
    crear(sugerencia) {
        const lista = this.obtenerTodas();
        sugerencia.id = this.generarId();
        lista.push(sugerencia);
        this.guardarTodas(lista);
        return sugerencia;
    },

    // UPDATE: cambia solo el registro con ese id
    actualizar(id, cambios) {
        const lista = this.obtenerTodas();
        const posicion = lista.findIndex(s => s.id === id);
        if (posicion === -1) {
            return false;
        }
        lista[posicion] = Object.assign({}, lista[posicion], cambios);
        lista[posicion].id = id;
        this.guardarTodas(lista);
        return true;
    },

    // DELETE: elimina solo el registro con ese id
    eliminar(id) {
        const lista = this.obtenerTodas();
        const restantes = lista.filter(s => s.id !== id);
        if (restantes.length === lista.length) {
            return false;
        }
        this.guardarTodas(restantes);
        return true;
    },

    // Agrega los mensajes de ejemplo que todavía no estén guardados
    cargarEjemplos() {
        const lista = this.obtenerTodas();
        let agregados = 0;
        this.EJEMPLOS.forEach(ejemplo => {
            if (!lista.some(s => s.id === ejemplo.id)) {
                lista.push(Object.assign({}, ejemplo));
                agregados++;
            }
        });
        if (agregados > 0) {
            this.guardarTodas(lista);
        }
        return agregados;
    }
};
