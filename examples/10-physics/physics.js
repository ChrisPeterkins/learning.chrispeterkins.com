import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon-es';

let scene, camera, renderer, controls;
let world;
let physicsBodies = [];
let meshes = [];
let gravityEnabled = true;

const objectCountElement = document.getElementById('objectCount');
const gravityStatusElement = document.getElementById('gravityStatus');

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 100);
    
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(10, 10, 20);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 5, 0);
    
    setupPhysics();
    setupLights();
    createEnvironment();
    setupEventListeners();
    
    window.addEventListener('resize', onWindowResize);
}

function setupPhysics() {
    world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0)
    });
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.defaultContactMaterial.contactEquationStiffness = 1e6;
    world.defaultContactMaterial.contactEquationRelaxation = 3;
    
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
            friction: 0.4,
            restitution: 0.3
        }
    );
    world.addContactMaterial(defaultContactMaterial);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
}

function createEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3a7c3a,
        roughness: 0.8
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
        mass: 0,
        shape: groundShape,
        position: new CANNON.Vec3(0, 0, 0)
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);
    
    createWalls();
    
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
}

function createWalls() {
    const wallThickness = 0.5;
    const wallHeight = 10;
    const wallLength = 50;
    
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        transparent: true,
        opacity: 0.3
    });
    
    const walls = [
        { pos: [0, wallHeight/2, -wallLength/2], rot: [0, 0, 0], size: [wallLength, wallHeight, wallThickness] },
        { pos: [0, wallHeight/2, wallLength/2], rot: [0, 0, 0], size: [wallLength, wallHeight, wallThickness] },
        { pos: [-wallLength/2, wallHeight/2, 0], rot: [0, Math.PI/2, 0], size: [wallLength, wallHeight, wallThickness] },
        { pos: [wallLength/2, wallHeight/2, 0], rot: [0, Math.PI/2, 0], size: [wallLength, wallHeight, wallThickness] }
    ];
    
    walls.forEach(wall => {
        const wallGeometry = new THREE.BoxGeometry(...wall.size);
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(...wall.pos);
        wallMesh.rotation.set(...wall.rot);
        wallMesh.receiveShadow = true;
        wallMesh.castShadow = true;
        scene.add(wallMesh);
        
        const wallShape = new CANNON.Box(new CANNON.Vec3(wall.size[0]/2, wall.size[1]/2, wall.size[2]/2));
        const wallBody = new CANNON.Body({
            mass: 0,
            shape: wallShape,
            position: new CANNON.Vec3(...wall.pos)
        });
        wallBody.quaternion.setFromEuler(...wall.rot);
        world.addBody(wallBody);
    });
}

function createBall(position, velocity) {
    const radius = 0.5;
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.3,
        metalness: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        shape: shape,
        position: new CANNON.Vec3(position.x, position.y, position.z),
        velocity: new CANNON.Vec3(velocity.x, velocity.y, velocity.z)
    });
    world.addBody(body);
    
    meshes.push(mesh);
    physicsBodies.push(body);
    
    updateObjectCount();
}

function createBox(position, size = 1) {
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.7,
        metalness: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    const shape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
    const body = new CANNON.Body({
        mass: 1,
        shape: shape,
        position: new CANNON.Vec3(position.x, position.y, position.z)
    });
    world.addBody(body);
    
    meshes.push(mesh);
    physicsBodies.push(body);
    
    updateObjectCount();
}

function setupEventListeners() {
    renderer.domElement.addEventListener('click', onMouseClick);
}

function onMouseClick(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const direction = new THREE.Vector3();
    raycaster.ray.direction.normalize();
    direction.copy(raycaster.ray.direction);
    
    const position = camera.position.clone();
    const velocity = direction.multiplyScalar(20);
    
    createBall(position, velocity);
}

window.dropBall = function() {
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        15,
        (Math.random() - 0.5) * 10
    );
    const velocity = new THREE.Vector3(0, 0, 0);
    createBall(position, velocity);
};

window.dropCube = function() {
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        15,
        (Math.random() - 0.5) * 10
    );
    createBox(position);
};

window.createDominos = function() {
    for (let i = 0; i < 10; i++) {
        const position = new THREE.Vector3(i * 2 - 10, 2, 0);
        const geometry = new THREE.BoxGeometry(0.5, 4, 2);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4ecdc4,
            roughness: 0.7
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        
        const shape = new CANNON.Box(new CANNON.Vec3(0.25, 2, 1));
        const body = new CANNON.Body({
            mass: 0.5,
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        world.addBody(body);
        
        meshes.push(mesh);
        physicsBodies.push(body);
    }
    
    setTimeout(() => {
        if (physicsBodies.length > 0) {
            physicsBodies[physicsBodies.length - 10].applyImpulse(
                new CANNON.Vec3(-5, 0, 0),
                new CANNON.Vec3(0, 2, 0)
            );
        }
    }, 1000);
    
    updateObjectCount();
};

window.createTower = function() {
    const levels = 8;
    const boxSize = 1;
    
    for (let level = 0; level < levels; level++) {
        for (let i = 0; i < 3; i++) {
            const position = new THREE.Vector3(
                (i - 1) * boxSize * 1.01,
                level * boxSize + boxSize/2,
                0
            );
            
            if (level % 2 === 1) {
                position.x = 0;
                position.z = (i - 1) * boxSize * 1.01;
            }
            
            createBox(position, boxSize);
        }
    }
};

window.resetScene = function() {
    meshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    
    physicsBodies.forEach(body => {
        world.removeBody(body);
    });
    
    meshes = [];
    physicsBodies = [];
    
    updateObjectCount();
};

window.toggleGravity = function() {
    gravityEnabled = !gravityEnabled;
    
    if (gravityEnabled) {
        world.gravity.set(0, -9.82, 0);
        gravityStatusElement.textContent = 'ON';
    } else {
        world.gravity.set(0, 0, 0);
        gravityStatusElement.textContent = 'OFF';
    }
};

function updateObjectCount() {
    objectCountElement.textContent = meshes.length;
}

function animate() {
    requestAnimationFrame(animate);
    
    world.step(1/60);
    
    for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        const body = physicsBodies[i];
        
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
        
        if (body.position.y < -10) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            world.removeBody(body);
            
            meshes.splice(i, 1);
            physicsBodies.splice(i, 1);
            i--;
            
            updateObjectCount();
        }
    }
    
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