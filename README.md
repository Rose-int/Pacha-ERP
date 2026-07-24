# ERP Pachamama Farms 🌿🚜 - Cloud NoSQL ERP & Business Intelligence Platform

![Platform](https://img.shields.io/badge/Platform-Web%20Cloud-blue?logo=googlechrome)
![NoSQL Database](https://img.shields.io/badge/NoSQL%20DB-Firebase%20Firestore-orange?logo=firebase)
![BI & Analytics](https://img.shields.io/badge/Domain-BI%20%26%20Analytics-green)
![Cloud Deployment](https://img.shields.io/badge/Cloud-Firebase%20Hosting%20%2B%20GCP-4285F4?logo=googlecloud)

**ERP Pachamama** es una solución empresarial en la nube para la gestión operativa, analítica de datos en tiempo real, trazabilidad y control de costos en el sector agroindustrial (**Pachamama Farms SAC**).

---

## 🎓 Alineación con Cursos y Perfiles Académicos

Este proyecto es una muestra integral de competencias prácticas para la enseñanza universitaria en las siguientes asignaturas:

### 1. 🍃 Bases de Datos No Relacionales (NoSQL)
- **Modelado en Firebase Firestore**: Diseño de colecciones y documentos NoSQL (`db.js`) estructurados para alta disponibilidad y baja latencia.
- **Consultas Asíncronas & Sincronización Real-Time**: Indexación de documentos, escuchadores en tiempo real (`onSnapshot`) y transacciones atómicas.
- **Seguridad en Bases NoSQL**: Definición e implementación de reglas de acceso y seguridad granular en `firestore.rules`.

### 2. 📊 Inteligencia de Negocios y Analytics (BI)
- **Dashboards Ejecutivos y KPIs**: Visualización interactiva en tiempo real de métricas de rendimiento agrícola, volumen de cosecha y productividad por hectárea (`dashboard.js`).
- **Analítica de Costos de Producción**: Módulo automatizado de costeo por cuadrilla, cultivo y lote (`costeo.js`).
- **Módulo de Analítica IA (IA Studio)**: Procesamiento inteligente de datos históricos para la toma de decisiones estratégicas (`ia-studio.js`).

### 3. 🚀 Laboratorio de Integración V: Desarrollo y Despliegue de Software de BI
- **Despliegue Multi-Entorno en la Nube**: Automatización de despliegue continuo mediante scripts PowerShell y GCP (`deploy-gcp.ps1`, `firebase.json`).
- **Integración End-to-End**: Conexión entre la recolección de datos operativos en campo (Tareo/Recepción), procesamiento NoSQL y generación de tableros de BI para la gerencia.

---

## 🌟 Módulos del Sistema

- ⏱️ **Tareo & Asistencia**: Control de asistencia, cuadrillas y cálculo de jornadas de trabajo.
- 🍏 **Calibrado & Control de Calidad**: Clasificación de fruta por calibres y estándares de exportación.
- 📦 **Recepción & Producción**: Cadena de ingreso de fruta desde el fundo a la planta.
- 💰 **Costeo Agroindustrial**: Distribución de costos directos e indirectos por lote.
- 🔍 **Trazabilidad de Exportación**: Seguimiento completo de origen a destino.

---

## 🛠️ Stack Tecnológico

- **Base de Datos NoSQL**: Firebase Firestore (Google Cloud Platform)
- **Frontend & BI UI**: HTML5, CSS3 Grid/Flexbox, JavaScript ES6+
- **Despliegue Cloud**: Firebase Hosting, Google Cloud CLI (`deploy-gcp.ps1`)
- **Librerías de Exportación**: SheetJS / XLSX para reportes masivos.

---

## 📂 Estructura del Código

```text
pachamama-erp/
├── js/
│   ├── db.js                # Capa de datos NoSQL y controladores Firestore
│   ├── dashboard.js         # Tableros de Inteligencia de Negocios (BI)
│   ├── costeo.js            # Módulo de analítica de costos
│   ├── ia-studio.js         # Módulo de analítica inteligente
│   └── trazabilidad.js      # Lógica de trazabilidad agroindustrial
├── firebase.json            # Configuración de hosting e infraestructura cloud
├── firestore.rules          # Reglas de seguridad NoSQL
└── deploy-gcp.ps1           # Script de automatización de despliegue en la nube
```

---

## 📄 Licencia

Desarrollado para **Pachamama Farms SAC**. Reservados todos los derechos.
