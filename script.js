/**
 * ==========================================================================
 * CAFÉS BENI - SUPABASE LEAD FORM SCRIPT (ES6)
 * Conexión nativa vía Fetch API a Supabase REST API
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. CONFIGURACIÓN DE CREDENCIALES DE SUPABASE
// Reemplaza estas constantes con la URL y anon key de tu proyecto en Supabase
// --------------------------------------------------------------------------
const SUPABASE_URL = "https://zpootrqwudwxbuqmcvay.supabase.co/rest/v1/"; 
const SUPABASE_ANON_KEY = "sb_publishable_bo3XRSvtvOdhbOUvuTLCbQ_6596yd1s";

// --------------------------------------------------------------------------
// 2. FUNCIONES DE UTILIDAD & SANITIZACIÓN DE URL
// --------------------------------------------------------------------------

/**
 * Sanitiza y limpia la URL de Supabase para evitar duplicaciones de slashes
 * y remover sobrantes como '/rest/v1/' al final.
 * @param {string} url - URL cruda ingresada por el usuario
 * @returns {string} - Base URL limpia sin slashes finales ni rutas de API
 */
function sanitizeSupabaseUrl(url) {
  if (!url) return "";
  let cleanUrl = url.trim();
  
  // Remover slashes finales
  cleanUrl = cleanUrl.replace(/\/+$/, "");
  
  // Remover fragmento /rest/v1 si fue incluido por error
  cleanUrl = cleanUrl.replace(/\/rest\/v1\/?$/, "");
  
  return cleanUrl;
}

/**
 * Genera de forma inteligente los encabezados (Headers) requeridos según el tipo de clave.
 * - Si es JWT ('eyJ...'): Incluye 'apikey' y 'Authorization: Bearer <key>'
 * - Si es la nueva clave publishable ('sb_publishable_...'): Envía ÚNICAMENTE 'apikey' para evitar HTTP 401.
 * 
 * @param {string} apiKey - Clave pública anon de Supabase
 * @returns {Record<string, string>} Objeto de encabezados para fetch
 */
function getSupabaseHeaders(apiKey) {
  const headers = {
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
  };

  const key = apiKey.trim();

  if (key.startsWith("sb_publishable_")) {
    // Nueva clave publicable de Supabase: Únicamente enviar apikey header
    headers["apikey"] = key;
  } else {
    // Clave JWT estándar (eyJ...): Enviar apikey y Authorization Bearer
    headers["apikey"] = key;
    headers["Authorization"] = `Bearer ${key}`;
  }

  return headers;
}

