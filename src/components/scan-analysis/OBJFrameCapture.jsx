import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { base44 } from '@/api/base44Client';
import { Loader2, Camera, CheckCircle2 } from 'lucide-react';

// 8 fixed camera angles around the model (multiplied by bounding-sphere radius)
const ANGLES = [
  { label: 'Front',       dir: [0, 0.2, 1] },
  { label: 'Back',        dir: [0, 0.2, -1] },
  { label: 'Left',        dir: [-1, 0.2, 0] },
  { label: 'Right',       dir: [1, 0.2, 0] },
  { label: 'Top-Down',    dir: [0, 1, 0.001] },
  { label: 'Oblique-NE',  dir: [0.8, 0.5, 0.8] },
  { label: 'Oblique-NW',  dir: [-0.8, 0.5, 0.8] },
  { label: 'Oblique-SE',  dir: [0.8, 0.5, -0.8] },
];

async function dataUrlToFile(dataUrl, name) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], name, { type: 'image/jpeg' });
}

export default function OBJFrameCapture({ scan, onComplete, onProgress }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Preparing…');
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!scan?.file_url) {
        setStatus('No OBJ file on this scan');
        return;
      }

      try {
        // Renderer
        const width = 1024, height = 768;
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          preserveDrawingBuffer: true,
        });
        renderer.setSize(width, height);
        renderer.setClearColor(0xf5f5f5, 1);

        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dir = new THREE.DirectionalLight(0xffffff, 0.9);
        dir.position.set(5, 10, 7);
        scene.add(dir);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

        // Load OBJ (try MTL if filename hints at it)
        setStatus('Loading OBJ mesh…');
        const objLoader = new OBJLoader();
        const mtlUrl = scan.file_url.replace(/\.obj$/i, '.mtl');
        let hasMaterials = false;
        try {
          const mtlRes = await fetch(mtlUrl, { method: 'HEAD' });
          if (mtlRes.ok) {
            const mtlLoader = new MTLLoader();
            const materials = await new Promise((res, rej) => mtlLoader.load(mtlUrl, res, null, rej));
            materials.preload();
            objLoader.setMaterials(materials);
            hasMaterials = true;
          }
        } catch (_e) { /* no MTL, use default */ }

        const obj = await new Promise((res, rej) => objLoader.load(scan.file_url, res, null, rej));
        if (!hasMaterials) {
          obj.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xcccccc, roughness: 0.8, metalness: 0.1,
                side: THREE.DoubleSide,
              });
            }
          });
        }
        scene.add(obj);

        // Fit camera to bounding sphere
        const box = new THREE.Box3().setFromObject(obj);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const center = sphere.center;
        const radius = Math.max(sphere.radius, 1);
        const distance = radius * 2.5;

        if (cancelled) return;

        // Capture each angle
        const frames = [];
        for (let i = 0; i < ANGLES.length; i++) {
          if (cancelled) return;
          const a = ANGLES[i];
          setCurrent(i + 1);
          setStatus(`Capturing ${a.label} (${i + 1}/${ANGLES.length})…`);

          const d = new THREE.Vector3(...a.dir).normalize().multiplyScalar(distance);
          camera.position.copy(center).add(d);
          camera.lookAt(center);
          camera.updateProjectionMatrix();

          renderer.render(scene, camera);
          const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
          const file = await dataUrlToFile(dataUrl, `${scan.id}-frame-${i}.jpg`);
          const { file_url } = await base44.integrations.Core.UploadFile({ file });

          const frame = await base44.entities.ScanFrame.create({
            digital_twin_model_id: scan.id,
            digital_twin_model_name: scan.name,
            frame_index: i,
            angle_label: a.label,
            image_url: file_url,
            camera_position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
            analysis_status: 'pending',
          });
          frames.push(frame);
          onProgress && onProgress(i + 1, ANGLES.length);
        }

        // Cleanup
        renderer.dispose();

        if (cancelled) return;
        setStatus('Running AI analysis on all frames…');

        // Analyze each frame in parallel
        await Promise.all(frames.map(async (frame) => {
          await base44.entities.ScanFrame.update(frame.id, { analysis_status: 'analyzing' });
          try {
            const res = await base44.functions.invoke('analyzeScanCondition', {
              image_url: frame.image_url,
              digital_twin_model_id: scan.id,
              digital_twin_model_name: scan.name,
              equipment_name: `${scan.name} — ${frame.angle_label}`,
            });
            await base44.entities.ScanFrame.update(frame.id, {
              analysis_status: 'completed',
              findings_count: res?.data?.findings_count || 0,
            });
          } catch (_e) {
            await base44.entities.ScanFrame.update(frame.id, { analysis_status: 'failed' });
          }
        }));

        // Set first frame's image as the scan preview if none exists
        if (!scan.preview_image_url && frames[0]) {
          await base44.entities.DigitalTwinModel.update(scan.id, {
            preview_image_url: frames[0].image_url,
          });
        }

        setDone(true);
        setStatus('All frames captured and analyzed');
        onComplete && onComplete(frames);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
      }
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan?.id]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4" /> LiDAR Frame Extraction
          </p>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
        <div className="text-xs font-medium text-slate-600">{current}/{ANGLES.length}</div>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
          style={{ width: `${(current / ANGLES.length) * 100}%` }}
        />
      </div>
      {/* Hidden renderer canvas */}
      <canvas ref={canvasRef} className="hidden" width={1024} height={768} />
    </div>
  );
}