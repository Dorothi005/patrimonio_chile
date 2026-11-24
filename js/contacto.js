const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function (evento) {
    // Evita el envío normal del formulario para guardar primero los datos
    evento.preventDefault();

    const sugerencia = {
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        tipo: document.getElementById("tipo").value,
        mensaje: document.getElementById("mensaje").value.trim(),
        fecha: new Date().toLocaleString("es-CL")
    };

    try {
        // Lee lo que ya estaba guardado (o una lista vacía si no hay nada)
        const sugerencias = JSON.parse(localStorage.getItem("sugerencias")) || [];
        sugerencias.push(sugerencia);
        localStorage.setItem("sugerencias", JSON.stringify(sugerencias));

        // Redirige a la página de agradecimiento
        window.location.href = "gracias.html";
    } catch (error) {
        console.error("No se pudo guardar en localStorage:", error);
        alert("No se pudo guardar el formulario. Intenta de nuevo.");
    }
});
