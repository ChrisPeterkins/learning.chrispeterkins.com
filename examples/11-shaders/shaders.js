import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

let scene, camera, renderer, controls, gui;
let shaderMeshes = [];
let currentShaderType = 'wave';
let clock = new THREE.Clock();

const shaders = {
    wave: {
        vertex: `
            uniform float time;
            uniform float amplitude;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vNormal = normal;
                vPosition = position;
                
                vec3 pos = position;
                float wave = sin(position.x * 2.0 + time) * amplitude;
                wave += sin(position.y * 2.0 + time * 0.8) * amplitude;
                pos.z += wave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragment: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            varying vec3 vNormal;
            
            void main() {
                vec3 color = mix(color1, color2, vUv.y + sin(time) * 0.2);
                float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
                gl_FragColor = vec4(color * intensity, 1.0);
            }
        `
    },
    rainbow: {
        vertex: `
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragment: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            vec3 rainbow(float t) {
                t = fract(t);
                float r = abs(t * 6.0 - 3.0) - 1.0;
                float g = 2.0 - abs(t * 6.0 - 2.0);
                float b = 2.0 - abs(t * 6.0 - 4.0);
                return clamp(vec3(r, g, b), 0.0, 1.0);
            }
            
            void main() {
                float t = vUv.x + vUv.y + time * 0.2;
                vec3 color = rainbow(t);
                gl_FragColor = vec4(color, 1.0);
            }
        `
    },
    dissolve: {
        vertex: `
            varying vec2 vUv;
            
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragment: `
            uniform float time;
            uniform sampler2D noiseTexture;
            uniform vec3 color;
            uniform float dissolveAmount;
            varying vec2 vUv;
            
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            void main() {
                float noise = random(vUv * 10.0 + time * 0.1);
                float dissolve = step(dissolveAmount, noise);
                
                if (dissolve < 0.5) discard;
                
                vec3 edgeColor = vec3(1.0, 0.5, 0.0);
                float edgeWidth = 0.1;
                float edge = smoothstep(dissolveAmount - edgeWidth, dissolveAmount, noise);
                
                vec3 finalColor = mix(color, edgeColor, edge);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `
    },
    hologram: {
        vertex: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vUv = uv;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                vNormal = normalMatrix * normal;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragment: `
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                float stripes = sin(vUv.y * 100.0 + time * 5.0) * 0.5 + 0.5;
                float scanline = sin(vUv.y * 800.0 - time * 10.0) * 0.04 + 0.96;
                
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float fresnel = pow(1.0 - dot(normal, viewDir), 2.0);
                
                vec3 hologramColor = color * stripes * scanline;
                hologramColor += fresnel * color * 2.0;
                
                float alpha = (stripes * 0.5 + 0.5) * (fresnel * 0.8 + 0.2);
                
                gl_FragColor = vec4(hologramColor, alpha);
            }
        `
    },
    energy: {
        vertex: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vNormal = normal;
                vPosition = position;
                
                vec3 pos = position;
                float displacement = sin(position.x * 10.0 + time) * 0.1;
                displacement += sin(position.y * 10.0 + time * 1.5) * 0.1;
                displacement += sin(position.z * 10.0 + time * 2.0) * 0.1;
                pos += normal * displacement;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragment: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            float noise(vec3 p) {
                return sin(p.x * 10.0) * sin(p.y * 10.0) * sin(p.z * 10.0);
            }
            
            void main() {
                float n = noise(vPosition * 5.0 + time);
                vec3 color = mix(color1, color2, n * 0.5 + 0.5);
                
                float pulse = sin(time * 3.0) * 0.5 + 0.5;
                color *= 1.0 + pulse * 0.5;
                
                float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
                color += rim * color2 * 2.0;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `
    }
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 10);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    setupLights();
    createShaderObjects();
    setupGUI();
    
    window.addEventListener('resize', onWindowResize);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
}

