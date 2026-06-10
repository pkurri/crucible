---
name: three-js-game
description: >
  Three.js and React Three Fiber game/interactive 3D skill. Use when building
  WebGL scenes, 3D web games, product viewers, physics interactions, shaders,
  asset loading, or performance-sensitive browser 3D.
triggers:
  - 'Three.js'
  - 'react three fiber'
  - 'WebGL'
  - '3D game'
  - 'GLTF'
  - 'shader'
---

# Three.js Game And Interactive 3D

Use this skill for browser-native 3D scenes and games.

## Core Rules

- Start with a full-bleed, correctly framed scene before adding panels.
- Use real geometry or loaded assets; avoid decorative placeholder-only scenes.
- Keep render loop logic separate from React state updates.
- Use `useFrame` for animation and refs for high-frequency mutation.
- Use instancing for repeated meshes and texture atlases for repeated materials.
- Dispose geometries, materials, render targets, and event listeners on
  teardown.
- Use compressed assets: glTF/GLB, Draco or Meshopt, KTX2/Basis textures.

## Structure

```text
src/three/
├── SceneRoot.tsx
├── camera.ts
├── controls.ts
├── loaders.ts
├── systems/
│   ├── physics.ts
│   ├── input.ts
│   └── interactions.ts
└── assets.ts
```

## Performance Budget

- 60 FPS target on desktop, 30 FPS minimum on mid-range mobile if 60 is not
  realistic
- Keep draw calls, shadow casters, post-processing, and pixel ratio bounded
- Clamp device pixel ratio for mobile and high-DPI screens
- Avoid large transparent overdraw and unbounded particle counts
- Lazy-load optional scenes and heavy assets

## Verification

For frontend work, verify with screenshots or browser inspection:

- Canvas is nonblank after load
- Camera frames the subject at mobile and desktop sizes
- Interaction works with pointer and keyboard where applicable
- Scene still renders after route changes or hot reloads
- No major console errors, missing textures, or CORS asset failures
