---
name: mcp-unity
description: >
  Unity Editor automation and integration via Model Context Protocol (MCP).
  Enables AI assistants to manage assets, control scenes, edit scripts,
  and automate Unity Editor tasks directly.
triggers:
  - 'Unity Editor'
  - 'Unity MCP'
  - 'Unity automation'
  - 'control Unity'
  - 'Unity scene'
  - 'Unity assets'
---

# Skill: MCP Unity

Bridge the gap between your AI assistant and the Unity Editor. This skill
integrates the **Unity MCP** server to allow direct manipulation of Unity
projects from the chat.

## 🚀 Capabilities

- **Scene Management**: Find, create, and manage GameObjects, components, and
  scene hierarchy.
- **Asset Control**: Manage textures, materials, prefabs, and project assets.
- **Scripting**: Create, edit, and validate C# scripts with live compilation
  checks.
- **Editor Automation**: Execute menu items, manage build settings, and control
  the Unity Profiler.
- **Physics & Graphics**: Configure physics settings, layer matrices, volumes,
  and rendering stats.

## 🛠️ MCP Tools

- `manage_scene`: Add/Move/Delete GameObjects and manage multi-scene setups.
- `manage_assets`: Import, delete, and organize project assets.
- `manage_script`: Create/Edit C# scripts with `unity_reflect` for API checks.
- `manage_build`: Trigger player builds and manage platform settings.
- `manage_profiler`: Control profiler sessions and read frame timings.
- `unity_docs`: Fetch official Unity documentation directly into context.

## 📋 Setup Instructions

1.  **Unity Side**: Install the `MCPForUnity` package via Git URL:
    `https://github.com/CoplayDev/unity-mcp.git?path=/MCPForUnity#main`
2.  **Server**: In Unity, go to `Window > MCP for Unity` and click **Start
    Server**.
3.  **Client**: Ensure the MCP server `http://localhost:8080/mcp` is configured
    in your assistant's settings.

## ⚙️ Recommended Skill Chain

- `gaming-studio` for high-level project orchestration.
- `game-engine-helper` for initial architecture and engine decisions.
- `unity-specialist` (Tier 3) for hands-on implementation.
