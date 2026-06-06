import { useEffect, useRef } from "react";
import "./AnimatedBackground.css";

export function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    // Track mouse target positions (normalized between -1 and 1)
    const mouse = {
      x: null,
      y: null,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      radius: 180, // Mouse repulsion radius in pixels
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Normalize mouse positions relative to screen center (-1 to 1)
      mouse.targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Color palette mapping based on position in galaxy
    const colors = {
      cyan: "rgba(34, 211, 238, ",
      violet: "rgba(168, 85, 247, ",
      indigo: "rgba(129, 140, 248, ",
      pink: "rgba(244, 114, 182, ",
    };

    const particles = [];
    const particleCount = 160;

    // Build spiral arm galaxy structure
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles across 3 spiral arms
      const armIndex = i % 3;
      const armAngleOffset = (armIndex * 2 * Math.PI) / 3;
      
      // Distance from core (exponential distribution for dense core)
      const distance = Math.pow(Math.random(), 1.5) * 380 + 35;
      
      // Spiral wrap angle
      const spiralAngle = distance * 0.009;
      const angle = armAngleOffset + spiralAngle + (Math.random() - 0.5) * 0.25;

      // Cartesian coordinates (galaxy local coordinate space)
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      // Add height/thickness to the galaxy disk (thicker core, thinner outer rim)
      const maxThickness = Math.max(10, 60 - distance * 0.1);
      const y = (Math.random() - 0.5) * maxThickness;

      // Assign color based on core distance
      let colorPrefix;
      if (distance < 90) {
        colorPrefix = colors.cyan;
      } else if (distance < 200) {
        colorPrefix = Math.random() > 0.4 ? colors.indigo : colors.violet;
      } else {
        colorPrefix = Math.random() > 0.5 ? colors.pink : colors.violet;
      }

      particles.push({
        x,
        y,
        z,
        // Target coordinates to spring back to after repulsion
        targetRadius: distance,
        targetY: y,
        angle,
        baseRadius: Math.random() * 1.5 + 0.8,
        colorPrefix,
        baseAlpha: Math.random() * 0.35 + 0.45,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
        // Speed of galaxy rotation (inner arms spin faster)
        orbitSpeed: (0.002 + Math.random() * 0.0015) * (140 / (distance + 40)),
        // Trailing coordinates history
        history: [],
        maxHistory: 3,
        // Projected 2D screen positions (calculated during draw)
        screenX: 0,
        screenY: 0,
        screenScale: 1,
      });
    }

    // Camera parameters
    let camAngleX = 0; // Pitch
    let camAngleY = 0; // Yaw
    const focalLength = 380;
    const cameraDistance = 550; // Camera distance from core center

    let tick = 0;

    const animate = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep, rich charcoal base
      ctx.fillStyle = "#08080c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 1. Draw animated nebular radial glow behind the galaxy
      const glowScale = 1 + Math.sin(tick * 0.01) * 0.08;
      const glowX = centerX + mouse.currentX * 100;
      const glowY = centerY + mouse.currentY * 100;
      
      const radialGlow = ctx.createRadialGradient(
        glowX, glowY, 10,
        centerX, centerY, Math.max(canvas.width, canvas.height) * 0.75 * glowScale
      );
      radialGlow.addColorStop(0, "rgba(22, 16, 52, 0.72)"); // Deep purple haze
      radialGlow.addColorStop(0.4, "rgba(9, 8, 28, 0.48)");
      radialGlow.addColorStop(1, "#08080c");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Smoothly interpolate mouse positions for parallax and physics
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.06;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.06;

      // Camera tilt based on mouse position
      camAngleX += (mouse.currentY * 0.45 - camAngleX) * 0.06; // Pitch
      camAngleY += (mouse.currentX * 0.45 - camAngleY) * 0.06; // Yaw

      // Pre-calculate camera trigonometric values for speed optimization
      const cosCX = Math.cos(camAngleX);
      const sinCX = Math.sin(camAngleX);
      const cosCY = Math.cos(camAngleY);
      const sinCY = Math.sin(camAngleY);

      // Constant slow rotations of the galaxy around itself
      const autoRotateX = 0.0002;
      const autoRotateZ = 0.0001;

      // 2. Physics update and projection
      particles.forEach((p) => {
        // Orbit update (auto rotation around Y axis in 3D)
        const ry = p.orbitSpeed;
        let cosRY = Math.cos(ry);
        let sinRY = Math.sin(ry);
        let x1 = p.x * cosRY - p.z * sinRY;
        let z1 = p.x * sinRY + p.z * cosRY;
        p.x = x1;
        p.z = z1;

        // Apply a tiny drift around X and Z axes for organic oscillation
        let cosRX = Math.cos(autoRotateX);
        let sinRX = Math.sin(autoRotateX);
        let y2 = p.y * cosRX - p.z * sinRX;
        p.z = p.y * sinRX + p.z * cosRX;
        p.y = y2;

        let cosRZ = Math.cos(autoRotateZ);
        let sinRZ = Math.sin(autoRotateZ);
        let x3 = p.x * cosRZ - p.y * sinRZ;
        p.y = p.x * sinRZ + p.y * cosRZ;
        p.x = x3;

        // Restore orbit parameters if pushed out by mouse interaction
        const currentRadius = Math.sqrt(p.x * p.x + p.z * p.z);
        const radiusDiff = p.targetRadius - currentRadius;
        if (currentRadius > 0) {
          p.x += (p.x / currentRadius) * radiusDiff * 0.015;
          p.z += (p.z / currentRadius) * radiusDiff * 0.015;
        }
        p.y += (p.targetY - p.y) * 0.015;

        // Step 2a. Apply camera transforms to project (x, y, z) into camera space
        // Rotate camera Y (Yaw)
        let cx = p.x * cosCY - p.z * sinCY;
        let cz = p.x * sinCY + p.z * cosCY;
        // Rotate camera X (Pitch)
        let cy = p.y * cosCX - cz * sinCX;
        cz = p.y * sinCX + cz * cosCX;

        // Position camera back along depth
        const projectedZ = cz + cameraDistance;

        // Perspective Projection calculation
        if (projectedZ > 30) {
          const scale = focalLength / projectedZ;
          p.screenX = cx * scale + centerX;
          p.screenY = cy * scale + centerY;
          p.screenScale = scale;
        }

        // Keep track of projected position history for trail rendering
        p.history.push({ x: p.screenX, y: p.screenY, scale: p.screenScale });
        if (p.history.length > p.maxHistory) {
          p.history.shift();
        }

        // Step 2b. Mouse Interactive Repulsion
        // Push particles in screen-space away from mouse, back-propagated into 3D coords
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.screenX - mouse.x;
          const dy = p.screenY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            // Back-project screen repulsion force back into 3D galaxy coordinates
            const scaleMultiplier = projectedZ / focalLength;
            p.x += (dx / (dist || 1)) * force * 1.6 * scaleMultiplier;
            p.y += (dy / (dist || 1)) * force * 1.6 * scaleMultiplier;
          }
        }
      });

      // 3. Draw 3D Connection Mesh Lines (Proximity in 3D Space)
      // To optimize rendering and avoid messy visual clutter, we cap connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.screenScale < 0.2) continue; // Skip far away elements

        let connections = 0;
        for (let j = i + 1; j < particles.length; j++) {
          if (connections >= 2) break; // Maximum 2 connections per node to keep grid neat
          
          const p2 = particles[j];
          if (p2.screenScale < 0.2) continue;

          // Compute exact physical distance in 3D galaxy space
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const distSqr = dx * dx + dy * dy + dz * dz;
          const limitDist = 80;

          if (distSqr < limitDist * limitDist) {
            const dist = Math.sqrt(distSqr);
            const relativeFade = (1 - dist / limitDist);
            const minScale = Math.min(p1.screenScale, p2.screenScale);
            const lineOpacity = relativeFade * 0.16 * minScale;

            ctx.strokeStyle = `rgba(129, 140, 248, ${lineOpacity})`;
            ctx.lineWidth = 0.5 * minScale;
            ctx.beginPath();
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
            connections++;
          }
        }
      }

      // 4. Draw Particles & Trails
      particles.forEach((p) => {
        if (p.screenScale < 0.15) return; // Cull particles too deep in distance

        // Draw trail lines (fading history dots)
        if (p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let i = 1; i < p.history.length; i++) {
            ctx.lineTo(p.history[i].x, p.history[i].y);
          }
          ctx.lineWidth = 0.65 * p.screenScale;
          ctx.strokeStyle = p.colorPrefix + (p.baseAlpha * p.screenScale * 0.22) + ")";
          ctx.stroke();
        }

        // Soft shimmering (twinkling) overlay
        const twinkle = Math.sin(tick * p.twinkleSpeed + p.twinkleOffset) * 0.15;
        const currentAlpha = Math.max(0.1, Math.min(1.0, p.baseAlpha + twinkle)) * p.screenScale;

        const renderRadius = p.baseRadius * p.screenScale;

        // Render particle node
        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, renderRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.colorPrefix + currentAlpha + ")";

        // Enable glowing bloom filter only for closer foreground elements to conserve performance
        if (p.screenScale > 0.8) {
          ctx.shadowColor = p.colorPrefix + "0.85)";
          ctx.shadowBlur = renderRadius * 3.5;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // Clear blur filter state
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="animated-background-canvas" />;
}

