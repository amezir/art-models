import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from 'three/addons/objects/Water.js';

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
camera.position.y = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a camera control
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Add event listener for window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
);

// Load texture
const textureLoader = new THREE.TextureLoader();
const artTexture = textureLoader.load('../img/art2-2.png', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
});

// Vertex Shader
const vertexShader = `
varying vec2 vUv;
uniform float u_time;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader
const fragmentShader = `
uniform sampler2D u_texture;
varying vec2 vUv;
uniform float u_brightness;

void main() {
    vec4 color = texture2D(u_texture, vUv);
    if (color.a < 0.1) discard;
    color.rgb *= u_brightness + 2.5;
    gl_FragColor = color;
}
`;

// Create plane with art texture
const planeGeometry = new THREE.PlaneGeometry(10, 7);
const uniforms = {
    u_time: { value: 0.0 },
    u_texture: { value: artTexture }
};

const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    transparent: true
});

const plane = new THREE.Mesh(planeGeometry, shaderMaterial);
plane.position.set(0, 3, 0);
scene.add(plane);

// Create a cube camera
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    encoding: THREE.sRGBEncoding
});
const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
scene.add(cubeCamera);

// Add point light
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 0, 10);
scene.add(light);

// Add ambient light for soft illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
ambientLight.position.set(0, 0, 10);
scene.add(ambientLight);

// Add directional light for better shadowing and illumination
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 20);
scene.add(directionalLight);

// Create a water surface for the ground
const waterGeometry = new THREE.PlaneGeometry(500, 500);
const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: textureLoader.load('https://threejs.org/examples/textures/waternormals.jpg', (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x000000,
    distortionScale: 3,
    fog: scene.fog !== undefined
});
water.rotation.x = -Math.PI / 2;
water.position.set(0, -3.5, 0);
scene.add(water);

function animate() {
    requestAnimationFrame(animate);

    cubeCamera.position.copy(camera.position);
    cubeCamera.update(renderer, scene);

    water.material.uniforms['time'].value += 1.0 / 60.0;

    renderer.render(scene, camera);
}

animate();