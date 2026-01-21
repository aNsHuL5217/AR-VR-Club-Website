'use client';

import React, { useRef } from 'react';
import Navbar from '@/components/common/Navbar';
import EventsList from '@/components/home/EventsList';
import ContactForm from '@/components/home/ContactForm';
import Team from '@/components/home/Team';
import HeroScene from '@/components/home/HeroScene';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { 
  CubeIcon, 
  StackIcon, 
  CpuIcon, 
  GlobeHemisphereWestIcon, 
  MapPinIcon, 
  EnvelopeSimpleIcon, 
  LinkedinLogoIcon, 
  InstagramLogoIcon, 
  CaretDownIcon 
} from '@phosphor-icons/react/dist/ssr';
import { Tilt } from 'react-tilt';
import Preloader from '@/components/common/Preloader';
import { useLoading } from '@/context/LoadingContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function HomePage() {
  const { hasPlayed, setHasPlayed } = useLoading();

  // HERO CARD GLOW LOGIC
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [isHeroHovered, setIsHeroHovered] = React.useState(false);
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const heroGlowX = useSpring(heroMouseX, springConfig);
  const heroGlowY = useSpring(heroMouseY, springConfig);

  function handleHeroMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    heroMouseX.set(clientX - left);
    heroMouseY.set(clientY - top);
    setIsHeroHovered(true);
  }

  return (
    <>
      <AnimatePresence mode='wait'>
        {!hasPlayed ? (
          <Preloader key="preloader" onComplete={() => setHasPlayed(true)} />
        ) : (
          <>
            <Navbar />
            
            {/* HERO SECTION */}
            <header style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeroScene />
              
              <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <motion.div 
                  ref={heroCardRef}
                  initial="hidden" 
                  animate="visible" 
                  variants={fadeInUp}
                  onMouseMove={handleHeroMouseMove}
                  onMouseLeave={() => setIsHeroHovered(false)}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    background: 'rgba(2, 6, 23, 0.75)', 
                    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                    padding: '3rem', borderRadius: '24px',
                    maxWidth: '850px', margin: '0 auto'
                  }}
                >
                    <motion.div
                      style={{
                          position: 'absolute', top: 0, left: 0,
                          x: heroGlowX, y: heroGlowY, translateX: '-50%', translateY: '-50%',
                          width: '250px', height: '250px', 
                          background: `conic-gradient(from 0deg, rgba(59, 130, 246, 0.7), rgba(139, 92, 246, 0.7), rgba(236, 72, 153, 0.7), rgba(6, 182, 212, 0.7), rgba(59, 130, 246, 0.7))`,
                          filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none', borderRadius: '50%',
                      }}
                      animate={{ opacity: isHeroHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                  />

                  <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem', backdropFilter: 'blur(5px)', color: '#60a5fa', fontSize: '0.9rem' }}>
                        🚀 AR/VR Club GHRCEM
                      </div>
                      
                      <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', color: 'var(--text-main)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        BUILDING THE <br /> <span className="text-gradient">METAVERSE</span>
                      </h1>
                      
                      <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                        The dynamic student-led community dedicated to exploring the immersive frontiers of Spatial Computing.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="https://www.linkedin.com/in/ar-vr-club-ghrcem-pune-a4678b287/" className="btn" target="_blank" rel="noopener noreferrer">Join Community</a>
                        <a href="#about" className="btn-outline">Explore More</a>
                      </div>
                  </div>
                </motion.div>
              </div>

              {/* SCROLL DOWN INDICATOR */}
              <motion.div
                initial={{ opacity: 1, y: 0 }} 
                animate={{ y: [0, 10, 0] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, cursor: 'pointer' }}
                onClick={() => { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CaretDownIcon size={24} color="#ffffff" />
                </div>
              </motion.div>
            </header>

            {/* ABOUT SECTION */}
            <section id="about" className="section container">
              <div className="glow-orb" style={{ top: '20%', left: '-10%' }}></div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>Why Join Us?</h2>
                
                <div className="grid-2x2">
                  <AboutCard 
                    icon={<CubeIcon size={32} color="#3b82f6" weight="duotone"/>} 
                    title="Hub for Innovation" 
                    desc="We are a student-led community at GHRCEM dedicated to exploring and building in the cutting-edge worlds of Augmented and Virtual Reality."
                    glowColor="rgba(59, 130, 246, 0.4)" 
                  />
                  <AboutCard 
                    icon={<StackIcon size={32} color="#8b5cf6" weight="duotone"/>} 
                    title="Hands-on Learning" 
                    desc="We bridge the gap between theory and practice by organizing practical workshops, coding jams, and technical seminars on spatial computing."
                    glowColor="rgba(139, 92, 246, 0.4)" 
                  />
                  <AboutCard 
                    icon={<CpuIcon size={32} color="#06b6d4" weight="duotone"/>} 
                    title="Collaborative Dev" 
                    desc="The club provides a platform for designers and developers to team up, share ideas, and create immersive projects for the Metaverse."
                    glowColor="rgba(6, 182, 212, 0.4)" 
                  />
                  <AboutCard 
                    icon={<GlobeHemisphereWestIcon size={32} color="#ec4899" weight="duotone"/>} 
                    title="Future-Ready Skills" 
                    desc="Our mission is to equip students with the industry-relevant skills and tools needed to lead the next generation of digital interaction."
                    glowColor="rgba(236, 72, 153, 0.4)" 
                  />
                </div>
              </motion.div>
            </section>

            <EventsList />
            <Team />

            {/* CONTACT SECTION */}
            <section id="contact" className="section container">
              <div className="glow-orb" style={{ bottom: '20%', right: '-10%', background: '#8b5cf6' }}></div>
              <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem' }}>Get in Touch</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Let&apos;s Build Together</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Have questions about the club, want to collaborate on a project, or just curious about AR/VR?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }}><MapPinIcon size={24} color="#3b82f6" weight="duotone" /></div>
                      <div>
                        <strong style={{ display: 'block' }}>Location</strong>
                        <span style={{ color: '#94a3b8' }}>G H Raisoni College of Engineering and Management ,Gate no.-1200 Domkhel Road, Wagholi ,Pune-412207 ,Maharastra</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }}><EnvelopeSimpleIcon size={24} color="#3b82f6" weight="duotone" /></div>
                      <div>
                        <strong style={{ display: 'block' }}>Email</strong>
                        <a href="mailto:arvr_comp@ghrcem.raisoni.net" style={{ color: '#60a5fa', textDecoration: 'none' }}>arvr_comp@ghrcem.raisoni.net</a>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <a href="https://www.linkedin.com/in/ar-vr-club-ghrcem-pune-a4678b287/" target="_blank" className="btn-outline" style={{ padding: '10px' }}><LinkedinLogoIcon size={24} weight="duotone" /></a>
                      <a href="https://www.instagram.com/arvr_club_ghrcem/" target="_blank" className="btn-outline" style={{ padding: '10px' }}><InstagramLogoIcon size={24} weight="duotone" /></a>
                    </div>
                  </div>
                </div>
                <ContactForm />
              </div>
            </section>

            <footer style={{ padding: '3rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: '#64748b', marginTop: '4rem' }}>
              <p style={{ marginBottom: '0.5rem', color: '#94a3b8' }}><strong>AR/VR Club | Department of Computer Engineering</strong></p>
              <p>G H Raisoni College of Engineering and Management, Pune</p>
              <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}>&copy; 2025 AR/VR Club GHRCEM. All rights reserved.</p>
            </footer>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function AboutCard({ icon, title, desc, glowColor }: { icon: React.ReactNode, title: string, desc: string, glowColor: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
      setIsHovered(true);
  }

  function handleMouseLeave() {
      setIsHovered(false);
  }

  const defaultOptions = {
    reverse: false, max: 10, perspective: 1000, scale: 1.02, speed: 1000, transition: true, axis: null, reset: true, easing: "cubic-bezier(.03,.98,.52,.99)",    
  }

  return (
    <Tilt options={defaultOptions}>
      <div 
        ref={cardRef}
        className="glass-card" 
        style={{ position: 'relative', height: '100%', transformStyle: 'preserve-3d', overflow: 'hidden' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
            style={{
                position: 'absolute', top: 0, left: 0,
                x: glowX, y: glowY, translateX: '-50%', translateY: '-50%',
                width: '300px', height: '300px',
                background: `radial-gradient(circle closest-side, ${glowColor}, transparent)`,
                filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none', borderRadius: '50%',
            }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
        />

        <div style={{ position: 'relative', zIndex: 2, transform: 'translateZ(20px)' }}>
          <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', width: 'fit-content', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
            {icon}
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h3>
          <p style={{ color: '#94a3b8' }}>{desc}</p>
        </div>
      </div>
    </Tilt>
  );
}