# Neural Spatial OS v2

> A gesture-driven spatial computing shell that replaces traditional input methods with AI-assisted spatial interaction.

## 🎯 Overview

Neural Spatial OS v2 is a **web-based spatial AI interface** that runs in the browser and provides gesture-driven 3D spatial computing, AI orchestration, and plugin-based application control.

**Key Features:**
- 🖐️ Hand gesture recognition (pinch, grab, swipe, rotate)
- 🌐 3D spatial world with WebGL rendering
- 🧠 AI-powered command orchestration
- 🎨 4 core modes: Business, Education, Audio/DAW, Creative
- 🔌 Plugin system with sandboxed extensions
- 🔗 External service connectors (Google, Microsoft, REST APIs)
- 📡 Event-driven architecture (zero coupling)

## 🏗️ Architecture

```
INPUT LAYER (Webcam + Audio)
  ↓
GESTURE + VISION ENGINE (MediaPipe Hands)
  ↓
EVENT BUS (Core System Backbone)
  ↓
SPATIAL WORLD ENGINE (Three.js + Physics)
  ↓
UI LAYER + MODE SYSTEM (Business/Education/DAW/Creative)
  ↓
PLUGIN RUNTIME (Sandboxed Modules)
  ↓
CONNECTOR + AI LAYER (External APIs + LLM)
  ↓
RENDER PIPELINE (WebGL @ 60fps)
```

## 📦 Project Structure

```
neural-spatial-os-v2/
├── src/
│   ├── core/
│   │   ├── event-bus.ts          # Core pub/sub system
│   │   ├── spatial-object.ts     # 3D object model
│   │   └── constants.ts          # System-wide constants
│   ├── input/
│   │   ├── camera-stream.ts      # WebRTC camera handling
│   │   └── audio-input.ts        # Web Audio API setup
│   ├── vision/
│   │   ├── hand-tracking.ts      # MediaPipe Hands integration
│   │   ├── gesture-engine.ts     # Gesture recognition logic
│   │   └── gesture-types.ts      # Gesture definitions
│   ├── spatial/
│   │   ├── spatial-world.ts      # Three.js world manager
│   │   ├── physics-engine.ts     # Cannon.js integration
│   │   └── spatial-utils.ts      # Utility functions
│   ├── ui/
│   │   ├── ui-system.ts          # UI layer orchestrator
│   │   ├── spatial-panel.ts      # 3D floating panel component
│   │   └── ui-elements.ts        # Reusable UI primitives
│   ├── modes/
│   │   ├── mode-system.ts        # Mode switching logic
│   │   ├── business-mode.ts      # Business/productivity mode
│   │   ├── education-mode.ts     # Education/simulation mode
│   │   ├── daw-mode.ts           # Audio/DAW mode
│   │   └── creative-mode.ts      # Creative/cinematic mode
│   ├── plugins/
│   │   ├── plugin-runtime.ts     # Plugin loader & lifecycle
│   │   ├── plugin-types.ts       # Plugin interface definitions
│   │   └── plugin-examples/
│   │       ├── email-assistant.ts
│   │       └── gesture-macro.ts
│   ├── ai/
│   │   ├── ai-orchestrator.ts    # AI layer (queries + orchestration)
│   │   └── ai-types.ts           # AI interfaces
│   ├── connectors/
│   │   ├── connector-system.ts   # Connector base system
│   │   ├── google-connector.ts   # Google APIs (Docs, Drive, Gmail)
│   │   ├── microsoft-connector.ts# Microsoft Graph (365, OneDrive)
│   │   └── rest-connector.ts     # Generic REST API connector
│   ├── security/
│   │   ├── auth-system.ts        # Session-based auth
│   │   └── gesture-profile.ts    # Gesture-based ID (experimental)
│   ├── render/
│   │   ├── renderer.ts           # WebGL render loop
│   │   └── shader-system.ts      # Custom shaders for FX
│   ├── bootstrap.ts              # System initialization
│   ├── runtime-loop.ts           # Main game loop
│   └── index.ts                  # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── ARCHITECTURE.md           # Deep dive on architecture
│   ├── API.md                    # Module API reference
│   ├── PLUGIN-GUIDE.md           # Plugin development guide
│   ├── GESTURE-MAP.md            # Gesture behavior reference
│   └── MODES.md                  # Mode capabilities reference
├── examples/
│   ├── basic-app.html            # Minimal working example
│   ├── full-demo.html            # Full feature demo
│   └── plugin-example.ts         # Sample plugin
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # CI/CD pipeline
│   │   └── deploy.yml            # Deployment workflow
│   └── ISSUE_TEMPLATE/
│       └── bug_report.md
├── package.json
├── tsconfig.json
├── webpack.config.js
├── .gitignore
└── LICENSE (MIT)
```

