'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Rotating wireframe dodecahedron — the "forge ingot"
function ForgeIngot() {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.12;
      meshRef.current.rotation.y = t * 0.18;
    }
    if (edgesRef.current) {
      edgesRef.current.rotation.x = t * 0.12;
      edgesRef.current.rotation.y = t * 0.18;
    }
  });

  const geo = useMemo(() => new THREE.DodecahedronGeometry(1.8, 0), []);
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  return (
    <>
      {/* Solid core — very dim */}
      <mesh ref={meshRef} geometry={geo}>
        <meshStandardMaterial
          color="#ff8c00"
          emissive="#ff4500"
          emissiveIntensity={0.12}
          metalness={0.9}
          roughness={0.6}
          transparent
          opacity={0.08}
        />
      </mesh>
      {/* Wireframe edges */}
      <lineSegments ref={edgesRef} geometry={edgesGeo}>
        <lineBasicMaterial color="#ff8c00" transparent opacity={0.5} />
      </lineSegments>
    </>
  );
}

// Ambient floating particles
function ForgeParticles() {
  const count = 600;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const meshRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial color="#ff8c00" size={0.04} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export function FoundryHero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#ff8c00" />
        <pointLight position={[-5, -5, 3]} intensity={0.5} color="#ff4500" />
        <ForgeIngot />
        <ForgeParticles />
        <Stars radius={80} depth={40} count={2000} factor={3} fade speed={0.5} />
      </Canvas>
      {/* Blend gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
    </div>
  );
}
