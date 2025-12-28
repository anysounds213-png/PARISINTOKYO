import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { Intro } from './components/Intro';
import { SECTIONS } from './constants';

export type TransitionState = 'idle' | 'disintegrating' | 'reforming';

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  
  const currentSection = SECTIONS[currentIndex];

  const handleSectionChange = (index: number) => {
    if (transitionState !== 'idle' || index === currentIndex) return;

    // 1. Trigger Disintegration
    setTransitionState('disintegrating');

    // 2. Wait for disintegration animation (1s)
    setTimeout(() => {
      setCurrentIndex(index);
      setTransitionState('reforming');

      // 3. Wait for reformation animation (1s)
      setTimeout(() => {
        setTransitionState('idle');
      }, 1000);
    }, 1000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] text-white">
      {/* Global CSS Background Layers */}
      <div className="scanlines"></div>
      <div className="bg-grain"></div>
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <Intro key="intro" onEnter={() => setHasEntered(true)} />
        ) : (
          <>
             {/* Dynamic Background Gradient / Vignette */}
            <div 
              className="absolute inset-0 transition-colors duration-1000 ease-in-out pointer-events-none opacity-40"
              style={{
                background: `radial-gradient(circle at center, transparent 0%, ${currentSection.colors.primary} 100%)`
              }}
            />
            
            {/* 3D Scene Layer - Handles the particle physics */}
            <Scene 
              currentSection={currentSection} 
              transitionState={transitionState}
            />

            {/* UI Overlay Layer - Handles DOM disintegration */}
            <motion.div
              className="absolute inset-0 z-20"
              initial={false}
              animate={
                transitionState === 'disintegrating' ? 'disintegrate' :
                transitionState === 'reforming' ? 'reform' : 'idle'
              }
              variants={{
                idle: { 
                  opacity: 1, 
                  scale: 1, 
                  filter: "blur(0px) brightness(1)",
                  transition: { duration: 0.5 } 
                },
                disintegrate: { 
                  opacity: 0, 
                  scale: 1.1, 
                  filter: "blur(20px) brightness(2)",
                  transition: { duration: 0.8, ease: "easeInOut" }
                },
                reform: { 
                  opacity: 1, 
                  scale: 1, 
                  filter: "blur(0px) brightness(1)",
                  transition: { duration: 0.8, ease: "easeOut" } // Smooth landing
                }
              }}
            >
              <Overlay 
                currentSection={currentSection} 
                onSectionChange={handleSectionChange}
                currentIndex={currentIndex}
                isTransitioning={transitionState !== 'idle'}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;