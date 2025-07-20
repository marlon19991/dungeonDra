# 🐉 Dungeons & Dragons Game

Un juego completo de Calabozos y Dragones con IA, construido con arquitectura limpia y principios SOLID.

## ✨ Características

- 🎮 **Gestión de Personajes** - Crea y administra personajes de D&D
- ⚔️ **Sistema de Combate** - Combat completo con dados y mecánicas de D&D
- 🤖 **Historias con IA** - Narrativa generada por Gemini AI
- 🎲 **Sistema de Dados** - Tiradas automáticas e interactivas
- 🌍 **Interfaz en Español** - Completamente localizado
- 📱 **Responsive Design** - Funciona en desktop y móvil

## 🚀 Inicio Rápido

### 1️⃣ Instalación
```bash
git clone https://github.com/marlon19991/dungeonDra.git
cd dungeonDra
npm run setup
```

### 2️⃣ Configuración
Crea un archivo `.env` con tu API key de Gemini:
```bash
GEMINI_API_KEY=tu_api_key_aqui
NODE_ENV=development
PORT=3000
```

### 3️⃣ ¡Ejecutar!
```bash
npm run dev
```

¡Eso es todo! 🎉

## 📋 Comandos Disponibles

### 🔥 Comando Principal
```bash
npm run dev          # ⚡ Modo desarrollo (recomendado)
```

### 📖 Desarrollo
```bash
npm run dev:server   # 🖥️  Solo backend
npm run dev:client   # ⚡ Solo frontend
npm test             # 🧪 Ejecutar tests
npm run lint         # ✨ Linter con auto-fix
```

### 🏗️ Producción
```bash
npm run build        # 📦 Compilar todo
npm start            # 🌟 Servidor producción
npm run preview      # 👀 Vista previa
```

### 🔧 Utilidades
```bash
npm run help         # 📖 Ver todos los comandos
npm run health       # 💚 Verificar estado
npm run reset        # 🔄 Resetear proyecto
npm run kill         # ⛔ Parar procesos
```

## 🌐 URLs

- **Juego**: http://localhost:5173 (dev) / http://localhost:3000 (prod)
- **API**: http://localhost:3000/api

## 🏗️ Arquitectura

```
src/
├── domain/          # 🏛️ Entidades y lógica de negocio
├── application/     # 📋 Casos de uso
├── infrastructure/ # 🔧 Servicios externos (IA, BD)
└── presentation/   # 🎨 Controladores y rutas

frontend/
├── src/
│   ├── components/ # ⚛️ Componentes React
│   ├── pages/     # 📄 Páginas principales
│   ├── services/  # 🌐 APIs y servicios
│   └── types/     # 📝 Tipos TypeScript
```

## 🎮 Cómo Jugar

1. **Crear Personajes** - Crea tus aventureros con clases y stats
2. **Iniciar Historia** - Elige tema y ritmo para tu aventura
3. **Tomar Decisiones** - Elige opciones o escribe acciones personalizadas
4. **Tirar Dados** - El sistema automáticamente pide tiradas cuando es necesario
5. **Continuar la Aventura** - La IA adapta la historia a tus decisiones

## 🛠️ Tecnologías

- **Backend**: TypeScript, Node.js, Express
- **Frontend**: React, TypeScript, Vite
- **IA**: Google Gemini API
- **Arquitectura**: Clean Architecture, SOLID
- **Herramientas**: ESLint, Nodemon, Concurrently

## 🔑 Configuración de IA

1. Obtén una API key de [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Añádela a tu archivo `.env`:
   ```bash
   GEMINI_API_KEY=tu_api_key_real_aqui
   ```
3. ¡Listo para jugar!

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

¿Problemas? Revisa:
- `npm run help` - Lista completa de comandos
- `npm run health` - Verificar estado del servidor
- Issues en GitHub para reportar bugs

---

**¡Que disfrutes tu aventura! 🐉⚔️🎲**