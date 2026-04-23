import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import './Hero3D.css';

// ── Single orb ────────────────────────────────────────────────────────────
function Orb({ x, y, size, color, delay = 0 }) {
  const springX = useSpring(x, { stiffness: 60, damping: 20 });
  const springY = useSpring(y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = (e.clientX - centerX) / centerX;
      const dy = (e.clientY - centerY) / centerY;
      springX.set(x + dx * 30);
      springY.set(y + dy * 30);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [x, y, springX, springY]);

  return (
    <motion.div
      className="orb"
      style={{
        left: springX,
        top: springY,
        width: size,
        height: size,
        background: color,
        animationDelay: `${delay}s`,
      }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.6, 0.8, 0.6],
      }}
      transition={{
        scale: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' },
        opacity: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' },
      }}
    />
  );
}

// ── Grid of spheres ────────────────────────────────────────────────────────
function SphereGrid() {
  const gridRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  const rows = 5;
  const cols = 5;
  const total = rows * cols;
  const spheres = Array.from({ length: total }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const baseX = (col / (cols - 1)) * 100;
    const baseY = (row / (rows - 1)) * 100;
    const size = 8 + Math.sin((col + row) * 0.8) * 4;
    const hue = 230 + (col / cols) * 40;
    return { baseX, baseY, size, hue };
  });

  return (
    <div ref={gridRef} className="sphere-grid">
      <motion.div
        className="sphere-inner"
        style={{ rotateX: useTransform(springY, [20, -20], [8, -8]), rotateY: useTransform(springX, [20, -20], [-8, 8]) }}
      >
        {spheres.map((s, i) => (
          <motion.div
            key={i}
            className="sphere"
            style={{
              left: `${s.baseX}%`,
              top: `${s.baseY}%`,
              width: s.size,
              height: s.size,
              background: `hsl(${s.hue}, 70%, 55%)`,
              opacity: 0.3 + (i / total) * 0.5,
            }}
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 3 + (i % 3) * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.12,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ── Floating shapes ────────────────────────────────────────────────────────
function FloatingShapes() {
  const shapes = [
    { x: 15, y: 20, size: 40, color: 'rgba(99,102,241,0.15)', delay: 0 },
    { x: 75, y: 15, size: 60, color: 'rgba(59,130,246,0.12)', delay: 0.5 },
    { x: 60, y: 70, size: 35, color: 'rgba(99,102,241,0.10)', delay: 1 },
    { x: 25, y: 75, size: 50, color: 'rgba(59,130,246,0.08)', delay: 1.5 },
    { x: 85, y: 55, size: 25, color: 'rgba(139,92,246,0.12)', delay: 0.8 },
    { x: 10, y: 50, size: 30, color: 'rgba(99,102,241,0.10)', delay: 1.2 },
  ];

  return (
    <div className="floating-shapes">
      {shapes.map((s, i) => (
        <Orb key={i} x={`${s.x}%`} y={`${s.y}%`} size={s.size} color={s.color} delay={s.delay} />
      ))}
    </div>
  );
}

// ── Main Hero3D section ────────────────────────────────────────────────────
export default function Hero3D({ isFullPage = false }) {
  return (
    <div className={`hero-3d-container ${isFullPage ? 'hero-3d-full' : ''}`}>
      <SphereGrid />
      <FloatingShapes />
    </div>
  );
}