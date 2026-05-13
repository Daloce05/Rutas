# Guía Rápida de Instalación

## Pasos para ejecutar el sistema

### 1. Instalar PostgreSQL
Descarga e instala PostgreSQL desde: https://www.postgresql.org/download/

### 2. Crear la base de datos
Abre pgAdmin o la terminal de PostgreSQL y ejecuta:
```sql
CREATE DATABASE gestion_viajes;
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` a `.env`:
```bash
copy .env.example .env
```

Edita el archivo `.env` con tus credenciales de PostgreSQL:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=gestion_viajes
```

### 4. Ejecutar scripts de base de datos
Desde la terminal de PostgreSQL (psql) o pgAdmin, ejecuta:

1. Primero `database/schema.sql`
2. Luego `database/seed.sql`

O desde la línea de comandos:
```bash
psql -U postgres -d gestion_viajes -f database/schema.sql
psql -U postgres -d gestion_viajes -f database/seed.sql
```

### 5. Instalar dependencias (si no están instaladas)
```bash
npm install
```

### 6. Iniciar el servidor
```bash
npm start
```

### 7. Acceder a la aplicación
Abre tu navegador en: http://localhost:3000

---

## Verificar instalación

Para verificar que la base de datos está conectada correctamente:
1. Ve a: http://localhost:3000/db-test
2. Deberías ver: `{"success":true,"message":"Conexión exitosa a PostgreSQL",...}`

## Problemas comunes

**Error: "Connection refused"**
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales en el archivo `.env`

**Error: "relation does not exist"**
- Ejecuta los scripts SQL en orden: primero `schema.sql`, luego `seed.sql`

**Error: "Cannot find module"**
- Ejecuta: `npm install`

---

¡Listo! El sistema está funcionando.
