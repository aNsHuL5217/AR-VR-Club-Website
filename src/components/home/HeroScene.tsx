'use client';

import React, { useRef, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, Environment, Html, useProgress, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/headset_tiny.glb';
const MODEL_SCALE = 3.0;
const MAX_SCALE = 5.0;
const ZOOM_SPEED = 0.009;

function Loader() {
  const { progress } = useProgress();
  return <Html center className="text-white font-mono">{progress.toFixed(0)}%</Html>;
}

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    const targetX = -mouse.current.x * 0.1;
    const targetY = mouse.current.y * 0.1;

    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetY, 0.05);
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#60a5fa"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.6}
      />
    </points>
  );
}

function VRHeadsetModel() {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const introProgress = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.side = THREE.DoubleSide;
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.depthWrite = true;
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  const { viewport } = useThree();
  const isMobile = viewport.width < 5;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    introProgress.current = THREE.MathUtils.lerp(introProgress.current, 1, 2.0 * delta);

    const targetX = -mouse.current.x * 0.3;
    const targetY = mouse.current.y * 0.2;
    const introSpin = (1 - introProgress.current) * 2;

    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.1) + introSpin;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetY, 0.1);

    const scrollY = window.scrollY;
    let targetScale = isMobile ? MODEL_SCALE * 0.6 : MODEL_SCALE + (scrollY * ZOOM_SPEED);
    if (targetScale > MAX_SCALE) targetScale = MAX_SCALE;
    const smoothScale = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);

    meshRef.current.scale.setScalar(smoothScale * introProgress.current);
  });

  return (
    <group position={[isMobile ? 0 : 3.5, isMobile ? -1 : 0, 0]}>
      <Center>
        <primitive
          ref={meshRef}
          object={scene}
          scale={0}
          rotation={[0, 0, 0]}
        />
      </Center>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#3b82f6" />
        <spotLight position={[0, 10, 10]} angle={0.5} penumbra={1} intensity={2} color="#8b5cf6" />
        <Environment preset="city" />
        =
        <Particles />

        <Suspense fallback={<Loader />}>
          <VRHeadsetModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_PATH);