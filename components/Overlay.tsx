import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionData, SectionId } from '../types';
import { Globe, Plus, Disc, ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { SECTIONS } from '../constants';

interface OverlayProps {
  currentSection: SectionData;
  onSectionChange: (index: number) => void;
  currentIndex: number;
  isTransitioning?: boolean;
}

// Archive Image Assets
const IMG_SHANGHAI = "https://www.dropbox.com/scl/fi/1odp6gfvxzmv04a48ewak/PHOTO-SHANGHAI-3.png?rlkey=2w74cho8mljef8qxxn3hmiipm&st=3iklpe54&raw=1";
const VID_PARIS = "https://www.dropbox.com/scl/fi/cft3c4danjtkz10z903m2/PARIS-CENTER-VIDEO-LOOP.mp4?rlkey=fl32pn6qwaooe3savmnybvf3l&st=y5sd1xze&raw=1";
const IMG_TOKYO = "https://www.dropbox.com/scl/fi/k6it3rruwy3fy8hbcfpbn/PHOTO-JAPAN-2.png?rlkey=zxqifn5slrqruocvh69c1zl48&st=55a2i62h&raw=1";

export const Overlay: React.FC<OverlayProps> = ({ currentSection, onSectionChange, currentIndex, isTransitioning = false }) => {
  // Audio Logic State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Premier Video State
  const [isPremierVideoActive, setIsPremierVideoActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cleanup audio on unmount or section change
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [currentSection.id]);

  // Cleanup Premier Video when leaving section
  useEffect(() => {
    if (currentSection.id !== SectionId.PREMIER) {
      setIsPremierVideoActive(false);
      // React unmounting the component will pause and remove the video element automatically
    }
  }, [currentSection.id]);

  const startAudio = () => {
    if (audioContextRef.current) return; // Prevent duplicates

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const masterGain = ctx.createGain();
    
    // Initial silence
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    
    // Drone Oscillator (Low Root)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55.0; // A1
    
    // Binaural Beat Oscillator (Theta ~4Hz difference)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 59.0; // 4Hz diff
    
    // High Texture (Subtle)
    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.value = 110.0; // A2
    const osc3Gain = ctx.createGain();
    osc3Gain.gain.value = 0.05;

    // Connections
    osc1.connect(masterGain);
    osc2.connect(masterGain);
    osc3.connect(osc3Gain);
    osc3Gain.connect(masterGain);

    // Start
    osc1.start();
    osc2.start();
    osc3.start();

    // Ramp up volume
    masterGain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 1.2);

    audioContextRef.current = ctx;
    gainNodeRef.current = masterGain;
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;

    // Ramp down
    try {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      setTimeout(() => {
        ctx.close();
        audioContextRef.current = null;
        gainNodeRef.current = null;
        setIsPlaying(false);
      }, 800);
    } catch (e) {
      console.error("Audio cleanup error", e);
      ctx.close(); // Force close if ramp fails
      audioContextRef.current = null;
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    const newIndex = currentIndex === 0 ? SECTIONS.length - 1 : currentIndex - 1;
    onSectionChange(newIndex);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    const newIndex = currentIndex === SECTIONS.length - 1 ? 0 : currentIndex + 1;
    onSectionChange(newIndex);
  };

  // Helper to map UI tab names to actual indices
  const navItems = [
    { label: "CALM ROOM", index: 1 },
    { label: "THE ARCHIVE", index: 0 },
    { label: "PREMIER", index: 2 }
  ];

  const hasDescription = currentSection.subtitle || currentSection.description;
  const isArchive = currentSection.id === SectionId.ARCHIVE;
  const isPremier = currentSection.id === SectionId.PREMIER;
  const isCalm = currentSection.id === SectionId.CALM;

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between p-6 md:p-12 select-none text-xs md:text-sm font-mono tracking-wider ${isTransitioning ? 'pointer-events-none' : 'pointer-events-auto'}`}>
      
      {/* Background Typography */}
      {/* EDIT: Removed Archive title completely. Calm Room title remains. */}
      <div className={`absolute inset-0 flex justify-center overflow-hidden z-[-1] pointer-events-none transition-all duration-500 ${isCalm ? 'items-end pb-32' : 'items-center'}`}>
        <AnimatePresence mode='wait'>
          {!isPremier && !isArchive && (
            <h1 
              key={currentSection.id}
              className="font-display leading-none whitespace-nowrap text-center text-transparent select-none transition-all duration-500"
              style={{ 
                WebkitTextStroke: `1px ${currentSection.colors.accent}`,
                color: 'transparent',
                // Calm: Reduced from 5vw to 4.2vw. Archive is hidden.
                fontSize: isCalm ? '4.2vw' : '10vw',
                opacity: 0.5,
              }}
            >
              {currentSection.title}
            </h1>
          )}
        </AnimatePresence>
      </div>

      {/* Top Bar - Centered */}
      <header className="absolute top-0 left-0 w-full flex flex-col items-center pt-8 md:pt-12 pointer-events-auto z-50">
        <div className="flex flex-col items-center gap-1 group cursor-pointer hover:opacity-80 transition-opacity">
          <span className="font-display text-lg md:text-2xl font-bold tracking-[0.2em]">PARI IN TOKYO</span>
          <span className="text-[10px] md:text-xs tracking-[0.3em] text-white/60 mt-1">PARIS • TOKYO • SHANGHAI</span>
          <span className="text-[9px] tracking-[0.2em] text-white/40">EST.</span>
        </div>
      </header>

      {/* EDIT B: IMMERSE BUTTON (Calm Room Only) */}
      {currentSection.id === SectionId.CALM && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto">
          <button 
            onClick={toggleAudio}
            className={`
              flex items-center justify-center gap-2 px-6 py-2 rounded-full 
              border border-white/20 hover:border-white/50 bg-black/10 backdrop-blur-sm
              transition-all duration-500 group
            `}
          >
             <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/40 group-hover:bg-white'}`}></span>
             <span className="text-[10px] tracking-[0.3em] font-light text-white/80 group-hover:text-white">IMMERSE</span>
          </button>
        </div>
      )}

      {/* Center Navigation Tabs */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-8 pointer-events-auto z-40">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if(!isTransitioning) onSectionChange(item.index);
            }}
            className={`relative px-2 py-1 tracking-widest transition-all duration-300 group
              ${item.label === "CALM ROOM" ? 'text-[0.6rem] md:text-[0.65rem]' : 'text-[10px] md:text-xs'} 
            `}
            style={{ 
              color: currentIndex === item.index ? currentSection.colors.accent : 'rgba(255,255,255,0.3)',
              cursor: isTransitioning ? 'wait' : 'pointer'
            }}
          >
             {item.label}
             {/* Underline indicator */}
             <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-current transform transition-transform duration-300 ${currentIndex === item.index ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`} />
          </button>
        ))}
      </div>

      {/* Central HUD Crosshairs - Conditional Shape */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border border-white/5 transition-all duration-700 ease-in-out
          ${isArchive 
            ? 'w-[95vw] md:w-[920px] h-[340px] md:h-[520px] rounded-none opacity-100' // REMOVED opacity-50 for Archive to allow raw media brightness
            : 'w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full md:rounded-none opacity-50'
          }
        `}
      >
        
        {/* ARCHIVE Triptych - Shanghai | Paris (Video) | Tokyo */}
        {isArchive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center gap-4 md:gap-8 z-10"
          >
             {/* Left: Shanghai (Smaller) */}
             <div className="h-[65%] md:h-[75%] aspect-[3/4] relative overflow-hidden bg-transparent">
                <img 
                  src={IMG_SHANGHAI} 
                  className="w-full h-full object-cover block" 
                  style={{ filter: 'none', opacity: 1, mixBlendMode: 'normal' }}
                  alt="Shanghai" 
                />
             </div>

             {/* Center: Paris (Video) (Larger) */}
             <div className="h-[80%] md:h-[90%] aspect-[3/4] relative z-10 overflow-hidden bg-transparent">
                <video
                  src={VID_PARIS}
                  className="w-full h-full object-cover block"
                  style={{ filter: 'none', opacity: 1, mixBlendMode: 'normal' }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
             </div>

             {/* Right: Tokyo (Smaller) */}
             <div className="h-[65%] md:h-[75%] aspect-[3/4] relative overflow-hidden bg-transparent">
                <img 
                  src={IMG_TOKYO} 
                  className="w-full h-full object-cover block" 
                  style={{ filter: 'none', opacity: 1, mixBlendMode: 'normal' }}
                  alt="Tokyo" 
                />
             </div>
          </motion.div>
        )}

        {/* PREMIER Card - White Rectangle with Video Player */}
        {isPremier && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
             animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
             className="absolute top-1/2 left-1/2 w-[180px] h-[260px] md:w-[280px] md:h-[440px] bg-white z-10 overflow-hidden shadow-2xl pointer-events-auto"
           >
              {!isPremierVideoActive ? (
                // Initial State: Play Button Overlay
                <div 
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer group hover:bg-black/5 transition-colors duration-300"
                  onClick={() => setIsPremierVideoActive(true)}
                >
                  <span className="text-black font-display font-bold text-xl md:text-3xl tracking-widest uppercase mb-6">
                    PREMIER
                  </span>
                  
                  {/* Custom Play Button */}
                  <div className="flex items-center gap-3 px-6 py-2 border border-black/10 bg-white shadow-sm group-hover:bg-black group-hover:text-white transition-all duration-500">
                      <Play size={12} className="fill-current" />
                      <span className="text-[10px] font-mono tracking-[0.3em]">PLAY</span>
                  </div>
                </div>
              ) : (
                // Active State: Video Player
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src="https://www.dropbox.com/scl/fi/08fbg18woxy0dqlp5wf19/PREMIER-PARI-IN-TOKYO.mp4?rlkey=76dq3uev8jgqmic0izxfxitoj&st=xerz020j&raw=1"
                  autoPlay
                  muted
                  playsInline
                  controls
                  loop
                />
              )}
           </motion.div>
        )}

        {/* Corner Brackets - Conditional opacity to match look (Archive uses parent opacity-100, others 50) */}
        <div className={`absolute top-0 left-0 w-4 h-4 border-t border-l ${isArchive ? 'border-white/20' : 'border-white/40'}`}></div>
        <div className={`absolute top-0 right-0 w-4 h-4 border-t border-r ${isArchive ? 'border-white/20' : 'border-white/40'}`}></div>
        <div className={`absolute bottom-0 left-0 w-4 h-4 border-b border-l ${isArchive ? 'border-white/20' : 'border-white/40'}`}></div>
        <div className={`absolute bottom-0 right-0 w-4 h-4 border-b border-r ${isArchive ? 'border-white/20' : 'border-white/40'}`}></div>
        
        {/* Floating Labels near object - HIDDEN for Archive */}
        {!isArchive && (
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={`label-${currentSection.id}`}
              className="absolute -right-12 top-1/4 flex items-center gap-2"
          >
              <div className="w-8 h-[1px] bg-white/30"></div>
              <span style={{ color: currentSection.colors.accent }}>OBJ_0{currentIndex + 1}</span>
          </motion.div>
        )}
      </div>

      {/* Navigation Controls (Left/Right) */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform hidden md:block" onClick={handlePrev}>
         <ChevronLeft size={24} className="text-white/40 hover:text-white" />
      </div>
      <div className="absolute top-1/2 right-6 -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform hidden md:block" onClick={handleNext}>
         <ChevronRight size={24} className="text-white/40 hover:text-white" />
      </div>
      
      {/* Bottom Bar */}
      <footer className="flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-auto mt-auto">
        
        {/* Info Panel - Left - EDIT: Hidden for Premier and Calm view */}
        {(hasDescription && !isPremier && !isCalm) ? (
          <div className={`backdrop-blur-md border-l-2 border-white/20 p-4 relative group hover:border-l-4 transition-all duration-300 ${
            currentSection.id === SectionId.CALM 
              ? 'w-full md:w-auto md:max-w-[220px] scale-90 origin-bottom-left bg-black/20' 
              : 'w-full md:w-1/3 bg-black/40'
          }`}
               style={{ borderColor: currentSection.colors.accent }}>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentSection.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4 }}
              >
                {/* REMOVED SUBTITLE H2 ELEMENT HERE */}
                <p className="text-white/70 text-xs leading-relaxed uppercase">{currentSection.description}</p>
                
                <div className="flex gap-4 mt-4 text-[10px] text-white/40 font-mono">
                  <span className="flex items-center gap-1"><Globe size={10} /> {currentSection.meta.zone}</span>
                  <span className="flex items-center gap-1"><Disc size={10} /> {currentSection.meta.index}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 p-1">
               <Plus size={8} className="text-white/30" />
            </div>
          </div>
        ) : (
          <div className="w-full md:w-1/3 p-4"></div>
        )}

        {/* Right side - Metadata */}
        <div className="flex flex-col items-end gap-2">
           <div className="flex items-center gap-4 text-[10px] font-bold mt-2">
              <span className="bg-white/10 px-2 py-1 rounded text-white/60">{currentSection.meta.status}</span>
              <span style={{ color: currentSection.colors.accent }}>{currentSection.id} VIEW</span>
           </div>
        </div>
      </footer>
    </div>
  );
};
