// Config Supabase
const SUPABASE_URL = "https://zpootrqwudwxbuqmcvay.supabase.co/rest/v1/"; 
const SUPABASE_ANON_KEY = "sb_publishable_bo3XRSvtvOdhbOUvuTLCbQ_6596yd1s";

// Limpia slashes o /rest/v1 duplicados en la url
function cleanUrl(url) {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "");
}

// Retorna headers segun tipo de key de supabase
function buildHeaders(key) {
  const k = key.trim();
  const headers = {
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
  };

  if (k.startsWith("sb_publishable_")) {
    headers["apikey"] = k;
  } else {
    headers["apikey"] = k;
    headers["Authorization"] = `Bearer ${k}`;
  }
  return headers;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const alertBanner = document.getElementById("alertBanner");
  const alertText = document.getElementById("alertText");
  const alertIcon = document.getElementById("alertIcon");
  const toggleGalleryBtn = document.getElementById("toggleGalleryBtn");
  const extraPhotos = document.querySelectorAll(".gallery-extra");

  // Galeria toggle
  let showMore = false;
  if (toggleGalleryBtn && extraPhotos.length > 0) {
    toggleGalleryBtn.addEventListener("click", () => {
      showMore = !showMore;
      extraPhotos.forEach(card => {
        card.style.display = showMore ? "block" : "none";
      });
      const txt = toggleGalleryBtn.querySelector("span");
      if (txt) txt.textContent = showMore ? "Ocultar fotos" : "Ver más fotos del cultivo";
    });
  }

  if (!form || !submitBtn) return;

  function showAlert(msg, isSuccess = false) {
    alertBanner.className = `banner-alert active ${isSuccess ? 'banner-success' : 'banner-error'}`;
    alertText.textContent = msg;
    
    alertIcon.innerHTML = isSuccess 
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    alertBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideAlert() {
    alertBanner.className = "banner-alert";
    alertText.textContent = "";
    alertIcon.innerHTML = "";
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      submitBtn.classList.add("loading");
      btnText.textContent = "Enviando...";
    } else {
      submitBtn.classList.remove("loading");
      btnText.textContent = "Enviar Mensaje / Suscribirse";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const nombre = document.getElementById("nombre")?.value.trim() || "";
    const correo = document.getElementById("correo")?.value.trim() || "";
    const telefono = document.getElementById("telefono")?.value.trim() || "";
    const mensaje = document.getElementById("mensaje")?.value.trim() || "";

    if (!nombre) {
      showAlert("Por favor ingresa tu nombre completo.");
      document.getElementById("nombre")?.focus();
      return;
    }

    if (!correo || !validEmail(correo)) {
      showAlert("Ingresa un correo electrónico válido.");
      document.getElementById("correo")?.focus();
      return;
    }

    setLoading(true);

    try {
      const base = cleanUrl(SUPABASE_URL);
      const url = `${base}/rest/v1/leads`;
      const headers = buildHeaders(SUPABASE_ANON_KEY);

      const body = JSON.stringify({
        nombre: nombre,
        correo: correo,
        telefono: telefono || null,
        mensaje: mensaje || null
      });

      const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body
      });

      if (res.ok) {
        showAlert("¡Gracias por registrarte! Nos pondremos en contacto contigo pronto.", true);
        form.reset();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Error Supabase:", res.status, errData);

        if (errData?.code === "42501" || errData?.message?.includes("row-level security")) {
          showAlert("Error de permisos RLS en la tabla. Ejecuta el script SQL en Supabase.");
        } else if (res.status === 404) {
          showAlert("Tabla 'leads' no encontrada en la base de datos.");
        } else {
          showAlert(`No se pudo enviar la solicitud (${res.status}). Revisa la consola.`);
        }
      }
    } catch (err) {
      console.error("Error de red:", err);
      showAlert("Error de conexión con el servidor. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  });
});
