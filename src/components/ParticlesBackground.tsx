import React, { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalAlpha: number;
  alpha: number;
}

export default function ParticlesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; px: number; py: number; speed: number }>({
    x: 0,
    y: 0,
    active: false,
    px: 0,
    py: 0,
    speed: 0
  });

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use ResizeObserver for accurate sizing of the canvas inside the stage
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = [];
    const particleCount = Math.min(75, Math.floor((dimensions.width * dimensions.height) / 11000));

    // Dynamic clean colors matching slate & tech accents
    const colors = [
      "rgba(59, 130, 246, ",  // Blue
      "rgba(147, 51, 234, ",  // Purple
      "rgba(16, 185, 129, ",  // Emerald
      "rgba(244, 63, 94, ",   // Rose
      "rgba(115, 115, 115, "  // Neutral/Slate
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.4 + 0.15;
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        originalAlpha: alpha,
        alpha: alpha,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const mouse = mouseRef.current;
      // Fade speed value slightly over time
      mouse.speed *= 0.95;

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Idle movement
        p.x += p.vx;
        p.y += p.vy;

        // Interaction with mouse: attraction/repulsion based on mouse speed
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (dist < maxDist) {
            // Push or pull factor depends on mouse movement speed
            // If mouse moves fast, repel. If mouse is still/slow, attract.
            const force = (maxDist - dist) / maxDist;
            const factor = mouse.speed > 5 ? -1.8 : 0.6;
            
            p.x += (dx / dist) * force * factor;
            p.y += (dy / dist) * force * factor;
            
            // Brighten up when close to mouse
            p.alpha = Math.min(0.8, p.originalAlpha + force * 0.4);
          } else {
            p.alpha = Math.max(p.originalAlpha, p.alpha - 0.01);
          }
        } else {
          p.alpha = Math.max(p.originalAlpha, p.alpha - 0.01);
        }

        // Boundary reflection
        if (p.x < 0 || p.x > dimensions.width) p.vx *= -1;
        if (p.y < 0 || p.y > dimensions.height) p.vy *= -1;

        // Keep inside bounds
        p.x = Math.max(0, Math.min(dimensions.width, p.x));
        p.y = Math.max(0, Math.min(dimensions.height, p.y));

        // Draw particle with speed-induced tail or size shift
        ctx.beginPath();
        const pulseRadius = p.radius + (mouse.active && mouse.speed > 3 ? (Math.sin(Date.now() / 200) * 0.5) : 0);
        ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Connect particles with constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxConnectDist = 100;

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(100, 116, 139, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Connect particles directly to mouse if close
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const alpha = (1 - mdist / 140) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            // Change connect line color based on mouse speed
            const lineColor = mouse.speed > 8 ? "rgba(239, 68, 68, " : "rgba(59, 130, 246, ";
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const mouse = mouseRef.current;
    
    // Calculate movement speed
    const dx = x - mouse.px;
    const dy = y - mouse.py;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    mouse.speed = Math.min(15, distance); // cap max speed calculation
    mouse.px = x;
    mouse.py = y;
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
    mouseRef.current.speed = 0;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
      style={{ overflow: "hidden" }}
      id="particles-container-wrapper"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
        style={{ width: "100%", height: "100%" }}
        id="particles-canvas"
      />
    </div>
  );
}
