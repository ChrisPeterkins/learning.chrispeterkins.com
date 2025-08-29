// CSS Paint Worklet for procedural noise patterns
class GradientNoisePainter {
  static get inputProperties() {
    return ['--noise-scale', '--noise-seed', '--noise-colors'];
  }

  // Simple noise function (Perlin-like)
  noise(x, y, seed = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
    return n - Math.floor(n);
  }

  // Smooth interpolation
  smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  paint(ctx, geom, properties) {
    const scale = parseFloat(properties.get('--noise-scale')) || 0.01;
    const seed = parseFloat(properties.get('--noise-seed')) || 0;
    const colors = properties.get('--noise-colors')?.toString() || '#ff6b6b,#4ecdc4,#45b7d1,#96ceb4';
    
    const colorArray = colors.split(',').map(c => c.trim());
    const imageData = ctx.createImageData(geom.width, geom.height);
    const data = imageData.data;

    for (let x = 0; x < geom.width; x++) {
      for (let y = 0; y < geom.height; y++) {
        // Generate noise value
        let noiseValue = 0;
        let amplitude = 1;
        let frequency = scale;
        
        // Multiple octaves for more complex noise
        for (let i = 0; i < 4; i++) {
          noiseValue += this.noise(x * frequency, y * frequency, seed + i) * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        noiseValue = (noiseValue + 1) / 2; // Normalize to 0-1
        noiseValue = this.smoothstep(0.2, 0.8, noiseValue);
        
        // Map noise to colors
        const colorIndex = Math.floor(noiseValue * (colorArray.length - 1));
        const nextColorIndex = Math.min(colorIndex + 1, colorArray.length - 1);
        const t = (noiseValue * (colorArray.length - 1)) - colorIndex;
        
        // Simple color interpolation (assuming hex colors)
        const color1 = this.hexToRgb(colorArray[colorIndex]);
        const color2 = this.hexToRgb(colorArray[nextColorIndex]);
        
        const r = Math.round(color1.r + (color2.r - color1.r) * t);
        const g = Math.round(color1.g + (color2.g - color1.g) * t);
        const b = Math.round(color1.b + (color2.b - color1.b) * t);
        
        const index = (y * geom.width + x) * 4;
        data[index] = r;     // R
        data[index + 1] = g; // G
        data[index + 2] = b; // B
        data[index + 3] = 255; // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}

registerPaint('gradient-noise', GradientNoisePainter);