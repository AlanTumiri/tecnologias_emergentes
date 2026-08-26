# ☕ Cafés Beni - Documentación y Hoja de Planificación Escrita

Este repositorio contiene la **Landing Page de Alta Conversión y Formulario de Leads** desarrollado para **Cafés Beni**, optimizado para entregar una experiencia visual deslumbrante nivel SaaS Silicon Valley con conexión nativa a la base de datos de **Supabase**.

---

## 1. HOJA DE PLANIFICACIÓN ACADÉMICA

### 1.1 Producto y Oferta de Valor Principal
* **Nombre del Producto / Marca:** Cafés Beni
* **Propuesta de Valor:** Cafés de especialidad 100% granos Arábica de altura (cultivados a más de 1,800m snm), tostados de forma artesanal en lotes pequeños semanalmente y despachados dentro de las 24-48 horas post-tostado.
* **Solución:** Ofrecer a los amantes del café gourmet y negocios de especialidad una experiencia organoléptica superior con notas de cata exclusivas y entrega fresca garantizada.

### 1.2 Público Objetivo (Buyer Persona)
* **Perfil:** Hombres y mujeres de 22 a 55 años, profesionales, entusiastas del café de especialidad, barista afines y propietarios de cafeterías o boutiques gastronómicas.
* **Necesidades:** Buscan granos de alta graduación SCAA (88+ puntos), sin amargor desmedido, con trazabilidad de origen clara y frescura absoluta en el empaque.

### 1.3 Decisiones de UI/UX y Sistema de Diseño
1. **Paleta de Colores Tostados & Lujo (Coffee Aesthetics):**
   - **Fondo Espresso Profundo (`#0A0604` / `#120C08`):** Otorga un ambiente visual refinado y enfocado en el contenido.
   - **Acentos Latte Gold (`#D4A373`) y Caramelo Tostado (`#E67E22`):** Aportan calidez, contraste dinámico en gradientes y resaltan elementos CTA.
   - **Texto Marfil Warm (`#FAF5F0`):** Facilita una lectura fluida evitando el cansancio visual del blanco puro.
2. **Tipografía de Silicon Valley:**
   - **`Outfit` (Google Fonts):** Encabezados geométricos elegantes y con fuerte presencia tipográfica.
   - **`Inter` (Google Fonts):** Texto de cuerpo extremadamente legible y adaptado a dispositivos móviles.
3. **Efectos Visuales Avanzados:**
   - **Glassmorphism:** Uso de `backdrop-filter: blur(16px)` y bordes translúcidos con `rgba(212, 163, 115, 0.18)` en tarjetas y formularios.
   - **Micro-animaciones:** Efecto float en tarjetas, escalado fluido al hacer hover en botones (`transform: translateY(-4px)`), pulso dinámico en badges y spinner de carga SVG.
4. **UI Components:**
   - Badges de oferta limitada con luz parpadeante.
   - Trust badges con estrellas vectoriales SVG.
   - Grilla responsiva de beneficios con íconos encajonados en cajas brillantes.
   - Banner de feedback visual estilizado para mostrar mensajes de confirmación o captura de errores de red HTTP.

### 1.4 Justificación de Supabase y Row Level Security (RLS)
* **API REST Nativa:** Se utiliza la API REST nativa de Supabase mediante la función nativa `fetch()` en Javascript ES6, eliminado librerías pesadas para lograr tiempos de carga instantáneos.
* **Seguridad RLS (Row Level Security):** 
  - La tabla `leads` tiene habilitado RLS (`ALTER TABLE leads ENABLE ROW LEVEL SECURITY;`).
  - Se define la política `Permitir inserciones publicas` que limita a los usuarios anónimos (`anon`) a realizar exclusivamente operaciones `INSERT`.
  - **Ventaja de Seguridad:** Se impide que usuarios anónimos lean (`SELECT`), modifiquen (`UPDATE`) o eliminen (`DELETE`) registros de la base de datos, garantizando la privacidad absoluta de la lista de prospectos.

---

## 2. CÓDIGO SQL AUTOMATIZADO E IDEMPOTENTE FOR SUPABASE

Copia y ejecuta el siguiente script exacto en el **SQL Editor** del panel de control de Supabase:

```sql
-- 1. Creación idempotente de la tabla 'leads'
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  telefono TEXT,
  mensaje TEXT
);

-- 2. Habilitar la seguridad RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas duplicadas para evitar errores 42710
DROP POLICY IF EXISTS "Permitir inserciones publicas" ON leads;

-- 4. Crear la política permitiendo inserciones públicas (INSERT con CHECK true)
CREATE POLICY "Permitir inserciones publicas" ON leads
  FOR INSERT WITH CHECK (true);

-- 5. Otorgar permisos de ejecución a los roles 'anon' y 'authenticated'
GRANT ALL ON TABLE leads TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
```

---

## 3. GUÍA DE COMANDOS GIT PARA CONTROL DE VERSIONES

Ejecuta los siguientes comandos en tu terminal dentro de la carpeta `C:\Users\irisc\Desktop\prueba4`:

```bash
# 1. Inicializar el repositorio Git
git init

# 2. Agregar todos los archivos al área de preparación
git add .

# 3. Crear el primer commit
git commit -m "feat: Landing page Cafés Beni con integración Supabase y diseño UI/UX de elite"

# 4. Cambiar el nombre de la rama principal a main
git branch -M main

# 5. Vincular tu repositorio remoto de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/cafes-beni.git

# 6. Subir el proyecto a GitHub
git push -u origin main
```

---

## 4. ESTRUCTURA DEL PROYECTO

```
C:\Users\irisc\Desktop\prueba4\
├── index.html   # Estructura semántica HTML5 con SVG inline y fuentes Google
├── styles.css   # Sistema de diseño CSS3, paleta café, glassmorphism y media queries
├── script.js   # Lógica ES6, sanitización de URL, detección de API keys y Fetch a Supabase
└── README.md    # Hoja de planificación, Script SQL y comandos Git
```
