import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SectionId } from '../types';

interface HeroObjectProps {
  sectionId: string;
  accentColor: string;
}

const ArchiveObject: React.FC<{ color: string }> = () => {
  // Empty as requested - no fill, transparent inside crosshairs
  return null;
};

const CalmObject: React.FC<{ color: string }> = ({ color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Breathing scale - Base scale reduced as requested
      const s = 0.8 + Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
      meshRef.current.scale.set(s, s, s);
      meshRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <group scale={0.8}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.3, 64, 64]} />
        <MeshTransmissionMaterial
            backside
            backsideThickness={1}
            thickness={2}
            chromaticAberration={0.4}
            anisotropy={0.5}
            distortion={0.5} // Grain effect
            distortionScale={0.5}
            temporalDistortion={0.1}
            roughness={0.2}
            clearcoat={1}
            color="#f0f0f0"
            ior={1.2}
        />
      </mesh>
    </group>
  );
};

const PremierObject: React.FC<{ color: string }> = () => {
  // Empty as requested - red geometric shape removed
  return null;
};

export const HeroObject: React.FC<HeroObjectProps> = ({ sectionId, accentColor }) => {
  return (
    <Float 
      speed={2} 
      rotationIntensity={0.5} 
      floatIntensity={0.5} 
      floatingRange={[-0.1, 0.1]}
    >
      <group>
        {sectionId === SectionId.ARCHIVE && <ArchiveObject color={accentColor} />}
        {sectionId === SectionId.CALM && <CalmObject color={accentColor} />}
        {sectionId === SectionId.PREMIER && <PremierObject color={accentColor} />}
      </group>
    </Float>
  );
};