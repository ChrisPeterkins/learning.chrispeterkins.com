// CSS Paint Worklet for creating dynamic checkerboard patterns
class CheckerboardPainter {
  static get inputProperties() {
    return ['--checkerboard-size', '--checkerboard-color1', '--checkerboard-color2'];
  }

  paint(ctx, geom, properties) {
    const size = parseInt(properties.get('--checkerboard-size')) || 20;
    const color1 = properties.get('--checkerboard-color1') || '#ffffff';
    const color2 = properties.get('--checkerboard-color2') || '#000000';

    const numX = Math.ceil(geom.width / size);
    const numY = Math.ceil(geom.height / size);

    for (let y = 0; y < numY; y++) {
      for (let x = 0; x < numX; x++) {
        const color = (x + y) % 2 ? color1 : color2;
        ctx.fillStyle = color;
        ctx.fillRect(x * size, y * size, size, size);
      }
    }
  }
}

registerPaint('checkerboard', CheckerboardPainter);