'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { GithubLogoIcon, LinkedinLogoIcon, UserIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr';
import { Tilt } from 'react-tilt';

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

function getRoleColor(role: string) {
  if (role.includes('Faculty')) return 'rgba(234, 179, 8, 0.85)';
  if (role.includes('President') && !role.includes('Vice')) return 'rgba(59, 130, 246, 0.6)';
  if (role.includes('Vice President')) return 'rgba(236, 72, 153, 0.6)';
  if (role.includes('Lead') || role.includes('Head') || role.includes('Manager') || role.includes('Officer')) return 'rgba(139, 92, 246, 0.6)';
  return 'rgba(6, 182, 212, 0.6)';
}

export default function Team() {
  const [showAll, setShowAll] = useState(false);
  const displayMembers = showAll ? [...teamMembers, ...additionalMembers] : teamMembers;

  return (
    <section id="team" className="section container" style={{ position: 'relative' }}>
        <div className="glow-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#3b82f6', opacity: 0.1 }}></div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem' }}>Our Team</h2>

            {/* FACULTY CARD */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                     <FacultyCard member={facultyMember} color={getRoleColor(facultyMember.role)} />
                </div>
            </div>

            {/* MEMBER GRID */}
            <div className="grid-layout">
                {displayMembers.map((member, index) => (
                    <MemberCard key={index} member={member} color={getRoleColor(member.role)} />
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <button onClick={() => setShowAll(!showAll)} className="btn-outline">
                    {showAll ? 'Show Less' : 'View Full Team'}
                </button>
            </div>
        </motion.div>
    </section>
  );
}

function FacultyCard({ member, color }: { member: TeamMember, color: string }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const glowX = useSpring(mouseX, springConfig);
    const glowY = useSpring(mouseY, springConfig);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
        setIsHovered(true);
    }

    const tiltOptions = { reverse: false, max: 10, perspective: 1000, scale: 1.02, speed: 1000, transition: true, axis: null, reset: true, easing: "cubic-bezier(.03,.98,.52,.99)" };

    return (
        <Tilt options={tiltOptions}>
            <div 
                ref={cardRef}
                className="faculty-card"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setIsHovered(false)}
                style={{ borderColor: isHovered ? color : 'rgba(255,255,255,0.1)' }}
            >
                <motion.div
                    style={{
                        position: 'absolute', top: 0, left: 0, x: glowX, y: glowY, translateX: '-50%', translateY: '-50%',
                        width: '250px', height: '250px', background: `radial-gradient(circle closest-side, ${color}, transparent)`,
                        filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none',
                    }}
                    animate={{ opacity: isHovered ? 0.6 : 0 }} 
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={member.image} 
                    alt={member.name} 
                    className="faculty-img"
                    style={{ borderColor: isHovered ? color : 'rgba(255,255,255,0.1)', transition: 'border-color 0.3s' }}
                    onError={(e) => { e.currentTarget.src = 'https://www.w3schools.com/howto/img_avatar.png'; }}
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '0.5rem' }}>{member.name}</h3>
                    <span style={{ color: color.replace('0.6', '1'), fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{member.role}</span>
                </div>
            </div>
        </Tilt>
    )
}

function MemberCard({ member, color }: { member: TeamMember, color: string }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const glowX = useSpring(mouseX, springConfig);
    const glowY = useSpring(mouseY, springConfig);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
        setIsHovered(true);
    }

    const tiltOptions = { reverse: false, max: 10, perspective: 1000, scale: 1.02, speed: 1000, transition: true, axis: null, reset: true, easing: "cubic-bezier(.03,.98,.52,.99)" };

    return (
        <Tilt options={tiltOptions}>
            <div 
                ref={cardRef}
                className="sideways-card" 
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setIsHovered(false)}
                style={{ borderColor: isHovered ? color : 'rgba(255,255,255,0.1)' }}
            >
                <motion.div
                    style={{
                        position: 'absolute', top: 0, left: 0, x: glowX, y: glowY, translateX: '-50%', translateY: '-50%',
                        width: '300px', height: '300px', background: `radial-gradient(circle closest-side, ${color}, transparent)`,
                        filter: 'blur(50px)', zIndex: 0, pointerEvents: 'none',
                    }}
                    animate={{ opacity: isHovered ? 0.8 : 0 }} 
                />
                <img 
                    className="member-img"
                    src={member.image || 'https://www.w3schools.com/howto/img_avatar.png'} 
                    alt={member.name}
                    style={{ borderColor: isHovered ? color : 'rgba(255,255,255,0.1)' }}
                    onError={(e) => { e.currentTarget.src = 'https://www.w3schools.com/howto/img_avatar.png'; }}
                />
                
                <div className="initial-role">
                    <span style={{ 
                        color: color.replace('0.6', '1'), 
                        fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                        display: 'block', marginTop: '10px'
                    }}>
                        {member.role}
                    </span>
                </div>

                <div className="sideways-info">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', lineHeight: '1.2', color: '#f8fafc' }}>{member.name}</h3>
                    <p style={{ color: color.replace('0.6', '1'), fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{member.role}</p>
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noreferrer" className="btn-icon">
                                <LinkedinLogoIcon size={18} color="#cbd5e1" weight="duotone" />
                            </a>
                        )}
                        {member.github && (
                            <a href={member.github} target="_blank" rel="noreferrer" className="btn-icon">
                                <GithubLogoIcon size={18} color="#cbd5e1" weight="duotone" />
                            </a>
                        )}
                        {member.email && (
                            <a href={`mailto:${member.email}`} className="btn-icon">
                                <EnvelopeSimpleIcon size={18} color="#cbd5e1" weight="duotone" />
                            </a>
                        )}
                         {!member.linkedin && !member.github && !member.email && (
                             <div className="btn-icon">
                                <UserIcon size={18} color="#cbd5e1" weight="duotone" />
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </Tilt>
    );
}