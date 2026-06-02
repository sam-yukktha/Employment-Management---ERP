import { useEffect, useRef } from "react";
import "./AnimatedBackground.css";

export function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;

    const animate = () => {
      time += 0.01;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#667eea");
      gradient.addColorStop(1, "#764ba2");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw 3D stars
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < 200; i++) {
        // Create stars using sine/cosine
        const angle = (i / 200) * Math.PI * 2 + time;
        const depth = (Math.sin(time + i * 0.1) + 1) / 2;

        const x = centerX + Math.cos(angle) * 200 * depth;
        const y = centerY + Math.sin(angle) * 200 * depth;
        const size = 2 * depth;

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + depth * 0.7})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow
        ctx.strokeStyle = `rgba(102, 200, 255, ${0.2 * depth})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.remove();
    };
  }, []);

  return <canvas ref={canvasRef} className="animated-background-canvas" />;
}
