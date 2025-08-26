import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as dat from 'dat.gui';

let scene, camera, renderer, controls, gui;
let currentModel, mixer, clock;
let animations = [];
let animationEnabled = true;
let wireframeEnabled = false;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);
    
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2, 0);
    
    clock = new THREE.Clock();
    
    setupLights();
    createEnvironment();
    createProceduralModel('robot');
    setupGUI();
    
    window.addEventListener('resize', onWindowResize);
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x00a550, 1, 20);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);
}

function createEnvironment() {
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    scene.add(gridHelper);
}

function createProceduralModel(type) {
    if (currentModel) {
        scene.remove(currentModel);
        if (currentModel.geometry) currentModel.geometry.dispose();
        if (currentModel.material) {
            if (Array.isArray(currentModel.material)) {
                currentModel.material.forEach(m => m.dispose());
            } else {
                currentModel.material.dispose();
            }
        }
    }
    
    const modelGroup = new THREE.Group();
    
    switch(type) {
        case 'robot':
            createRobotModel(modelGroup);
            break;
        case 'vehicle':
            createVehicleModel(modelGroup);
            break;
        case 'character':
            createCharacterModel(modelGroup);
            break;
    }
    
    currentModel = modelGroup;
    scene.add(modelGroup);
    
    createAnimations(modelGroup, type);
}

function createRobotModel(group) {
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00a550,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: wireframeEnabled
    });
    
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(2, 3, 1.5),
        bodyMaterial
    );
    body.position.y = 3;
    body.castShadow = true;
    group.add(body);
    
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        bodyMaterial
    );
    head.position.y = 5.25;
    head.castShadow = true;
    group.add(head);
    
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
    });
    
    const leftEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.15),
        eyeMaterial
    );
    leftEye.position.set(-0.3, 5.25, 0.76);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.15),
        eyeMaterial
    );
    rightEye.position.set(0.3, 5.25, 0.76);
    group.add(rightEye);
    
    const armMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a4a4a,
        roughness: 0.5,
        metalness: 0.7,
        wireframe: wireframeEnabled
    });
    
    const leftArm = new THREE.Group();
    const leftUpperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 2),
        armMaterial
    );
    leftUpperArm.position.set(-1.5, 3.5, 0);
    leftUpperArm.rotation.z = Math.PI / 8;
    leftArm.add(leftUpperArm);
    
    const leftLowerArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 2),
        armMaterial
    );
    leftLowerArm.position.set(-2.2, 2, 0);
    leftArm.add(leftLowerArm);
    group.add(leftArm);
    
    const rightArm = new THREE.Group();
    const rightUpperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 2),
        armMaterial
    );
    rightUpperArm.position.set(1.5, 3.5, 0);
    rightUpperArm.rotation.z = -Math.PI / 8;
    rightArm.add(rightUpperArm);
    
    const rightLowerArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 2),
        armMaterial
    );
    rightLowerArm.position.set(2.2, 2, 0);
    rightArm.add(rightLowerArm);
    group.add(rightArm);
    
    const leftLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 3),
        armMaterial
    );
    leftLeg.position.set(-0.6, 0.5, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 3),
        armMaterial
    );
    rightLeg.position.set(0.6, 0.5, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    
    group.userData = { leftArm, rightArm, head, leftEye, rightEye };
}

function createVehicleModel(group) {
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff6b6b,
        roughness: 0.3,
        metalness: 0.7,
        wireframe: wireframeEnabled
    });
    
    const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(4, 1, 2),
        bodyMaterial
    );
    chassis.position.y = 1;
    chassis.castShadow = true;
    group.add(chassis);
    
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 1.8),
        bodyMaterial
    );
    cabin.position.set(0.5, 2, 0);
    cabin.castShadow = true;
    group.add(cabin);
    
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2,
        wireframe: wireframeEnabled
    });
    
    const wheels = [];
    const wheelPositions = [
        [-1.5, 0.5, 1],
        [-1.5, 0.5, -1],
        [1.5, 0.5, 1],
        [1.5, 0.5, -1]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.3),
            wheelMaterial
        );
        wheel.position.set(...pos);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        group.add(wheel);
        wheels.push(wheel);
    });
    
    const glassMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4ecdc4,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.9
    });
    
    const windshield = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.8),
        glassMaterial
    );
    windshield.position.set(-0.6, 2, 0);
    windshield.rotation.y = Math.PI / 2;
    group.add(windshield);
    
    group.userData = { wheels, chassis, cabin };
}

