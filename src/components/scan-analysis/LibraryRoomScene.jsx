import React from 'react';
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

// --- Furniture pieces ---

function Bookshelf({ position, rotation = [0, 0, 0], score, name }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Outer frame */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2, 3, 0.4]} />
        <meshStandardMaterial color="#5b3a1e" />
      </mesh>
      {/* Shelves (books) */}
      {[0.3, 0.9, 1.5, 2.1, 2.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <boxGeometry args={[1.8, 0.35, 0.3]} />
          <meshStandardMaterial color={['#b45309', '#7f1d1d', '#1e3a8a', '#134e4a', '#581c87'][i]} />
        </mesh>
      ))}
      <ConditionBadge position={[0, 3.4, 0]} score={score} name={name} />
    </group>
  );
}

function ReadingTable({ position, score, name }) {
  return (
    <group position={position}>
      {/* Tabletop */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.2]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      {/* Legs */}
      {[[-1.05, 0.35, -0.5], [1.05, 0.35, -0.5], [-1.05, 0.35, 0.5], [1.05, 0.35, 0.5]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.1, 0.7, 0.1]} />
          <meshStandardMaterial color="#5b3a1e" />
        </mesh>
      ))}
      {/* Lamp */}
      <mesh position={[0.8, 0.95, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.8, 1.15, 0]}>
        <coneGeometry args={[0.15, 0.2, 16]} />
        <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.3} />
      </mesh>
      <ConditionBadge position={[0, 1.6, 0]} score={score} name={name} />
    </group>
  );
}

function Chair({ position, rotation = [0, 0, 0], score, name }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.85, -0.22]}>
        <boxGeometry args={[0.5, 0.7, 0.06]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      {/* Legs */}
      {[[-0.22, 0.22, -0.22], [0.22, 0.22, -0.22], [-0.22, 0.22, 0.22], [0.22, 0.22, 0.22]].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.06, 0.45, 0.06]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
      ))}
      <ConditionBadge position={[0, 1.5, 0]} score={score} name={name} />
    </group>
  );
}

function LibrarianDesk({ position, score, name }) {
  return (
    <group position={position}>
      {/* Main desk body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 1, 1]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Top */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[3.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      {/* Computer */}
      <mesh position={[0.8, 1.35, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <ConditionBadge position={[0, 1.9, 0]} score={score} name={name} />
    </group>
  );
}

function Rug({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[5, 3.5]} />
      <meshStandardMaterial color="#9f1239" />
    </mesh>
  );
}

export default function LibraryRoomScene() {
  return (
    <group>
      {/* Floor — wooden */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>

      {/* Walls — warm cream */}
      <mesh position={[0, 2, -7]}>
        <boxGeometry args={[18, 4, 0.2]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      <mesh position={[-9, 2, 0]}>
        <boxGeometry args={[0.2, 4, 14]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      <mesh position={[9, 2, 0]}>
        <boxGeometry args={[0.2, 4, 14]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>

      {/* Central rug */}
      <Rug position={[0, 0.01, 0]} />

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