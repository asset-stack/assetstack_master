import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import LibraryRoomScene from './LibraryRoomScene';

function GLTFModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Model({ url, type }) {
  // Show the demo library scene when type is 'demo' or no valid GLTF url provided
  if (url && (type === 'gltf' || type === 'glb')) {
    return <GLTFModel url={url} />;
  }
  return <LibraryRoomScene />;
}

function AssetMarker({ position, label, condition = 'operational', onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.05;
    }
  });

  const color = condition === 'critical' ? '#ef4444' : condition === 'degraded' ? '#f59e0b' : '#10b981';

  return (
    <group
      ref={ref}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Pin */}
      <mesh>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.8 : 0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1 : 0.4} />
      </mesh>
      {/* Halo when hovered */}
      {hovered && (
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}
      <Html distanceFactor={10} position={[0, 1, 0]} center>
        <div className={`px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap shadow-lg transition-all ${
          hovered ? 'bg-slate-900 text-white scale-110' : 'bg-white/90 text-slate-800'
        }`}>
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function ScanViewer3D({ modelUrl, modelType = 'demo', overlays = [], onAssetClick }) {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden">
      <Canvas shadows camera={{ position: [8, 8, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
        <Suspense fallback={
          <Html center>
            <div className="text-white text-sm">Loading scan…</div>
          </Html>
        }>
          <Bounds fit clip observe margin={1.2}>
            <Model url={modelUrl} type={modelType} />
          </Bounds>
          {overlays.map((o, i) => (
            <AssetMarker
              key={i}
              position={[o.x || 0, o.y || 0.5, o.z || 0]}
              label={o.equipment_name || `Asset ${i + 1}`}
              condition={o.condition}
              onClick={() => onAssetClick && onAssetClick(o)}
            />
          ))}
        </Suspense>
        <hemisphereLight args={['#ffffff', '#64748b', 0.6]} />
        <pointLight position={[-5, 8, 5]} intensity={0.4} />
        <gridHelper args={[30, 30, '#475569', '#334155']} position={[0, -0.01, 0]} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>

      {/* HUD */}
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-semibold">3D Scan Viewer</span>
        </div>
        <p className="text-[10px] text-white/60 mt-0.5">Drag to rotate • Scroll to zoom • Click pins</p>
      </div>
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white/70">
        {overlays.length} assets overlaid
      </div>
    </div>
  );
}