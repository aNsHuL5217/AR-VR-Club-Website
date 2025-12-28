'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Github, Linkedin, User, Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

const facultyMember: TeamMember = {
  name: 'Prof. Shubhangi Ingale',
  role: 'Faculty Coordinator',
  image: 'https://www.w3schools.com/howto/img_avatar.png', 
};

const teamMembers: TeamMember[] = [
  { name: 'Anshul Zilpe', role: 'President', image: '/Assets/Pfp/Anshul_pfp.jpg', linkedin: 'https://www.linkedin.com/in/anshul-zilpe-245b87332/', github: 'https://github.com/aNsHuL5217' },
  { name: 'Snehal Jadhav', role: 'Vice President', image: 'https://www.w3schools.com/w3images/avatar6.png', linkedin: 'https://www.linkedin.com/in/snehal-jadhav-0ab64a321/', github: 'https://github.com/snehaljadhav7317' },
  { name: 'Uday Salathia', role: 'Technical Lead', image: 'https://www.w3schools.com/w3images/avatar5.png', linkedin: 'https://www.linkedin.com/in/uday-salathia-6b13a11b5/', github: 'https://github.com/uday-1602' },
];

const additionalMembers: TeamMember[] = [
  { name: 'Vidhi Gupta', role: 'Management Head', image: 'https://www.w3schools.com/w3images/avatar2.png', linkedin: 'https://www.linkedin.com/in/vidhi-gupta-7b16b0263/' },
  { name: 'Sanjana Rajput', role: 'Project Manager', image: 'https://www.w3schools.com/w3images/avatar3.png' },
  { name: 'Meet Khandelwal', role: 'Research Officer', image: 'https://www.w3schools.com/w3images/avatar4.png' },
  { name: 'Swayam Singh', role: 'Unity Dev Lead', image: 'https://www.w3schools.com/howto/img_avatar.png', linkedin: 'https://www.linkedin.com/in/singhswayam/', github: 'https://github.com/SinghSwayam' },
  { name: 'Soham Mandrekar', role: 'PR Head', image: 'https://www.w3schools.com/w3images/avatar2.png', linkedin: 'https://www.linkedin.com/in/soham-mandrekar-a3b516296/' },
  { name: 'Harshil Kolhe', role: 'Training Co-ord', image: 'https://www.w3schools.com/w3images/avatar5.png' },
  { name: 'Kundan Deshmukh', role: 'Support Services', image: 'https://www.w3schools.com/w3images/avatar5.png' },
];

// Helper to assign colors based on role
function getRoleColor(role: string) {
  if (role.includes('Faculty')) return 'rgba(234, 179, 8, 0.4)'; // Gold
  if (role.includes('President') && !role.includes('Vice')) return 'rgba(59, 130, 246, 0.4)'; // Blue
  if (role.includes('Vice President')) return 'rgba(236, 72, 153, 0.4)'; // Pink
  if (role.includes('Lead') || role.includes('Head') || role.includes('Manager') || role.includes('Officer')) return 'rgba(139, 92, 246, 0.4)'; // Purple
  return 'rgba(6, 182, 212, 0.4)'; // Cyan
}

export default function Team() {
  const [showAll, setShowAll] = useState(false);
  const displayMembers = showAll ? [...teamMembers, ...additionalMembers] : teamMembers;

  return (
    <section id="team" className="section container" style={{ position: 'relative' }}>
        <div className="glow-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#3b82f6', opacity: 0.1 }}></div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem' }}>Our Team</h2>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '100%', maxWidth: '350px' }}>
                     <TeamCard member={facultyMember} color={getRoleColor(facultyMember.role)} isCompact={false} />
                </div>
            </div>

            <div className="grid-layout">
                {displayMembers.map((member, index) => (
                    <TeamCard 
                        key={index} 
                        member={member} 
                        color={getRoleColor(member.role)} 
                        isCompact={true} 
                    />
                ))}
            </div>

            {/* C. VIEW MORE BUTTON */}
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <button onClick={() => setShowAll(!showAll)} className="btn-outline">
                    {showAll ? 'Show Less' : 'View Full Team'}
                </button>
            </div>
        </motion.div>
    </section>
  );
}

function TeamCard({ member, color, isCompact = false }: { member: TeamMember, color: string, isCompact?: boolean }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse Tracking Logic
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

    const padding = isCompact ? '1.5rem 1rem' : '2.5rem 1.5rem';
    const minHeight = isCompact ? '260px' : '320px';
    const imgSize = isCompact ? '80px' : '100px';
    const nameSize = isCompact ? '1.1rem' : '1.25rem';
    const roleSize = isCompact ? '0.75rem' : '0.85rem';

    return (
        <motion.div 
            ref={cardRef}
            className="glass-card"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                textAlign: 'center',
                padding: padding,   
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: minHeight  
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    x: glowX, y: glowY,
                    translateX: '-50%', translateY: '-50%',
                    width: '250px', height: '250px',
                    background: `radial-gradient(circle closest-side, ${color}, transparent)`,
                    filter: 'blur(50px)',
                    zIndex: 0,
                    opacity: 0
                }}
                animate={{ opacity: isHovered ? 0.6 : 0 }}
            />

            <div style={{ position: 'relative', zIndex: 2, marginBottom: isCompact ? '1rem' : '1.5rem' }}>
                <div style={{
                    width: imgSize, height: imgSize, // Dynamic Size
                    borderRadius: '50%',
                    padding: '3px',
                    background: `linear-gradient(135deg, ${color}, transparent)`,
                    boxShadow: `0 0 20px ${color.replace('0.4', '0.2')}`
                }}>
                    <div style={{
                        width: '100%', height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#020617',
                        position: 'relative'
                    }}>
                         {member.image ? (
                            <img 
                                src={member.image} 
                                alt={member.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.setAttribute('style', 'display:flex; width:100%; height:100%; align-items:center; justify-content:center; background:#1e293b');
                                }}
                            />
                         ) : null}
                         
                         <div style={{ 
                             display: member.image ? 'none' : 'flex', 
                             width: '100%', height: '100%', 
                             alignItems: 'center', justifyContent: 'center', 
                             background: '#1e293b' 
                         }}>
                            <User size={isCompact ? 32 : 40} color={color.replace('0.4', '1')} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ fontSize: nameSize, fontWeight: '700', marginBottom: '0.25rem', color: '#f8fafc' }}>{member.name}</h3>
                <span style={{ 
                    fontSize: roleSize, 
                    color: color.replace('0.4', '1'), 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    fontWeight: '600'
                }}>
                    {member.role}
                </span>
            </div>

            <motion.div 
                style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginTop: isCompact ? '1rem' : '1.5rem', 
                    zIndex: 10,
                    height: '24px'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0.5, y: isHovered ? 0 : 5 }}
            >
                {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="btn-icon" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>
                        <Linkedin size={20} />
                    </a>
                )}
                {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" className="btn-icon" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>
                        <Github size={20} />
                    </a>
                )}
                {member.email && (
                    <a href={`mailto:${member.email}`} className="btn-icon" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}>
                        <Mail size={20} />
                    </a>
                )}
            </motion.div>
        </motion.div>
    );
}