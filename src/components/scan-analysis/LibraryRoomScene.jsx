import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

// Condition score → color (1 = excellent/green, 5 = failed/red)
const scoreColor = (score) => {
  if (score <= 1) return '#10b981';
  if (score === 2) return '#84cc16';
  if (score === 3) return '#f59e0b';
  if (score === 4) return '#f97316';
  return '#ef4444';
};

const scoreLabel = (score) => {
  const map = { 1: 'Excellent', 2: 'Good', 3: 'Fair', 4: 'Poor', 5: 'Failed' };
  return map[score] || 'Unknown';
};

function ConditionBadge({ position, score, name }) {
  const color = scoreColor(score);
  return (
    <Html position={position} center distanceFactor={10} zIndexRange={[100, 0]}>
      <div className="flex flex-col items-center pointer-events-none select-none">
        <div
          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg whitespace-nowrap"
          style={{ backgroundColor: color }}
        >
          {score}/5 · {scoreLabel(score)}
        </div>
        <div className="mt-0.5 px-1.5 py-0.5 rounded bg-white/90 text-slate-800 text-[9px] font-semibold whitespace-nowrap shadow">
          {name}
        </div>
      </div>
    </Html>
  );
}

// Build a mesh imperatively — bypasses JSX reconciliation issues
const makeBox = (size, color, position) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(position[0], position[1], position[2]);
  return mesh;
};

const makePlane = (size, color, position, rotation) => {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide })
  );
  mesh.position.set(position[0], position[1], position[2]);
  if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  return mesh;
};

const makeCone = (args, color, position, emissive) => {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(args[0], args[1], args[2] || 16),
    new THREE.MeshStandardMaterial({ color, emissive: emissive || '#000000', emissiveIntensity: emissive ? 0.3 : 0 })
  );
  mesh.position.set(position[0], position[1], position[2]);
  return mesh;
};

const makeCylinder = (args, color, position) => {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(args[0], args[1], args[2], args[3] || 8),
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(position[0], position[1], position[2]);
  return mesh;
};

function Bookshelf({ position, rotation = [0, 0, 0], score, name }) {
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBox([2, 3, 0.4], '#5b3a1e', [0, 1.5, 0]));
    const shelfColors = ['#b45309', '#7f1d1d', '#1e3a8a', '#134e4a', '#581c87'];
    [0.3, 0.9, 1.5, 2.1, 2.7].forEach((y, i) => {
      g.add(makeBox([1.8, 0.35, 0.3], shelfColors[i], [0, y, 0.05]));
    });
    return g;
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <primitive object={group} />
      <ConditionBadge position={[0, 3.4, 0]} score={score} name={name} />
    </group>
  );
}

function ReadingTable({ position, score, name }) {
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBox([2.4, 0.1, 1.2], '#92400e', [0, 0.75, 0]));
    [[-1.05, 0.35, -0.5], [1.05, 0.35, -0.5], [-1.05, 0.35, 0.5], [1.05, 0.35, 0.5]].forEach((p) => {
      g.add(makeBox([0.1, 0.7, 0.1], '#5b3a1e', p));
    });
    g.add(makeCylinder([0.05, 0.05, 0.3, 8], '#1f2937', [0.8, 0.95, 0]));
    g.add(makeCone([0.15, 0.2, 16], '#fcd34d', [0.8, 1.15, 0], '#fcd34d'));
    return g;
  }, []);
  return (
    <group position={position}>
      <primitive object={group} />
      <ConditionBadge position={[0, 1.6, 0]} score={score} name={name} />
    </group>
  );
}

function Chair({ position, rotation = [0, 0, 0], score, name }) {
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBox([0.5, 0.08, 0.5], '#7c2d12', [0, 0.45, 0]));
    g.add(makeBox([0.5, 0.7, 0.06], '#7c2d12', [0, 0.85, -0.22]));
    [[-0.22, 0.22, -0.22], [0.22, 0.22, -0.22], [-0.22, 0.22, 0.22], [0.22, 0.22, 0.22]].forEach((p) => {
      g.add(makeBox([0.06, 0.45, 0.06], '#451a03', p));
    });
    return g;
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <primitive object={group} />
      <ConditionBadge position={[0, 1.5, 0]} score={score} name={name} />
    </group>
  );
}

function LibrarianDesk({ position, score, name }) {
  const group = useMemo(() => {
    const g = new THREE.Group();
    g.add(makeBox([3, 1, 1], '#78350f', [0, 0.5, 0]));
    g.add(makeBox([3.2, 0.1, 1.2], '#92400e', [0, 1.05, 0]));
    g.add(makeBox([0.6, 0.4, 0.05], '#0f172a', [0.8, 1.35, 0]));
    return g;
  }, []);
  return (
    <group position={position}>
      <primitive object={group} />
      <ConditionBadge position={[0, 1.9, 0]} score={score} name={name} />
    </group>
  );
}

export default function LibraryRoomScene() {
  const staticScene = useMemo(() => {
    const g = new THREE.Group();
    // Floor
    g.add(makePlane([18, 14], '#d4a574', [0, 0, 0], [-Math.PI / 2, 0, 0]));
    // Walls
    g.add(makeBox([18, 4, 0.2], '#fef3c7', [0, 2, -7]));
    g.add(makeBox([0.2, 4, 14], '#fef3c7', [-9, 2, 0]));
    g.add(makeBox([0.2, 4, 14], '#fef3c7', [9, 2, 0]));
    // Rug
    g.add(makePlane([5, 3.5], '#9f1239', [0, 0.01, 0], [-Math.PI / 2, 0, 0]));
    return g;
  }, []);

  return (
    <group>
      <primitive object={staticScene} />

      {/* Bookshelves along back wall */}
      <Bookshelf position={[-6, 0, -6.6]} score={1} name="Bookshelf A" />
      <Bookshelf position={[-3, 0, -6.6]} score={2} name="Bookshelf B" />
      <Bookshelf position={[0, 0, -6.6]} score={3} name="Bookshelf C (worn)" />
      <Bookshelf position={[3, 0, -6.6]} score={2} name="Bookshelf D" />
      <Bookshelf position={[6, 0, -6.6]} score={4} name="Bookshelf E (damaged)" />

      {/* Side wall bookshelves */}
      <Bookshelf position={[-8.6, 0, -2]} rotation={[0, Math.PI / 2, 0]} score={1} name="Reference A" />
      <Bookshelf position={[-8.6, 0, 2]} rotation={[0, Math.PI / 2, 0]} score={2} name="Reference B" />

      {/* Reading tables with chairs */}
      <ReadingTable position={[-2.5, 0, 1]} score={1} name="Reading Table 1" />
      <Chair position={[-2.5, 0, 2.2]} rotation={[0, Math.PI, 0]} score={2} name="Chair 1A" />
      <Chair position={[-2.5, 0, -0.2]} score={3} name="Chair 1B (loose)" />

      <ReadingTable position={[2.5, 0, 1]} score={2} name="Reading Table 2" />
      <Chair position={[2.5, 0, 2.2]} rotation={[0, Math.PI, 0]} score={1} name="Chair 2A" />
      <Chair position={[2.5, 0, -0.2]} score={5} name="Chair 2B (broken)" />

      {/* Librarian's desk */}
      <LibrarianDesk position={[5, 0, 4.5]} score={2} name="Librarian Desk" />
      <Chair position={[5, 0, 5.8]} rotation={[0, Math.PI, 0]} score={1} name="Staff Chair" />
    </group>
  );
}