function createCharacterModel(group) {
    const skinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffdbac,
        roughness: 0.7,
        metalness: 0.1,
        wireframe: wireframeEnabled
    });
    
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        skinMaterial
    );
    head.position.y = 4.5;
    head.castShadow = true;
    group.add(head);
    
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x45b7d1,
        roughness: 0.8,
        metalness: 0.2,
        wireframe: wireframeEnabled
    });
    
    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.4, 2, 8, 16),
        bodyMaterial
    );
    body.position.y = 2.5;
    body.castShadow = true;
    group.add(body);
    
    const leftArm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 1.5, 8, 16),
        skinMaterial
    );
    leftArm.position.set(-0.7, 2.8, 0);
    leftArm.rotation.z = Math.PI / 8;
    leftArm.castShadow = true;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 1.5, 8, 16),
        skinMaterial
    );
    rightArm.position.set(0.7, 2.8, 0);
    rightArm.rotation.z = -Math.PI / 8;
    rightArm.castShadow = true;
    group.add(rightArm);
    
    const pantsMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.9,
        metalness: 0.1,
        wireframe: wireframeEnabled
    });
    
    const leftLeg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.2, 1.5, 8, 16),
        pantsMaterial
    );
    leftLeg.position.set(-0.25, 0.8, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.2, 1.5, 8, 16),
        pantsMaterial
    );
    rightLeg.position.set(0.25, 0.8, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        eyeMaterial
    );
    leftEye.position.set(-0.15, 4.5, 0.45);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(
        new THREE.SphereGeometry(0.05),
        eyeMaterial
    );
    rightEye.position.set(0.15, 4.5, 0.45);
    group.add(rightEye);
    
    group.userData = { head, leftArm, rightArm, leftLeg, rightLeg, body };
}

function createAnimations(model, type) {
    animations = [];
    
    switch(type) {
        case 'robot':
            animations.push({
                update: (time) => {
                    if (model.userData.leftArm) {
                        model.userData.leftArm.rotation.x = Math.sin(time * 2) * 0.5;
                    }
                    if (model.userData.rightArm) {
                        model.userData.rightArm.rotation.x = -Math.sin(time * 2) * 0.5;
                    }
                    if (model.userData.head) {
                        model.userData.head.rotation.y = Math.sin(time) * 0.3;
                    }
                    if (model.userData.leftEye && model.userData.rightEye) {
                        const scale = 1 + Math.sin(time * 10) * 0.1;
                        model.userData.leftEye.scale.set(scale, scale, scale);
                        model.userData.rightEye.scale.set(scale, scale, scale);
                    }
                    model.position.y = Math.sin(time * 2) * 0.1;
                }
            });
            break;
            
        case 'vehicle':
            animations.push({
                update: (time) => {
                    if (model.userData.wheels) {
                        model.userData.wheels.forEach(wheel => {
                            wheel.rotation.x = time * 5;
                        });
                    }
                    model.position.x = Math.sin(time * 0.5) * 5;
                    model.position.z = Math.cos(time * 0.5) * 5;
                    model.rotation.y = -time * 0.5 + Math.PI / 2;
                    
                    if (model.userData.chassis) {
                        model.userData.chassis.rotation.z = Math.sin(time * 3) * 0.02;
                    }
                }
            });
            break;
            
        case 'character':
            animations.push({
                update: (time) => {
                    if (model.userData.leftArm) {
                        model.userData.leftArm.rotation.x = Math.sin(time * 3) * 0.5;
                    }
                    if (model.userData.rightArm) {
                        model.userData.rightArm.rotation.x = -Math.sin(time * 3) * 0.5;
                    }
                    if (model.userData.leftLeg) {
                        model.userData.leftLeg.rotation.x = -Math.sin(time * 3) * 0.3;
                    }
                    if (model.userData.rightLeg) {
                        model.userData.rightLeg.rotation.x = Math.sin(time * 3) * 0.3;
                    }
                    if (model.userData.head) {
                        model.userData.head.rotation.y = Math.sin(time * 2) * 0.2;
                    }
                    model.position.y = Math.abs(Math.sin(time * 3)) * 0.2;
                    model.position.z = time % 10 - 5;
                }
            });
            break;
    }
}

function setupGUI() {
    gui = new dat.GUI();
    
    const modelFolder = gui.addFolder('Model Settings');
    
    const params = {
        rotationSpeed: 0.01,
        scale: 1,
        positionY: 0
    };
    
    modelFolder.add(params, 'rotationSpeed', 0, 0.1).onChange(value => {
        if (currentModel) {
            currentModel.userData.rotationSpeed = value;
        }
    });
    
    modelFolder.add(params, 'scale', 0.5, 2).onChange(value => {
        if (currentModel) {
            currentModel.scale.set(value, value, value);
        }
    });
    
    modelFolder.add(params, 'positionY', -5, 5).onChange(value => {
        if (currentModel) {
            currentModel.position.y = value;
        }
    });
    
    modelFolder.open();
    
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '110px';
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    if (animationEnabled && animations.length > 0) {
        animations.forEach(anim => anim.update(time));
    }
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.loadModel = function(type) {
    createProceduralModel(type);
};

window.toggleAnimation = function() {
    animationEnabled = !animationEnabled;
};

window.toggleWireframe = function() {
    wireframeEnabled = !wireframeEnabled;
    if (currentModel) {
        currentModel.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.wireframe = wireframeEnabled;
            }
        });
    }
};

init();
animate();