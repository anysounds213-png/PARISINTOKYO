import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { HeroObject } from './HeroObjects';
import { SectionData } from '../types';
import { TransitionState } from '../App';

interface SceneProps {
  currentSection: SectionData;
  transitionState: TransitionState;
}

// Particle System for Transition
const TransitionParticles: React.FC<{ mode: TransitionState, color: string }> = ({ mode, color }) => {
  const count = 3000;
  const pointsRef = useRef<THREE.Points>(null);
  
  // Initial random positions for the "cloud"
  const { positions, velocities, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Sphere distribution
      const r = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Random velocities for explosion
      vel[i * 3] = (Math.random() - 0.5) * 0.2;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

      ph[i] = Math.random() * Math.PI;
    }
    return { positions: pos, velocities: vel, phases: ph };
  }, []);

  // Use a ref to store current simulation positions to avoid re-instantiating arrays
  const currentPositions = useRef(positions.slice());

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    
    // Physics Logic
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      if (mode === 'disintegrating') {
        // EXPLODE OUTWARD with curl/noise feel
        currentPositions.current[ix] += velocities[ix] * (1 + delta * 10) + Math.sin(phases[i] + state.clock.elapsedTime) * 0.01;
        currentPositions.current[iy] += velocities[iy] * (1 + delta * 10) + Math.cos(phases[i] + state.clock.elapsedTime) * 0.01;
        currentPositions.current[iz] += velocities[iz] * (1 + delta * 10);
        
      } else if (mode === 'reforming') {
        // IMPLODE / REFORM to origin
        // Lerp towards 0,0,0 (or original formation)
        // We use a "target" of 0,0,0 loosely here to simulate formation
        
        currentPositions.current[ix] += (0 - currentPositions.current[ix]) * delta * 4;
        currentPositions.current[iy] += (0 - currentPositions.current[iy]) * delta * 4;
        currentPositions.current[iz] += (0 - currentPositions.current[iz]) * delta * 4;
      } else {
        // IDLE - Gentle float
        currentPositions.current[ix] += Math.sin(state.clock.elapsedTime * 0.5 + phases[i]) * 0.002;
        currentPositions.current[iy] += Math.cos(state.clock.elapsedTime * 0.3 + phases[i]) * 0.002;
        currentPositions.current[iz] += Math.sin(state.clock.elapsedTime * 0.2 + phases[i]) * 0.002;
      }
    }

    posAttr.array.set(currentPositions.current);
    posAttr.needsUpdate = true;

    // Rotation for drama
    if (mode === 'reforming') {
        pointsRef.current.rotation.y += delta * 2;
    } else if (mode === 'disintegrating') {
        pointsRef.current.rotation.y += delta * 0.5;
    } else {
        pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  // Opacity Animation based on mode
  // Disintegrate: Fade In quickly then fade out? No, just explode.
  // We control opacity via the material prop below.

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={currentPositions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={mode === 'idle' ? 0 : 0.8} // Hidden when idle, visible during transition
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export const Scene: React.FC<SceneProps> = ({ currentSection, transitionState }) => {
  return (
    <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, toneMappingExposure: 1.5 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={35} />
        
        {/* Responsive lighting based on section */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={currentSection.colors.accent} />
        
        {/* EDIT: Use 'studio' preset for ARCHIVE to avoid street/city reflections, keeping only abstract blue visuals. */}
        <Environment preset={currentSection.id === 'PREMIER' ? 'city' : 'studio'} />
        
        <group position={[0, 0, 0]}>
           {/* Only show object if not fully disintegrated? Or keep it and let particles cover it?
               Let's scale it down during disintegration for effect */}
           <group scale={transitionState === 'disintegrating' ? 0 : transitionState === 'reforming' ? 0 : 1}>
               <HeroObject sectionId={currentSection.id} accentColor={currentSection.colors.accent} />
           </group>
        </group>

        {/* Transition Particles - Always mounted, visibility controlled by prop */}
        <TransitionParticles mode={transitionState} color={currentSection.colors.accent} />

        <ContactShadows 
            position={[0, -1.8, 0]} 
            opacity={0.5} 
            scale={10} 
            blur={2} 
            far={4} 
            color={currentSection.colors.accent}
        />
      </Canvas>
    </div>
  );
};