## 🚀 Implementation Priority

**Phase 1: Core Infrastructure**
1. Camera + hand tracking MVP
2. Event bus system
3. Basic 3D cube spawning

**Phase 2: Interaction Layer**
4. Gesture → object mapping
5. UI overlay system
6. Mode switching

**Phase 3: Extensibility**
7. Plugin loader
8. AI integration
9. External connectors

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Input** | WebRTC, Web Audio API |
| **Vision** | MediaPipe Hands, TensorFlow.js |
| **3D Rendering** | Three.js, WebGL |
| **Physics** | Cannon.js / Ammo.js |
| **State** | Event-driven (pub/sub) |
| **Language** | TypeScript |
| **Build** | Webpack, Babel |
| **Testing** | Jest, Cypress |
| **AI** | OpenAI API, Hugging Face Transformers.js |

## 📋 Core Data Models

### HandFrame
```typescript
{
  handId: string,
  landmarks: [21 hand points],
  confidence: number,
  timestamp: number
}
```

### SpatialObject
```typescript
{
  id: string,
  type: 'panel' | 'model' | 'effect' | 'control',
  position: { x, y, z },
  rotation: { x, y, z },
  scale: { x, y, z },
  velocity: { x, y, z },
  metadata: Record<string, any>
}
```

### Gesture Events
```
gesture:pinch_start
gesture:pinch_hold
gesture:pinch_end
gesture:grab_start
gesture:grab_end
gesture:swipe_{direction}
gesture:rotate_{axis}
```

## 🎮 Gesture Behavior Map

| Gesture | Action | Context |
|---------|--------|---------|
| Pinch | Select / Spawn object | Any |
| Pinch Hold | Attach object to hand | Any |
| Release | Drop object | With object attached |
| Swipe | Navigate / Pan | Any |
| Rotate Hand | Rotate object | With object attached |
| Two-Hand Pinch | Scale object | With object attached |

## 🔌 Plugin System

Plugins are sandboxed modules with lifecycle management:

```
load → init → active → suspend → unload
```

**Plugin Capabilities:**
- Listen to/emit events
- Spawn spatial objects
- Inject UI elements
- Query AI layer
- Access connectors

## 🔒 Security Model

- **Session-based authentication** (OAuth for connectors)
- **Gesture profile ID** (experimental biometric)
- **Plugin sandboxing** (no cross-plugin access)
- **Permission-based access** to connectors/AI

## 📚 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Deep technical overview
- **[API.md](./docs/API.md)** — Module interface reference
- **[PLUGIN-GUIDE.md](./docs/PLUGIN-GUIDE.md)** — How to build plugins
- **[GESTURE-MAP.md](./docs/GESTURE-MAP.md)** — Complete gesture reference
- **[MODES.md](./docs/MODES.md)** — Mode capabilities & examples

## 🚦 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern browser with WebGL support
- Webcam (for hand tracking)

### Installation

```bash
git clone https://github.com/1deadepic-create/neural-spatial-os-v2.git
cd neural-spatial-os-v2
npm install
```

### Development

```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Build for production
npm run test       # Run test suite
npm run docs       # Generate documentation
```

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script src="dist/nsos-v2.min.js"></script>
</head>
<body>
  <canvas id="viewport"></canvas>
  <script>
    const system = new NeuroSpatialOS({
      canvas: '#viewport',
      mode: 'business',
      plugins: ['email-assistant']
    });
    
    system.start();
  </script>
</body>
</html>
```

## 🎓 4 Core Modes

### 1. Business Mode
Productivity & enterprise applications
- Google Docs/Drive integration
- Microsoft 365 integration
- Email scanning (Gmail API)
- Gesture-controlled document editing

### 2. Education Mode
Interactive learning & simulation
- 3D molecular models
- Physics simulations
- Anatomy visualization
- Spatial manipulation of scientific models

### 3. Audio/DAW Mode
Music production
- WebAudio API instruments
- MIDI controller support
- Plugin synth support
- Timeline sequencing

### 4. Creative/Cinematic Mode
Visual effects & simulation art
- Particle systems
- Shader-based VFX
- Audio-reactive visuals
- Gesture-triggered effects

## ⚠️ Limitations

This system:
- Cannot replace OS kernels
- Cannot access hardware outside browser permissions
- Cannot run native drivers
- Provides session-level (not bank-level) security
- Cannot replace full professional DAWs or CAD systems
- Depends on browser WebGL support

## 📄 License

MIT — See [LICENSE](./LICENSE)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📧 Contact

Questions? Open an issue or start a discussion.

---

**Status:** 🔨 In Development (Phase 1: Core Infrastructure)
**Last Updated:** 2026-05-30