function createShaderMaterial(shaderType) {
    const shader = shaders[shaderType];
    const uniforms = {
        time: { value: 0 },
        color: { value: new THREE.Color(0x00a550) },
        color1: { value: new THREE.Color(0x00a550) },
        color2: { value: new THREE.Color(0xff6b6b) },
        amplitude: { value: 0.3 },
        dissolveAmount: { value: 0.5 },
        noiseTexture: { value: null }
    };
    
    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertex,
        fragmentShader: shader.fragment,
        transparent: shaderType === 'hologram',
        side: THREE.DoubleSide
    });
}

function createShaderObjects() {
    clearShaderMeshes();
    
    const geometries = [
        new THREE.PlaneGeometry(4, 4, 64, 64),
        new THREE.SphereGeometry(1.5, 64, 64),
        new THREE.TorusKnotGeometry(1, 0.3, 128, 32)
    ];
    
    geometries.forEach((geometry, index) => {
        const material = createShaderMaterial(currentShaderType);
        const mesh = new THREE.Mesh(geometry, material);
        
        const x = (index - 1) * 4;
        mesh.position.set(x, 0, 0);
        
        scene.add(mesh);
        shaderMeshes.push(mesh);
    });
    
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00a550,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    shaderMeshes.push(particles);
}

function clearShaderMeshes() {
    shaderMeshes.forEach(mesh => {
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
            } else {
                mesh.material.dispose();
            }
        }
    });
    shaderMeshes = [];
}

function setupGUI() {
    gui = new dat.GUI();
    
    const shaderFolder = gui.addFolder('Shader Parameters');
    
    const params = {
        amplitude: 0.3,
        speed: 1.0,
        color1: '#667eea',
        color2: '#ff6b6b',
        dissolveAmount: 0.5
    };
    
    shaderFolder.add(params, 'amplitude', 0, 1).onChange(value => {
        shaderMeshes.forEach(mesh => {
            if (mesh.material && mesh.material.uniforms && mesh.material.uniforms.amplitude) {
                mesh.material.uniforms.amplitude.value = value;
            }
        });
    });
    
    shaderFolder.add(params, 'speed', 0, 5);
    
    shaderFolder.addColor(params, 'color1').onChange(value => {
        const color = new THREE.Color(value);
        shaderMeshes.forEach(mesh => {
            if (mesh.material && mesh.material.uniforms) {
                if (mesh.material.uniforms.color1) {
                    mesh.material.uniforms.color1.value = color;
                }
                if (mesh.material.uniforms.color) {
                    mesh.material.uniforms.color.value = color;
                }
            }
        });
    });
    
    shaderFolder.addColor(params, 'color2').onChange(value => {
        const color = new THREE.Color(value);
        shaderMeshes.forEach(mesh => {
            if (mesh.material && mesh.material.uniforms && mesh.material.uniforms.color2) {
                mesh.material.uniforms.color2.value = color;
            }
        });
    });
    
    shaderFolder.add(params, 'dissolveAmount', 0, 1).onChange(value => {
        shaderMeshes.forEach(mesh => {
            if (mesh.material && mesh.material.uniforms && mesh.material.uniforms.dissolveAmount) {
                mesh.material.uniforms.dissolveAmount.value = value;
            }
        });
    });
    
    shaderFolder.open();
    
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '110px';
    
    gui.userData = params;
}

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    const speed = gui && gui.userData ? gui.userData.speed : 1;
    
    shaderMeshes.forEach((mesh, index) => {
        if (mesh.material && mesh.material.uniforms && mesh.material.uniforms.time) {
            mesh.material.uniforms.time.value = elapsedTime * speed;
        }
        
        if (mesh.type !== 'Points') {
            mesh.rotation.y = elapsedTime * 0.2;
            
            if (currentShaderType === 'dissolve') {
                const dissolve = Math.sin(elapsedTime * 0.5) * 0.5 + 0.5;
                if (mesh.material.uniforms.dissolveAmount) {
                    mesh.material.uniforms.dissolveAmount.value = dissolve;
                }
            }
        } else {
            mesh.rotation.y = elapsedTime * 0.1;
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.switchShader = function(type) {
    currentShaderType = type;
    createShaderObjects();
    
    document.querySelectorAll('.shader-controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
};

init();
animate();