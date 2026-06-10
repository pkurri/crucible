---
name: multiplayer-game-networking
description: >
  Multiplayer and realtime game networking skill for WebSocket, WebRTC,
  Colyseus, Socket.IO, Supabase Realtime, authoritative servers, matchmaking,
  latency handling, and cheat-resistant browser games.
triggers:
  - 'multiplayer'
  - 'realtime game'
  - 'WebSocket game'
  - 'matchmaking'
  - 'authoritative server'
  - 'Socket.IO'
---

# Multiplayer Game Networking

Use this skill when a game needs shared state, matchmaking, rooms, lobbies,
spectators, chat, or realtime collaboration.

## Architecture Choices

| Need                              | Pattern                                    |
| --------------------------------- | ------------------------------------------ |
| Casual turn-based or async        | Server API + database events               |
| Realtime arcade with low stakes   | WebSocket rooms with server reconciliation |
| Competitive or paid economy       | Authoritative server simulation            |
| Peer collaboration or voice/video | WebRTC with signaling                      |
| Fast room-based game backend      | Colyseus or Socket.IO                      |

## Non-Negotiables

- Server validates player actions and rate limits messages.
- Never trust client-side scores, inventory, currency, or match outcomes.
- Define protocol messages as typed schemas and version them.
- Plan reconnect, resync, duplicate messages, and clock drift.
- Add bot or scripted clients for load and soak tests.
- Log enough match events to replay disputes and debug desyncs.

## Latency Playbook

- Use client prediction only for local responsiveness.
- Use interpolation for remote entities.
- Use reconciliation after server snapshots.
- Send compact input commands, not full local state.
- Keep tick rate intentional and documented.

## Required Artifacts

- `NETWORK_PROTOCOL.md`: messages, schemas, auth, versioning
- `MATCH_FLOW.md`: lobby, ready, start, reconnect, end, rewards
- `ANTI_CHEAT_NOTES.md`: trust boundaries and abuse cases
