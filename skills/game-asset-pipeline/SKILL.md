---
name: game-asset-pipeline
description: >
  Game and web asset pipeline skill for sprites, textures, GLB/GLTF models,
  audio, fonts, compression, licensing, naming, optimization, and runtime
  loading strategy.
triggers:
  - 'game assets'
  - 'asset pipeline'
  - 'sprites'
  - 'GLB'
  - 'audio assets'
  - 'texture optimization'
---

# Game Asset Pipeline

Use this skill when creating, importing, optimizing, or shipping visual/audio
assets for games and rich web experiences.

## Asset Rules

- Keep raw source files separate from optimized runtime assets.
- Track license, author, source URL, and allowed use for every external asset.
- Use predictable names: `domain_subject_variant_size.ext`.
- Compress images, audio, and 3D assets before production release.
- Generate atlases for sprites and repeated UI imagery.
- Avoid blocking gameplay on optional cosmetic assets.
- Provide fallbacks for missing assets and failed network loads.

## Recommended Folders

```text
assets/
├── source/
├── optimized/
├── manifests/
│   └── licenses.csv
└── README.md

public/
└── game-assets/
```

## Optimization Targets

- Images: WebP/AVIF for web UI, PNG only where alpha precision matters
- Sprites: packed atlases with metadata
- 3D: GLB, Draco or Meshopt, KTX2/Basis textures
- Audio: OGG/Opus and MP3 fallback where needed
- Fonts: subset, preload only essential faces

## Required Before Release

- Asset manifest with size, source, license, and runtime path
- Visual QA pass at target resolutions
- Audio loudness/mute/settings pass
- Bundle impact report for large assets
