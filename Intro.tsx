import React from 'react';
import { motion } from 'framer-motion';

interface IntroProps {
  onEnter: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onEnter }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white select-none cursor-default"
    >
      <div className="flex flex-col items-center gap-12">
        {/* Main Title - Prada/Luxury Style */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-4xl md:text-6xl font-bold tracking-[0.2em] text-center"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.1)" }}
        >
          PARI IN TOKYO
        </motion.h1>

        {/* Enter Button - Minimal Tech Label */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          onClick={onEnter}
          className="group relative px-8 py-4 overflow-hidden"
        >
          {/* Text */}
          <span className="relative z-10 font-mono text-xs tracking-[0.4em] text-white/60 group-hover:text-white transition-colors duration-500">
            [ ENTER THE VOID ]
          </span>

          {/* Hover Effect Lines */}
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
          <span className="absolute top-0 left-0 w-full h-[1px] bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center delay-75" />
          
          {/* Subtle Glow */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
        </motion.button>
      </div>

      {/* Footer / Copyright subtle */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-[10px] text-white/20 font-mono tracking-widest"
      >
        TOKYO / 2084 / ARCHIVE
      </motion.div>
    </motion.div>
  );
};