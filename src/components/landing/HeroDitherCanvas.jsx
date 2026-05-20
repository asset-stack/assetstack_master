import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WebGL dither canvas with mouse trail FBO.
 * Ported from assetstack-hero-FINAL HTML — preserves exact shader logic,
 * Bayer matrices, Perlin noise, ping-pong trail buffer and animated bias.
 */
export default function HeroDitherCanvas({ imageUrl }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    // Listen for mouse events on the hero <section> so the trail
    // responds across the whole hero area (including over text/CTAs),
    // not just the canvas container.
    const hero = container.closest('#hero') || container;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(hero.offsetWidth, hero.offsetHeight);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const scene = new THREE.Scene();

    // Fullscreen triangle
    const triGeo = new THREE.BufferGeometry();
    triGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
    );
    triGeo.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2)
    );

    // Trail FBO ping-pong
    const FBO_SIZE = 512;
    const rtOpts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    const trailRTs = [
      new THREE.WebGLRenderTarget(FBO_SIZE, FBO_SIZE, rtOpts),
      new THREE.WebGLRenderTarget(FBO_SIZE, FBO_SIZE, rtOpts),
    ];
    let trailIdx = 0;

    const trailScene = new THREE.Scene();
    const trailCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const trailMat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        u_texture: { value: null },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uLastPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uAspect: { value: 1.0 },
        uVelocity: { value: 0.0 },
        uTime: { value: 0.0 },
        uInitialRadius: { value: 0.08 },
        uInitialRadiusMultiplier: { value: 0.02 },
        uBorderSize: { value: 0.15 },
        uBorderSizeMultiplier: { value: 0.06 },
        uDecayRate: { value: 0.045 },
      },
      vertexShader: `
        in vec3 position;
        out vec2 vUv;
        void main() {
          vUv = position.xy * 0.5 + 0.5;
          gl_Position = vec4(position, 1.0);
        }`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D u_texture;
        uniform vec2 uPointer;
        uniform vec2 uLastPointer;
        uniform float uAspect;
        uniform float uVelocity;
        uniform float uTime;
        uniform float uInitialRadius;
        uniform float uInitialRadiusMultiplier;
        uniform float uBorderSize;
        uniform float uBorderSizeMultiplier;
        uniform float uDecayRate;
        in vec2 vUv;
        layout(location=0) out vec4 gColor;

        float circle(vec2 uv, vec2 centre, float radius, float border) {
          uv -= centre;
          uv.x *= uAspect;
          float dist = length(uv);
          return smoothstep(radius + border, radius - border, dist);
        }

        float lineSegment(vec2 p, vec2 a, vec2 b, float radius, float border) {
          p.x *= uAspect; a.x *= uAspect; b.x *= uAspect;
          vec2 pa = p - a, ba = b - a;
          float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
          float dist = length(pa - ba * h);
          return smoothstep(radius + border, radius - border, dist);
        }

        void main() {
          vec4 color = texture(u_texture, vUv);
          float r = uInitialRadius + uVelocity * uInitialRadiusMultiplier;
          float b = uBorderSize   + uVelocity * uBorderSizeMultiplier;
          float line = lineSegment(vUv, uLastPointer, uPointer, r, b);
          float cap  = circle(vUv, uPointer, r, b);
          color.rgb += max(line, cap) * uVelocity;
          color.rgb  = mix(color.rgb, vec3(0.0), uDecayRate);
          color.rgb  = clamp(color.rgb, 0.0, 1.0);
          color.a    = 1.0;
          gColor = color;
        }`,
    });
    const trailMesh = new THREE.Mesh(triGeo, trailMat);
    trailScene.add(trailMesh);

    // Main dither shader
    const ditherMat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        tMap: { value: null },
        uTrail: { value: null },
        uResolution: { value: new THREE.Vector2() },
        uTextureSize: { value: new THREE.Vector2() },
        uPlaneSize: { value: new THREE.Vector2() },
        uTime: { value: 0 },
        uBias: { value: 0.1 },
        uPixelSize: { value: 1.0 },
        uPixelSizeMultiplier: { value: 3.5 },
        uScaleResolution: { value: 1.0 },
        uMatrixSize: { value: 8.0 },
        uColorNum: { value: 2.0 },
        uColorDark: { value: new THREE.Color(25 / 255, 37 / 255, 170 / 255) },
        uColorLight: { value: new THREE.Color(183 / 255, 185 / 255, 211 / 255) },
        uBiasNoiseScale: { value: 1.2 },
        uBiasNoiseSpeed: { value: 0.03 },
        uBiasNoiseWeight: { value: 0.08 },
        uBiasPulseSpeed: { value: 0.15 },
        uBiasPulseWeight: { value: 0.04 },
        uBiasAnimationStrength: { value: 0.25 },
        uTrailIntensityMultiplier: { value: 2.5 },
        uZoom: { value: 1.0 },
      },
      vertexShader: `
        in vec3 position;
        in vec2 uv;
        out vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tMap;
        uniform sampler2D uTrail;
        uniform vec2 uResolution;
        uniform vec2 uTextureSize;
        uniform vec2 uPlaneSize;
        uniform float uTime;
        uniform float uBias;
        uniform float uPixelSize;
        uniform float uPixelSizeMultiplier;
        uniform float uScaleResolution;
        uniform float uMatrixSize;
        uniform float uColorNum;
        uniform vec3 uColorDark;
        uniform vec3 uColorLight;
        uniform float uBiasNoiseScale;
        uniform float uBiasNoiseSpeed;
        uniform float uBiasNoiseWeight;
        uniform float uBiasPulseSpeed;
        uniform float uBiasPulseWeight;
        uniform float uBiasAnimationStrength;
        uniform float uTrailIntensityMultiplier;
        uniform float uZoom;
        in vec2 vUv;
        layout(location=0) out vec4 fragColor;

        vec3 mod289_3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
        vec4 mod289_4(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
        vec4 permute(vec4 x){return mod289_4(((x*34.0)+10.0)*x);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
        vec3 fade(vec3 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}
        float cnoise(vec3 P){
          vec3 Pi0=floor(P),Pi1=Pi0+vec3(1.0);
          Pi0=mod289_3(Pi0);Pi1=mod289_3(Pi1);
          vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.0);
          vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
          vec4 iy=vec4(Pi0.yy,Pi1.yy);
          vec4 iz0=Pi0.zzzz,iz1=Pi1.zzzz;
          vec4 ixy=permute(permute(ix)+iy);
          vec4 ixy0=permute(ixy+iz0),ixy1=permute(ixy+iz1);
          vec4 gx0=ixy0*(1.0/7.0),gy0=fract(floor(gx0)*(1.0/7.0))-0.5;
          gx0=fract(gx0);
          vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0);
          vec4 sz0=step(gz0,vec4(0.0));
          gx0-=sz0*(step(0.0,gx0)-0.5);gy0-=sz0*(step(0.0,gy0)-0.5);
          vec4 gx1=ixy1*(1.0/7.0),gy1=fract(floor(gx1)*(1.0/7.0))-0.5;
          gx1=fract(gx1);
          vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1);
          vec4 sz1=step(gz1,vec4(0.0));
          gx1-=sz1*(step(0.0,gx1)-0.5);gy1-=sz1*(step(0.0,gy1)-0.5);
          vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);
          vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
          g000*=norm0.x;g010*=norm0.y;g100*=norm0.z;g110*=norm0.w;
          vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
          g001*=norm1.x;g011*=norm1.y;g101*=norm1.z;g111*=norm1.w;
          float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.x,Pf0.yz));
          float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),n110=dot(g110,vec3(Pf1.xy,Pf0.z));
          float n001=dot(g001,vec3(Pf0.xy,Pf1.z)),n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
          float n011=dot(g011,vec3(Pf0.x,Pf1.yz)),n111=dot(g111,Pf1);
          vec3 fade_xyz=fade(Pf0);
          vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
          vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
          return 2.2*mix(n_yz.x,n_yz.y,fade_xyz.x);
        }

        const float bayer4[16] = float[16](
           0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
          12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
           3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
          15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
        );
        const float bayer8[64] = float[64](
            0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
           32.0/64.0, 16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0, 19.0/64.0, 47.0/64.0, 31.0/64.0,
            8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0, 59.0/64.0,  7.0/64.0, 55.0/64.0,
           40.0/64.0, 24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0, 27.0/64.0, 39.0/64.0, 23.0/64.0,
            2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0, 49.0/64.0, 13.0/64.0, 61.0/64.0,
           34.0/64.0, 18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0, 17.0/64.0, 45.0/64.0, 29.0/64.0,
           10.0/64.0, 58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0, 57.0/64.0,  5.0/64.0, 53.0/64.0,
           42.0/64.0, 26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0, 25.0/64.0, 37.0/64.0, 21.0/64.0
        );

        vec3 orderedDither(vec2 fragCoord, float lum, float trailIntensity, float animBias) {
          float threshold;
          if (trailIntensity < 0.5) {
            int x = int(mod(fragCoord.x, 4.0));
            int y = int(mod(fragCoord.y, 4.0));
            threshold = bayer4[y * 4 + x];
          } else {
            int x = int(mod(fragCoord.x, 8.0));
            int y = int(mod(fragCoord.y, 8.0));
            threshold = bayer8[y * 8 + x];
          }
          float value = threshold + animBias * (1.0 + 2.0 * trailIntensity);
          return mix(uColorDark, uColorLight, step(value, lum));
        }

        void main() {
          float texAspect   = uTextureSize.x / uTextureSize.y;
          float planeAspect = uPlaneSize.x   / uPlaneSize.y;
          vec2 scale, offset;
          if (texAspect > planeAspect) {
            float s = planeAspect / texAspect;
            scale  = vec2(s, 1.0);
            offset = vec2((1.0 - s) * 0.5, 0.0);
          } else {
            float s = texAspect / planeAspect;
            scale  = vec2(1.0, s);
            offset = vec2(0.0, (1.0 - s) * 0.5);
          }
          vec2 zoomedUv   = vUv / uZoom;
          zoomedUv.y      = 1.0 - (1.0 - vUv.y) / uZoom;
          vec2 coverUv    = zoomedUv * scale + offset;
          vec2 safeUv     = clamp(coverUv, 0.0, 1.0);

          vec2 screenUv        = gl_FragCoord.xy / uResolution.xy;
          float trailIntensity = texture(uTrail, screenUv).r * uTrailIntensityMultiplier;

          vec2 npx     = uPixelSize / uResolution;
          vec2 uvPixel = npx * floor(safeUv / npx);
          vec4 color   = texture(tMap, uvPixel);

          float dynPx  = mix(uPixelSize, uPixelSize * uPixelSizeMultiplier, trailIntensity);
          vec2 ndpx    = dynPx / uResolution;
          vec2 uvDyn   = ndpx * floor(safeUv / ndpx);
          vec4 colLum  = texture(tMap, uvDyn);
          float lum    = dot(vec3(0.2126, 0.7152, 0.0722), colLum.rgb);

          float noise      = cnoise(vec3(safeUv * uBiasNoiseScale, uTime * uBiasNoiseSpeed));
          float pulse      = sin(uTime * uBiasPulseSpeed) * 0.5 + 0.5;
          float animBias   = uBias + (noise * uBiasNoiseWeight + pulse * uBiasPulseWeight) * uBiasAnimationStrength;

          vec3 d           = orderedDither(gl_FragCoord.xy / uScaleResolution, lum, trailIntensity, animBias);
          color.rgb        = d;
          fragColor        = color;
        }`,
    });

    const ditherMesh = new THREE.Mesh(triGeo, ditherMat);
    scene.add(ditherMesh);

    // Load image texture
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(imageUrl, (tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      ditherMat.uniforms.tMap.value = tex;
      ditherMat.uniforms.uTextureSize.value.set(tex.image.width, tex.image.height);
    });

    // Mouse / Trail state
    const ptr = new THREE.Vector2(0.5, 0.5);
    const lastPtr = new THREE.Vector2(0.5, 0.5);
    let velocity = 0;
    const vSmooth = 0.63;
    const vAmp = 48;
    let skipNext = true;
    let mouseInHero = false;

    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = 1 - (e.clientY - r.top) / r.height;
      if (skipNext) {
        lastPtr.set(nx, ny);
        skipNext = false;
      }
      ptr.set(nx, ny);
      mouseInHero = true;
    };
    const onLeave = () => {
      mouseInHero = false;
      skipNext = true;
      velocity = 0;
    };
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);

    function onResize() {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      const dpr = renderer.getPixelRatio();
      renderer.setSize(w, h);
      ditherMat.uniforms.uResolution.value.set(w * dpr, h * dpr);
      ditherMat.uniforms.uPlaneSize.value.set(w, h);
      trailMat.uniforms.uAspect.value = w / h;
      trailRTs.forEach((rt) => rt.setSize(w * dpr, h * dpr));
    }
    onResize();
    window.addEventListener('resize', onResize);

    let rafId;
    function tick(t) {
      rafId = requestAnimationFrame(tick);
      const dt = t * 0.001;
      ditherMat.uniforms.uTime.value = dt;

      const dx = ptr.x - lastPtr.x;
      const dy = ptr.y - lastPtr.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      velocity += (speed - velocity) * vSmooth;
      const v = Math.min(velocity * vAmp, 1.0);

      const currRT = trailRTs[trailIdx];
      const prevRT = trailRTs[trailIdx ^ 1];
      trailMat.uniforms.u_texture.value = prevRT.texture;
      trailMat.uniforms.uPointer.value.copy(ptr);
      trailMat.uniforms.uLastPointer.value.copy(lastPtr);
      trailMat.uniforms.uVelocity.value = mouseInHero ? v : 0;
      trailMat.uniforms.uTime.value = dt;
      lastPtr.copy(ptr);
      renderer.setRenderTarget(currRT);
      renderer.render(trailScene, trailCamera);
      renderer.setRenderTarget(null);
      trailIdx ^= 1;

      ditherMat.uniforms.uTrail.value = currRT.texture;
      renderer.render(scene, camera);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseleave', onLeave);
      trailRTs.forEach((rt) => rt.dispose());
      trailMat.dispose();
      ditherMat.dispose();
      triGeo.dispose();
      renderer.dispose();
    };
  }, [imageUrl]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}