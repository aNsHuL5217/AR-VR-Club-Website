'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import animationData from '@/assets/loading.json'; 

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [animationFinished, setAnimationFinished] = useState(false);
  
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    lottieRef.current?.setSpeed(2.5); 

    const timer = setTimeout(() => {
        setAnimationFinished(true);
        setTimeout(onComplete, 500); 
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 1.5, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      exit={{ 
        scale: 50, 
        opacity: 0, 
        transition: { duration: 0.8, ease: "easeInOut" } 
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#020617', 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformOrigin: 'center center'
      }}
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ 
            opacity: 0, 
            scale: 0.5, 
            transition: { duration: 0.5 } 
        }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        style={{ width: '300px', height: '300px' }}
      >
        <Lottie 
            lottieRef={lottieRef}
            animationData={animationData} 
            loop={true} 
            autoplay={true}
        />
      </motion.div>
    </motion.div>
  );
}