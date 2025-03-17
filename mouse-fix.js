/**
 * Solución para problemas de mouse en juegos Unity WebGL en GitHub Pages
 * Esta versión mantiene el cursor visible para permitir apuntar y disparar
 */

(function () {
  // Variables globales
  var canvas = null;
  var unityInstance = null;
  var hasInitialized = false;

  // Inicializar cuando la página esté cargada
  window.addEventListener("load", function () {
    // Esperar a que Unity termine de cargar
    setTimeout(initialize, 3000);
  });

  function initialize() {
    if (hasInitialized) return;

    canvas = document.getElementById("unity-canvas");
    if (!canvas) {
      console.log("Canvas no encontrado, esperando...");
      setTimeout(initialize, 1000);
      return;
    }

    console.log("Inicializando fix para mouse en GitHub Pages");
    hasInitialized = true;

    // Intentar obtener la instancia de Unity
    unityInstance = window.unityInstance || null;
    if (!unityInstance) {
      console.log("Esperando a la instancia de Unity...");
      setTimeout(function () {
        unityInstance = window.unityInstance || null;
        if (unityInstance) {
          console.log("Instancia de Unity encontrada");
        }
      }, 2000);
    }

    // Fix para Firefox y Safari
    fixMouseEventsBubbling();

    // Fix para eventos de clic
    enhanceClickEvents();

    // Fix para eventos de movimiento
    enhanceMouseMovementEvents();

    // Fix para GitHubPages específicamente
    applyGitHubPagesFix();
  }

  function fixMouseEventsBubbling() {
    var originalStopPropagation = Event.prototype.stopPropagation;

    // Sobrescribir stopPropagation para asegurar que los eventos del mouse lleguen al canvas
    Event.prototype.stopPropagation = function () {
      if (this.type.startsWith("mouse") && this.target === canvas) {
        console.log("Permitiendo propagación de evento de mouse: " + this.type);
        return;
      }
      originalStopPropagation.call(this);
    };
  }

  function enhanceClickEvents() {
    // Asegurarse de que los clics en el canvas se manejen correctamente
    document.addEventListener(
      "click",
      function (e) {
        if (isClickInCanvas(e)) {
          // En GitHub Pages a veces los clics se pierden
          console.log("Clic en el canvas detectado");
          canvas.focus();
        }
      },
      true
    );

    // Manejar clics del mouse con mayor prioridad
    document.addEventListener(
      "mousedown",
      function (e) {
        if (isClickInCanvas(e)) {
          console.log("Mousedown en el canvas detectado");
          canvas.focus();
        }
      },
      true
    );
  }

  function enhanceMouseMovementEvents() {
    // Asegurarse de que los eventos de movimiento del mouse lleguen al juego
    document.addEventListener(
      "mousemove",
      function (e) {
        if (isMouseOverCanvas(e) && !document.pointerLockElement) {
          // Calcular la posición exacta del mouse relativa al canvas
          var rect = canvas.getBoundingClientRect();
          var mouseX = e.clientX - rect.left;
          var mouseY = e.clientY - rect.top;

          // Manejar problemas de escala en pantalla completa
          if (document.fullscreenElement === canvas) {
            var scaleX = canvas.width / rect.width;
            var scaleY = canvas.height / rect.height;
            mouseX *= scaleX;
            mouseY *= scaleY;
          }
        }
      },
      true
    );
  }

  function applyGitHubPagesFix() {
    // Configuración de meta para prevenir problemas de escala
    var metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement("meta");
      metaViewport.name = "viewport";
      document.head.appendChild(metaViewport);
    }
    metaViewport.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

    // Asegurarse de que el canvas esté visible y activo
    if (canvas && canvas.style.display === "none") {
      canvas.style.display = "block";
    }

    // Prevenir que el navegador maneje gestos que puedan interferir
    document.addEventListener("gesturestart", function (e) {
      e.preventDefault();
    });
  }

  function isClickInCanvas(e) {
    if (!canvas) return false;
    var rect = canvas.getBoundingClientRect();
    return (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
  }

  function isMouseOverCanvas(e) {
    return isClickInCanvas(e);
  }

  // Exportar funciones útiles
  window.mouseUtilityFix = {
    reinitialize: initialize,
    forceCanvasFocus: function () {
      if (canvas) canvas.focus();
    },
  };
})();
