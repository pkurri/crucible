---
name: collaborative-whiteboard
description:
  Real-time collaborative whiteboard with drawing, shapes, sticky notes, and
  multi-user support using CRDTs. Use when building collaborative tools,
  implementing real-time collaboration, creating drawing apps, or enabling
  multi-user editing.
triggers:
  - 'whiteboard'
  - 'collaborative'
  - 'drawing'
  - 'real-time collaboration'
  - 'multi-user'
  - 'CRDT'
---

# Collaborative Whiteboard

Real-time collaborative whiteboard with CRDT-based synchronization.

## Capabilities

- **Drawing**: Freehand, shapes, text
- **Collaboration**: Multi-user editing
- **CRDTs**: Conflict-free merging
- **Cursors**: Live cursor positions
- **History**: Undo/redo

## Usage

```markdown
@skill collaborative-whiteboard

Create a collaborative whiteboard:

- Tools: Pen, shapes, text, sticky notes
- Collaboration: Real-time sync
- Export: PNG, PDF
- Permissions: View, edit, comment
```

## CRDT Setup

```typescript
import * as Y from 'yjs'
import {WebsocketProvider} from 'y-websocket'

const doc = new Y.Doc()
const provider = new WebsocketProvider(
  'wss://collab.example.com',
  'room-name',
  doc
)

// Shared canvas elements
const elements = doc.getMap('elements')

// Add element
elements.set('element-1', {
  id: 'element-1',
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  color: '#ff0000',
})

// Listen for changes
elements.observe(() => {
  renderCanvas(elements.toJSON())
})
```

## Whiteboard Component

```typescript
// Whiteboard.tsx
import { useState, useRef, useEffect } from 'react';
import * as Y from 'yjs';

export function Whiteboard({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'rect' | 'text'>('pen');
  const [elements, setElements] = useState<Element[]>([]);

  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      'wss://collab.example.com',
      roomId,
      doc
    );

    const yElements = doc.getMap('elements');

    yElements.observe(() => {
      setElements(Array.from(yElements.values()));
    });

    return () => provider.destroy();
  }, [roomId]);

  const handleDraw = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pen') {
      // Add point to current stroke
    } else if (tool === 'rect') {
      // Create rectangle
    }
  };

  return (
    <div>
      <Toolbar tool={tool} onToolChange={setTool} />
      <canvas
        ref={canvasRef}
        onMouseDown={handleDraw}
        width={1200}
        height={800}
      />
      <UserCursors roomId={roomId} />
    </div>
  );
}
```

## Live Cursors

```typescript
// Cursors.tsx
function UserCursors({ roomId }: { roomId: string }) {
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());

  useEffect(() => {
    const awareness = provider.awareness;

    awareness.on('change', () => {
      const users = Array.from(awareness.getStates().entries());
      const cursorMap = new Map();

      users.forEach(([clientId, state]) => {
        if (state.cursor) {
          cursorMap.set(clientId, state.cursor);
        }
      });

      setCursors(cursorMap);
    });
  }, [roomId]);

  const handleMouseMove = (e: MouseEvent) => {
    const awareness = provider.awareness;
    awareness.setLocalStateField('cursor', {
      x: e.clientX,
      y: e.clientY,
      userId: currentUser.id,
      color: currentUser.color
    });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {Array.from(cursors.entries()).map(([clientId, cursor]) => (
        <Cursor
          key={clientId}
          x={cursor.x}
          y={cursor.y}
          color={cursor.color}
          userId={cursor.userId}
        />
      ))}
    </div>
  );
}
```

## Features

- **Tools**: Pen, eraser, shapes, text
- **Colors**: Palette selector
- **Layers**: Z-index management
- **Templates**: Pre-made templates
- **Comments**: Sticky notes
- **Zoom**: Pan and zoom
- **Grid**: Snap to grid

## Persistence

```typescript
// Save to IndexedDB
import {IndexeddbPersistence} from 'y-indexeddb'

const persistence = new IndexeddbPersistence('whiteboard', doc)

// Export
const exportWhiteboard = () => {
  const state = Y.encodeStateAsUpdate(doc)
  return Buffer.from(state).toString('base64')
}

// Import
const importWhiteboard = (base64: string) => {
  const state = Buffer.from(base64, 'base64')
  Y.applyUpdate(doc, new Uint8Array(state))
}
```

## Integration

- Yjs: CRDT implementation
- Socket.io: WebSocket transport
- Fabric.js: Canvas rendering
- Liveblocks: Alternative backend
