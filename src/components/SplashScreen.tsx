import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const DURATION_MS = 2600;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Canvas particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      radius: number; opacity: number; color: string;
    }> = [];

    const colors = ["#8BCFC6", "#5FA8FF", "#E89CB0", "#E4C16F"];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    const timer = setTimeout(onComplete, DURATION_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: "#050505" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Animated radial blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            left: "10%",
            top: "20%",
            background: "radial-gradient(circle, rgba(139,207,198,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            right: "5%",
            bottom: "10%",
            background: "radial-gradient(circle, rgba(95,168,255,0.08) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Crosshair / Target Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
            <circle cx="24" cy="24" r="14" stroke="rgba(255,255,255,0.20)" strokeWidth="1"/>
            <circle cx="24" cy="24" r="4" fill="#8BCFC6"/>
            <line x1="24" y1="2" x2="24" y2="10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="24" y1="38" x2="24" y2="46" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2" y1="24" x2="10" y2="24" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="38" y1="24" x2="46" y2="24" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.div>

        {/* MUSICK wordmark */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="text-white font-bold tracking-[0.25em] uppercase"
            style={{ fontSize: 28, fontFamily: "'Outfit', sans-serif" }}
          >
            MUSICK
          </span>
          <motion.span
            className="text-white/40 tracking-[0.35em] uppercase"
            style={{ fontSize: 10, fontFamily: "'Inter', sans-serif", letterSpacing: "0.35em" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            Flow with the sound
          </motion.span>
        </motion.div>

        {/* Separator line */}
        <motion.div
          style={{ width: 40, height: 1, background: "rgba(255,255,255,0.15)" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};
