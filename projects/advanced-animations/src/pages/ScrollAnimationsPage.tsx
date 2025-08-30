import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ChevronDown, Layers, Zap, Globe, Code, Sparkles, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const ScrollAnimationsPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const splitTextRef = useRef<HTMLDivElement>(null);
  const revealContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Progress bar animation
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      });
    }

    // Hero parallax
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll('[data-speed]');
      elements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-speed') || '1');
        gsap.to(element, {
          y: () => window.innerHeight * speed,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      });
    }

    // Timeline animation
    if (timelineRef.current) {
      const items = timelineRef.current.querySelectorAll('.timeline-item');
      
      items.forEach((item, index) => {
        const isLeft = index % 2 === 0;
        
        gsap.fromTo(item,
          {
            x: isLeft ? -100 : 100,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              end: "top 50%",
              scrub: 1,
              toggleActions: "play none none reverse"
            }
          }
        );

        // Animate the connecting line
        const line = item.querySelector('.timeline-line');
        if (line) {
          gsap.fromTo(line,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 1,
              scrollTrigger: {
                trigger: item,
                start: "top 70%",
                end: "top 40%",
                scrub: 1
              }
            }
          );
        }
      });
    }

    // Cards stagger animation
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll('.scroll-card');
      
      ScrollTrigger.batch(cards, {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            {
              y: 100,
              opacity: 0,
              scale: 0.8,
              rotationX: -30
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotationX: 0,
              duration: 1.2,
              stagger: 0.15,
              ease: "power3.out",
              overwrite: "auto"
            }
          );
        },
        onLeave: (elements) => {
          gsap.to(elements, {
            y: -100,
            opacity: 0,
            scale: 0.8,
            duration: 0.6,
            stagger: 0.15,
            overwrite: "auto"
          });
        },
        onEnterBack: (elements) => {
          gsap.to(elements, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            overwrite: "auto"
          });
        },
        onLeaveBack: (elements) => {
          gsap.to(elements, {
            y: 100,
            opacity: 0,
            scale: 0.8,
            duration: 0.6,
            stagger: 0.15,
            overwrite: "auto"
          });
        }
      });
    }

    // Pinned section with scaling
    if (pinContainerRef.current) {
      const sections = pinContainerRef.current.querySelectorAll('.pin-section');
      
      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=100%",
          pin: true,
          pinSpacing: false,
          onUpdate: (self) => {
            const scale = 1 - (self.progress * 0.1);
            const opacity = 1 - (self.progress * 0.3);
            gsap.set(section, {
              scale: scale,
              opacity: opacity
            });
          }
        });
      });
    }

    // Horizontal scroll
    if (horizontalRef.current) {
      const slides = horizontalRef.current.querySelectorAll('.horizontal-slide');
      const totalWidth = slides.length * 100;

      gsap.to(slides, {
        xPercent: -100 * (slides.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: horizontalRef.current,
          start: "top top",
          end: `+=${totalWidth}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1
        }
      });

      // Animate content within slides
      slides.forEach((slide, index) => {
        const content = slide.querySelector('.slide-content');
        if (content) {
          gsap.fromTo(content,
            { scale: 0.8, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 1,
              scrollTrigger: {
                trigger: horizontalRef.current,
                start: `top+=${index * 25}% top`,
                end: `top+=${(index + 1) * 25}% top`,
                scrub: 1
              }
            }
          );
        }
      });
    }

    // Split text animation
    if (splitTextRef.current) {
      const text = splitTextRef.current.textContent || '';
      const words = text.split(' ');
      splitTextRef.current.innerHTML = words.map(word => 
        `<span class="word">${word}</span>`
      ).join(' ');

      const wordElements = splitTextRef.current.querySelectorAll('.word');
      
      gsap.fromTo(wordElements,
        {
          opacity: 0.1,
          y: 20,
          rotationX: -90
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.02,
          scrollTrigger: {
            trigger: splitTextRef.current,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1
          }
        }
      );
    }

    // Reveal animations
    if (revealContainerRef.current) {
      const reveals = revealContainerRef.current.querySelectorAll('.reveal-element');
      
      reveals.forEach((element) => {
        const direction = element.getAttribute('data-direction') || 'up';
        let fromVars: any = { opacity: 0 };
        
        switch(direction) {
          case 'left':
            fromVars.x = -100;
            break;
          case 'right':
            fromVars.x = 100;
            break;
          case 'down':
            fromVars.y = -100;
            break;
          default:
            fromVars.y = 100;
        }

        gsap.fromTo(element, fromVars,
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              end: "top 65%",
              scrub: 1,
              markers: false
            }
          }
        );
      });
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  const scrollToSection = (selector: string) => {
    gsap.to(window, {
      duration: 1,
      scrollTo: selector,
      ease: "power2.inOut"
    });
  };

  return (
    <div className="scroll-page">
      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div ref={progressBarRef} className="progress-bar" />
      </div>

      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-bg" data-speed="0.5">
          <div className="hero-gradient" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title" data-speed="0.3">
            Scroll-Triggered
            <br />
            <span className="hero-accent">Animations</span>
          </h1>
          <p className="hero-subtitle" data-speed="0.2">
            Experience the power of ScrollTrigger
          </p>
          <button 
            className="hero-cta"
            onClick={() => scrollToSection('#timeline')}
            data-speed="0.1"
          >
            Explore <ChevronDown size={20} />
          </button>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" ref={timelineRef} className="timeline-section">
        <h2 className="section-title">Animation Timeline</h2>
        <div className="timeline-container">
          {[
            { year: '2020', title: 'Project Started', icon: <Zap /> },
            { year: '2021', title: 'First Release', icon: <Code /> },
            { year: '2022', title: 'Global Launch', icon: <Globe /> },
            { year: '2023', title: 'Award Winner', icon: <Sparkles /> }
          ].map((item, index) => (
            <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-line" />
              <div className="timeline-content">
                <div className="timeline-icon">{item.icon}</div>
                <h3>{item.year}</h3>
                <p>{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cards with Batch Animation */}
      <section ref={cardsContainerRef} className="cards-section">
        <h2 className="section-title">Staggered Cards</h2>
        <div className="cards-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="scroll-card">
              <div className="card-icon">
                <Layers size={32} />
              </div>
              <h3>Feature {i + 1}</h3>
              <p>Advanced scroll-triggered animation with stagger effect</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pinned Sections */}
      <div ref={pinContainerRef} className="pin-container">
        {['Innovation', 'Creation', 'Evolution'].map((title, index) => (
          <section key={index} className="pin-section" style={{
            background: `linear-gradient(135deg, 
              hsl(${220 + index * 30}, 70%, 20%), 
              hsl(${240 + index * 30}, 70%, 30%))`
          }}>
            <div className="pin-content">
              <h2 className="pin-title">{title}</h2>
              <p className="pin-description">
                Experience smooth transitions as sections pin and scale
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Horizontal Scroll */}
      <section ref={horizontalRef} className="horizontal-section">
        <div className="horizontal-container">
          {['Discover', 'Create', 'Share', 'Inspire'].map((text, i) => (
            <div key={i} className="horizontal-slide">
              <div className="slide-content">
                <h2>{text}</h2>
                <p>Horizontal scrolling with GSAP</p>
                <ArrowRight size={32} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Split Text */}
      <section className="split-text-section">
        <h2 className="section-title">Word by Word Animation</h2>
        <p ref={splitTextRef} className="split-text">
          Experience the magic of text animations as each word reveals itself 
          with perfect timing and smooth transitions creating an engaging 
          reading experience that captures attention and guides the eye 
          through important content.
        </p>
      </section>

      {/* Reveal Elements */}
      <section ref={revealContainerRef} className="reveal-section">
        <h2 className="section-title">Directional Reveals</h2>
        <div className="reveal-grid">
          <div className="reveal-element" data-direction="left">
            <div className="reveal-card">From Left</div>
          </div>
          <div className="reveal-element" data-direction="up">
            <div className="reveal-card">From Bottom</div>
          </div>
          <div className="reveal-element" data-direction="right">
            <div className="reveal-card">From Right</div>
          </div>
          <div className="reveal-element" data-direction="down">
            <div className="reveal-card">From Top</div>
          </div>
        </div>
      </section>

      <style>{`
        .scroll-page {
          overflow-x: hidden;
        }

        .progress-bar-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #1a5d3a, #0a2f1d);
          transform-origin: left;
          transform: scaleX(0);
        }

        .hero-section {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: -20%;
          z-index: 0;
        }

        .hero-gradient {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, 
            rgba(26, 93, 58, 0.3), 
            rgba(118, 75, 162, 0.2),
            transparent);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1rem;
        }

        .hero-accent {
          background: linear-gradient(90deg, #1a5d3a, #0a2f1d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          opacity: 0.8;
          margin-bottom: 2rem;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          color: var(--text-primary);
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .hero-cta:hover {
          transform: translateY(-2px);
        }

        .timeline-section {
          padding: 8rem 2rem;
          background: var(--bg-primary);
        }

        .timeline-container {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
        }

        .timeline-item {
          position: relative;
          padding: 2rem;
          margin: 2rem 0;
          width: 45%;
        }

        .timeline-item.left {
          left: 0;
        }

        .timeline-item.right {
          left: 55%;
        }

        .timeline-line {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(180deg, transparent, #1a5d3a, transparent);
          left: 50%;
          top: -50px;
          transform-origin: top;
        }

        .timeline-content {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .timeline-icon {
          display: inline-flex;
          padding: 0.5rem;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .cards-section {
          padding: 8rem 2rem;
          background: #f5f5f5;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .scroll-card {
          background: var(--bg-secondary);
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          perspective: 1000px;
        }

        .card-icon {
          display: inline-flex;
          padding: 1rem;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          border-radius: 12px;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .pin-container {
          position: relative;
        }

        .pin-section {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .pin-content {
          text-align: center;
          color: var(--text-primary);
        }

        .pin-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .pin-description {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .horizontal-section {
          height: 100vh;
          overflow: hidden;
        }

        .horizontal-container {
          display: flex;
          height: 100%;
        }

        .horizontal-slide {
          min-width: 100vw;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e, #0f0f1e);
        }

        .slide-content {
          text-align: center;
          color: var(--text-primary);
        }

        .slide-content h2 {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .slide-content p {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          opacity: 0.8;
        }

        .split-text-section {
          padding: 8rem 2rem;
          background: var(--bg-secondary);
        }

        .split-text {
          max-width: 800px;
          margin: 0 auto;
          font-size: 1.8rem;
          line-height: 1.8;
          perspective: 1000px;
        }

        .word {
          display: inline-block;
          margin: 0 0.3em;
          transform-style: preserve-3d;
        }

        .reveal-section {
          padding: 8rem 2rem;
          background: #f5f5f5;
        }

        .reveal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .reveal-card {
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          color: var(--text-primary);
          border-radius: 1rem;
          text-align: center;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .section-title {
          text-align: center;
          font-size: 3rem;
          margin-bottom: 3rem;
          color: var(--text-primary);
        }

        .timeline-section .section-title,
        .pin-section .section-title {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default ScrollAnimationsPage;