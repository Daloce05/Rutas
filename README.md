# 🚚 Sistema de Gestión de Viajes de Carga y Liquidación de Gastos

Sistema web completo para la gestión de viajes de carga, control de gastos operativos y generación de reportes en PDF.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Estructura del Proyecto](#estructura-del-proyecto)

## ✨ Características

### Gestión de Viajes
- ✅ Crear, editar y eliminar viajes de carga
- ✅ Registro completo: fecha, material, origen, destino, kilos, flete, placa, anticipo
- ✅ Cálculos automáticos de totales y saldos
- ✅ Búsqueda y filtrado de viajes

### Gestión de Gastos
- ✅ Registro de gastos por viaje
- ✅ Tipos de gastos dinámicos (no fijos en código)
- ✅ Categorías predefinidas: APCM, Cargue, Descargue, Peajes, Llantas, Aceite, Lavada, Taller, Parqueo, Otros
- ✅ Agregar, editar y eliminar tipos de gasto
- ✅ Cálculo automático de totales por viaje

### Cálculos Automáticos
- **Total de Gastos** = Suma de todos los gastos del viaje
- **Saldo Conductor** = Valor Flete - Total Gastos
- **Saldo Final** = Saldo Conductor - Anticipo

### Reportes en PDF
- ✅ Generación de reportes profesionales por viaje
- ✅ Incluye datos completos del viaje
- ✅ Detalle de gastos con subtotales
- ✅ Totales y saldos calculados
- ✅ Descarga directa desde la interfaz

## 🛠️ Tecnologías

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **pg** - Cliente PostgreSQL para Node.js
- **PDFKit** - Generación de documentos PDF
- **dotenv** - Gestión de variables de entorno
- **CORS** - Habilitación de peticiones cross-origin

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos (diseño responsive)
- **JavaScript (Vanilla)** - Interactividad
- **Fetch API** - Comunicación con el backend

## 🏗️ Arquitectura

El sistema sigue una arquitectura en capas con separación de responsabilidades:

```
┌─────────────────┐
│    Frontend     │  (HTML/CSS/JS)
│   (Cliente)     │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Rutas/API     │  (Express Routes)
└────────┬────────┘
         │
┌────────▼────────┐
│  Controladores  │  (Lógica de negocio)
└────────┬────────┘
         │
┌────────▼────────┐
│   Servicios     │  (Acceso a datos)
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │  (Base de datos)
└─────────────────┘
```

## 📦 Instalación

### Prerrequisitos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd Rutas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Crear base de datos en PostgreSQL**
   ```sql
   CREATE DATABASE gestion_viajes;
   ```

4. **Ejecutar scripts SQL**
   ```bash
   # En PostgreSQL, ejecutar en orden:
   psql -U tu_usuario -d gestion_viajes -f database/schema.sql
   psql -U tu_usuario -d gestion_viajes -f database/seed.sql
   ```

5. **Configurar variables de entorno**
   ```bash
   copy .env.example .env
   ```
   
   Editar `.env` con tus credenciales:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=gestion_viajes
   ```

6. **Iniciar el servidor**
   ```bash
   npm start
   ```

7. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| PORT | Puerto del servidor | 3000 |
| DB_HOST | Host de PostgreSQL | localhost |
| DB_PORT | Puerto de PostgreSQL | 5432 |
| DB_USER | Usuario de la BD | - |
| DB_PASSWORD | Contraseña de la BD | - |
| DB_NAME | Nombre de la BD | gestion_viajes |

### Scripts Disponibles

```json
{
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar con recarga automática (requiere nodemon)

## 💻 Uso

### Interfaz Web

1. **Gestionar Viajes**
   - Clic en "Nuevo Viaje" para registrar un viaje
   - Completar todos los campos obligatorios (*)
   - Los cálculos se realizan automáticamente

2. **Gestionar Gastos**
   - En la tabla de viajes, clic en el ícono 💰
   - Agregar gastos con tipo, valor y descripción
   - Los totales se actualizan en tiempo real

3. **Generar PDF**
   - En la tabla de viajes, clic en el ícono 📄
   - El PDF se descarga automáticamente

4. **Tipos de Gastos**
   - Tab "Tipos de Gastos"
   - Crear nuevos tipos según necesidades
   - Activar/desactivar tipos existentes

## 🔌 API Endpoints

### Viajes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/viajes` | Listar todos los viajes |
| GET | `/api/viajes/:id` | Obtener un viaje por ID |
| GET | `/api/viajes/:id/completo` | Obtener viaje con gastos |
| POST | `/api/viajes` | Crear nuevo viaje |
| PUT | `/api/viajes/:id` | Actualizar viaje |
| DELETE | `/api/viajes/:id` | Eliminar viaje |
| GET | `/api/viajes/:id/pdf` | Descargar PDF del viaje |

#### Ejemplo: Crear Viaje

```bash
POST /api/viajes
Content-Type: application/json

{
  "fecha_viaje": "2026-01-20",
  "material_transportado": "Cemento",
  "origen": "Bogotá",
  "destino": "Medellín",
  "kilos_transportados": 15000.00,
  "valor_flete": 2500000.00,
  "placa_vehiculo": "ABC123",
  "anticipo": 800000.00,
  "observaciones": "Entrega urgente"
}
```

### Gastos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/viajes/:viajeId/gastos` | Listar gastos de un viaje |
| GET | `/api/gastos/:id` | Obtener un gasto por ID |
| POST | `/api/gastos` | Crear nuevo gasto |
| PUT | `/api/gastos/:id` | Actualizar gasto |
| DELETE | `/api/gastos/:id` | Eliminar gasto |

#### Ejemplo: Crear Gasto

```bash
POST /api/gastos
Content-Type: application/json

{
  "viaje_id": 1,
  "tipo_gasto_id": 1,
  "valor": 450000.00,
  "descripcion": "Combustible ruta completa"
}
```

### Tipos de Gastos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tipos-gastos` | Listar tipos activos |
| GET | `/api/tipos-gastos?includeInactive=true` | Incluir inactivos |
| GET | `/api/tipos-gastos/:id` | Obtener tipo por ID |
| POST | `/api/tipos-gastos` | Crear nuevo tipo |
| PUT | `/api/tipos-gastos/:id` | Actualizar tipo |
| DELETE | `/api/tipos-gastos/:id` | Desactivar tipo |

#### Ejemplo: Crear Tipo de Gasto

```bash
POST /api/tipos-gastos
Content-Type: application/json

{
  "nombre": "Alimentación",
  "descripcion": "Gastos de comidas del conductor",
  "activo": true
}
```

## 🗄️ Base de Datos

### Modelo Relacional

```
┌─────────────────┐
│  tipos_gastos   │
├─────────────────┤
│ id (PK)         │
│ nombre          │
│ descripcion     │
│ activo          │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐      ┌─────────────────┐
│     gastos      │  N:1 │     viajes      │
├─────────────────┤◄─────┤─────────────────┤
│ id (PK)         │      │ id (PK)         │
│ viaje_id (FK)   │      │ fecha_viaje     │
│ tipo_gasto_id(FK)│     │ material        │
│ valor           │      │ origen          │
│ descripcion     │      │ destino         │
└─────────────────┘      │ kilos           │
                         │ valor_flete     │
                         │ placa_vehiculo  │
                         │ anticipo        │
                         └─────────────────┘
```

### Tablas Principales

#### viajes
Almacena la información principal de cada viaje de carga.

#### gastos
Registra los gastos asociados a cada viaje.

#### tipos_gastos
Catálogo dinámico de tipos de gastos.

### Vista: viajes_con_totales
Vista que calcula automáticamente:
- `total_gastos`: Suma de gastos del viaje
- `saldo_conductor`: Flete - Total gastos
- `saldo_final`: Saldo conductor - Anticipo

## 📁 Estructura del Proyecto

```
Rutas/
├── config/
│   └── db.js                 # Configuración de PostgreSQL
├── controllers/
│   ├── viajesController.js   # Lógica de viajes
│   ├── gastosController.js   # Lógica de gastos
│   ├── tiposGastosController.js
│   └── pdfController.js      # Generación de PDF
├── database/
│   ├── schema.sql            # Esquema de BD
│   └── seed.sql              # Datos iniciales
├── middlewares/
│   └── errorHandler.js       # Manejo de errores
├── public/
│   ├── index.html            # Frontend
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── routes/
│   ├── index.js              # Rutas centrales
│   ├── viajes.js
│   ├── gastos.js
│   └── tiposGastos.js
├── services/
│   ├── viajesService.js      # Acceso a datos - viajes
│   ├── gastosService.js      # Acceso a datos - gastos
│   ├── tiposGastosService.js
│   └── pdfService.js         # Generación PDF
├── utils/
│   └── validators.js         # Validaciones
├── .env                      # Variables de entorno
├── .env.example              # Plantilla de .env
├── .gitignore
├── index.js                  # Punto de entrada
├── package.json
└── README.md
```

## 🔐 Seguridad

- Validación de datos en backend
- Uso de variables de entorno para credenciales
- Prepared statements para prevenir SQL injection
- Integridad referencial en base de datos

## 📊 Características Técnicas

### Backend
- ✅ Arquitectura en capas (Controlador → Servicio → Base de Datos)
- ✅ Manejo centralizado de errores
- ✅ Validaciones de datos
- ✅ Separación de responsabilidades
- ✅ Código comentado y documentado

### Base de Datos
- ✅ Modelo relacional normalizado
- ✅ Integridad referencial
- ✅ Índices para optimización
- ✅ Triggers para actualización automática
- ✅ Vistas para cálculos agregados
- ✅ Constraints para validación de datos

### Frontend
- ✅ Diseño responsive
- ✅ Interfaz intuitiva
- ✅ Validación de formularios
- ✅ Retroalimentación al usuario
- ✅ Sin dependencias externas (Vanilla JS)

## 🚀 Próximas Mejoras (Opcional)

- [ ] Autenticación y autorización de usuarios
- [ ] Dashboard con estadísticas
- [ ] Exportación a Excel
- [ ] Gráficas de gastos por categoría
- [ ] Historial de modificaciones
- [ ] API REST con paginación
- [ ] Tests unitarios y de integración

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Sistema desarrollado para la gestión eficiente de viajes de carga y liquidación de gastos.

---

**¿Necesitas ayuda?** Revisa la documentación de la API o abre un issue en el repositorio.
