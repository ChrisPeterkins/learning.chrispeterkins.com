// CSS Paint Worklet for animated ripple effects
class RipplePainter {
  static get inputProperties() {
    return ['--ripple-color', '--ripple-x', '--ripple-y', '--ripple-size', '--ripple-opacity'];
  }

  paint(ctx, geom, properties) {
    const color = properties.get('--ripple-color').toString() || '#0066cc';
    const x = parseFloat(properties.get('--ripple-x')) || geom.width / 2;
    const y = parseFloat(properties.get('--ripple-y')) || geom.height / 2;
    const size = parseFloat(properties.get('--ripple-size')) || 0;
    const opacity = parseFloat(properties.get('--ripple-opacity')) || 1;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, geom.width, geom.height);
    gradient.addColorStop(0, `${color}22`);
    gradient.addColorStop(1, `${color}44`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, geom.width, geom.height);

    if (size > 0) {
      // Draw ripple effect
      const rippleGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      rippleGradient.addColorStop(0, `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
      rippleGradient.addColorStop(0.7, `${color}${Math.round(opacity * 100).toString(16).padStart(2, '0')}`);
      rippleGradient.addColorStop(1, `${color}00`);
      
      ctx.fillStyle = rippleGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

registerPaint('ripple', RipplePainter);