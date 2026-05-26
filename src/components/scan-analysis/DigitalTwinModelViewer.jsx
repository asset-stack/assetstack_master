import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, ExternalLink, Loader2, RotateCcw } from 'lucide-react';

function fitCameraToObject(camera, object, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 10;
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  cameraZ *= 1.6;

  camera.position.set(center.x + cameraZ * 0.45, center.y + cameraZ * 0.35, center.z + cameraZ);
  camera.near = Math.max(maxDim / 1000, 0.01);
  camera.far = maxDim * 1000;
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

export default function DigitalTwinModelViewer({ modelUrl, modelType }) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!modelUrl || !mountRef.current) return undefined;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.01, 10000);
    camera.position.set(8, 6, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(8, 12, 8);
    scene.add(keyLight);

    const grid = new THREE.GridHelper(20, 20, 0x475569, 0x1e293b);
    grid.position.y = -0.02;
    scene.add(grid);

    const loader = modelType === 'obj' ? new OBJLoader() : new GLTFLoader();
    setLoading(true);
    setError('');

    loader.load(
      modelUrl,
      (loaded) => {
        const model = loaded.scene || loaded;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (!child.material) {
              child.material = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.72 });
            }
          }
        });
        scene.add(model);
        modelRef.current = model;
        fitCameraToObject(camera, model, controls);
        setLoading(false);
      },
      undefined,
      () => {
        setError('This model could not be rendered in the browser, but the full file is still attached.');
        setLoading(false);
      }
    );

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement?.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [modelUrl, modelType]);

  const resetView = () => {
    if (cameraRef.current && modelRef.current && controlsRef.current) {
      fitCameraToObject(cameraRef.current, modelRef.current, controlsRef.current);
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-950">
      <div ref={mountRef} className="absolute inset-0" />

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        <Badge className="pointer-events-auto bg-white/10 text-white border-white/10 backdrop-blur-md">
          <Box className="w-3 h-3 mr-1" /> Full digital twin file
        </Badge>
        <div className="flex gap-2 pointer-events-auto">
          <Button size="sm" variant="outline" onClick={resetView} className="h-8 bg-white/90">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset view
          </Button>
          <Button size="sm" asChild className="h-8 bg-indigo-600 hover:bg-indigo-700">
            <a href={modelUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open file
            </a>
          </Button>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-white">
          <div className="text-center">
            <Loader2 className="w-7 h-7 mx-auto mb-2 animate-spin" />
            <p className="text-sm font-semibold">Loading full digital twin…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-slate-950 text-white">
          <div className="max-w-sm">
            <Box className="w-12 h-12 mx-auto mb-3 text-indigo-300" />
            <p className="font-semibold">Full model attached</p>
            <p className="text-xs text-white/60 mt-1 mb-4">{error}</p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <a href={modelUrl} target="_blank" rel="noreferrer">Open the digital twin file</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}