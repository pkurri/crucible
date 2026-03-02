"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function MoltenCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} visible args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#ff8c00"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive="#ff4500"
        emissiveIntensity={2}
      />
    </Sphere>
  );
}

export function Core3DVisualizer() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full bg-transparent overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} color="#ff8c00" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#0a0a0a" />
        
        {/* The Animated 3D Core */}
        <MoltenCore />
        
        {/* Dynamic Voxyz-style Starfield */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
        
        {/* Allow slight user rotation via OrbitControls but disable zoom to keep UI scale intact */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      {/* Overlay gradient to blend the 3D scene smoothly into the HTML background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-transparent z-10" />
    </div>
  );
}