/**
 * Valida la sintaxis de un correo electrónico mediante Expresión Regular (Regex)
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

// --------------------------------------------------------------------------
// 3. SELECCIÓN DE ELEMENTOS DEL DOM
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const alertBanner = document.getElementById("alertBanner");
  const alertText = document.getElementById("alertText");
  const alertIcon = document.getElementById("alertIcon");

  if (!form || !submitBtn) return;

  // ------------------------------------------------------------------------
  // 4. MANEJO VISUAL DE ALERTAS Y BANNERS
  // ------------------------------------------------------------------------
  function showAlert(message, type = "error") {
    alertBanner.className = `banner-alert active banner-${type}`;
    alertText.textContent = message;

    if (type === "success") {
      alertIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else {
      alertIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
    }

    // Auto desplazamiento al banner de alerta
    alertBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideAlert() {
    alertBanner.className = "banner-alert";
    alertText.textContent = "";
    alertIcon.innerHTML = "";
  }

  // ------------------------------------------------------------------------
  // 5. CAMBIO DE ESTADO DEL BOTÓN DE ENVÍO (LOADING / DISABLED)
  // ------------------------------------------------------------------------
  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.classList.add("loading");
      btnText.textContent = "Enviando solicitud...";
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
      btnText.textContent = "Recibir Muestra Gratuita";
    }
  }

  // ------------------------------------------------------------------------
  // 6. EVENTO SUBMIT DEL FORMULARIO DE LEADS
  // ------------------------------------------------------------------------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideAlert();

    // Obtener y limpiar datos de entrada
    const nombre = document.getElementById("nombre")?.value.trim() || "";
    const correo = document.getElementById("correo")?.value.trim() || "";
    const telefono = document.getElementById("telefono")?.value.trim() || "";
    const mensaje = document.getElementById("mensaje")?.value.trim() || "";

    // Validation Client-Side
    if (!nombre) {
      showAlert("Por favor, ingresa tu nombre completo.", "error");
      document.getElementById("nombre")?.focus();
      return;
    }

    if (!correo || !isValidEmail(correo)) {
      showAlert("Por favor, ingresa un correo electrónico válido (ej. usuario@dominio.com).", "error");
      document.getElementById("correo")?.focus();
      return;
    }

    // Verificar si las claves por defecto aún no se reemplazaron
    if (SUPABASE_URL.includes("tu-proyecto") || SUPABASE_ANON_KEY.includes("tu-anon")) {
      console.warn("⚠️ [Cafés Beni Dev Warning] Las credenciales de Supabase son placeholders por defecto.");
    }

    // Activar estado de carga
    setLoadingState(true);

    try {
      // Sanitizar la URL y construir el endpoint de la REST API de Supabase
      const baseUrl = sanitizeSupabaseUrl(SUPABASE_URL);
      const endpoint = `${baseUrl}/rest/v1/leads`;

      // Obtener los encabezados autenticados según el tipo de clave
      const headers = getSupabaseHeaders(SUPABASE_ANON_KEY);

      // Payload JSON a insertar en la tabla 'leads'
      const payload = {
        nombre: nombre,
        correo: correo,
        telefono: telefono || null,
        mensaje: mensaje || null
      };

      console.log("🚀 [Supabase Request] Enviando POST a:", endpoint);

      // Realizar petición Fetch a Supabase REST API
      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });

      // Captura analítica de respuesta HTTP
      if (response.ok) {
        // Respuesta exitosa (200 OK / 201 Created / 204 No Content)
        console.log("✅ [Supabase Success] Lead registrado correctamente en la base de datos.");
        
        showAlert("¡Excelente! Hemos recibido tu solicitud. Te contactaremos muy pronto para enviarte tu muestra gratis de Cafés Beni. ☕", "success");
        
        // Reseteo del formulario
        form.reset();
      } else {
        // Captura detallada de errores HTTP
        const status = response.status;
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() };
        }

        console.error(`❌ [Supabase HTTP Error ${status}] Detalle en consola F12:`, errorData);

        let errorMessage = "Ocurrió un error inesperado al procesar tu solicitud.";

        // Detectar si es un error de RLS (Row Level Security)
        if (errorData?.code === "42501" || errorData?.message?.includes("row-level security")) {
          errorMessage = "Error (RLS 42501): Permiso denegado por Row Level Security. Recuerda ejecutar el script SQL en el SQL Editor de Supabase.";
        } else {
          switch (status) {
            case 400:
              errorMessage = `Error (400 Bad Request): Revisa los datos o columnas de la tabla. (${errorData?.message || ''})`;
              break;
            case 401:
              errorMessage = "Error (401 Unauthorized): Clave anon public key de Supabase inválida o permisos denegados por RLS.";
              break;
            case 403:
              errorMessage = "Error (403 Forbidden): Permiso denegado por Row Level Security (RLS) en Supabase.";
              break;
            case 404:
              errorMessage = "Error (404 Not Found): La tabla 'leads' no existe en tu base de datos de Supabase.";
              break;
            default:
              errorMessage = `Error (${status}): ${errorData?.hint || errorData?.message || 'Fallo en la comunicación con Supabase.'}`;
          }
        }

        showAlert(errorMessage, "error");
      }

    } catch (networkError) {
      console.error("🔥 [Network/Fetch Exception]:", networkError);
      showAlert(`Error de conexión: No se pudo conectar con el servidor (${networkError.message}). Revisa tu conexión a internet o la URL de Supabase.`, "error");
    } finally {
      // Restaurar botón de envío
      setLoadingState(false);
    }
  });
});
