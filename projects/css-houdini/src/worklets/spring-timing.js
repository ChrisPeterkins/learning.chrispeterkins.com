// CSS Animation Worklet for custom spring timing functions
class SpringTimingWorklet {
  static get inputProperties() {
    return ['--spring-stiffness', '--spring-damping', '--spring-mass'];
  }

  animate(currentTime, effect) {
    const stiffness = parseFloat(effect.getComputedTiming().customProperties.get('--spring-stiffness')) || 100;
    const damping = parseFloat(effect.getComputedTiming().customProperties.get('--spring-damping')) || 10;
    const mass = parseFloat(effect.getComputedTiming().customProperties.get('--spring-mass')) || 1;
    
    const duration = effect.getComputedTiming().duration;
    const progress = currentTime / duration;
    
    // Spring physics calculation
    const omega = Math.sqrt(stiffness / mass);
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
    
    let springProgress;
    
    if (dampingRatio < 1) {
      // Underdamped spring
      const omegaD = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
      springProgress = 1 - Math.exp(-dampingRatio * omega * progress) * 
        (Math.cos(omegaD * progress) + (dampingRatio * omega / omegaD) * Math.sin(omegaD * progress));
    } else if (dampingRatio === 1) {
      // Critically damped
      springProgress = 1 - Math.exp(-omega * progress) * (1 + omega * progress);
    } else {
      // Overdamped
      const r1 = -omega * (dampingRatio + Math.sqrt(dampingRatio * dampingRatio - 1));
      const r2 = -omega * (dampingRatio - Math.sqrt(dampingRatio * dampingRatio - 1));
      springProgress = 1 - (r2 * Math.exp(r1 * progress) - r1 * Math.exp(r2 * progress)) / (r2 - r1);
    }
    
    // Clamp between 0 and 1
    springProgress = Math.max(0, Math.min(1, springProgress));
    
    return springProgress;
  }
}

if ('animationWorklet' in CSS) {
  registerAnimator('spring-timing', SpringTimingWorklet);
}