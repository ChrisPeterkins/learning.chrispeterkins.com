import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, camera, renderer, controls;
const geometries = [];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 10);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    createGeometryShowcase();
    
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
    
    window.addEventListener('resize', onWindowResize);
}

function createGeometryShowcase() {
    const geometryTypes = [
        { type: new THREE.BoxGeometry(1, 1, 1), name: 'Box' },
        { type: new THREE.SphereGeometry(0.6, 32, 16), name: 'Sphere' },
        { type: new THREE.ConeGeometry(0.5, 1, 32), name: 'Cone' },
        { type: new THREE.CylinderGeometry(0.5, 0.5, 1, 32), name: 'Cylinder' },
        { type: new THREE.TorusGeometry(0.5, 0.2, 16, 100), name: 'Torus' },
        { type: new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16), name: 'Torus Knot' },
        { type: new THREE.TetrahedronGeometry(0.7), name: 'Tetrahedron' },
        { type: new THREE.OctahedronGeometry(0.6), name: 'Octahedron' },
        { type: new THREE.DodecahedronGeometry(0.6), name: 'Dodecahedron' },
        { type: new THREE.IcosahedronGeometry(0.6), name: 'Icosahedron' },
        { type: new THREE.PlaneGeometry(1, 1), name: 'Plane' },
        { type: new THREE.RingGeometry(0.3, 0.6, 32), name: 'Ring' }
    ];
    
    const colors = [
        0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 
        0x6c5ce7, 0xa29bfe, 0xfd79a8, 0xe17055,
        0x00b894, 0xfdcb6e, 0x0984e3, 0xd63031
    ];
    
    let index = 0;
    for (let x = -3; x <= 3; x += 2) {
        for (let z = -2; z <= 2; z += 2) {
            if (index < geometryTypes.length) {
                const geometry = geometryTypes[index].type;
                const material = new THREE.MeshPhongMaterial({
                    color: colors[index],
                    shininess: 100,
                    specular: 0x222222
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, 1, z);
                mesh.userData.name = geometryTypes[index].name;
                
                scene.add(mesh);
                geometries.push(mesh);
                
                const edges = new THREE.EdgesGeometry(geometry);
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: 0x000000,
                    opacity: 0.2,
                    transparent: true
                });
                const wireframe = new THREE.LineSegments(edges, lineMaterial);
                mesh.add(wireframe);
                
                index++;
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    geometries.forEach((mesh, index) => {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
        
        mesh.position.y = 1 + Math.sin(Date.now() * 0.001 + index) * 0.2;
    });
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animate();