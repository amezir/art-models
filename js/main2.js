import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a camera control
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Add event listener for window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
);

// Load textures
const textureLoader = new THREE.TextureLoader();
const textures = [
    textureLoader.load(''),
    textureLoader.load('../img/art1.png'),
    textureLoader.load('../img/art2.png'),
    textureLoader.load('../img/art3.png'),
    textureLoader.load('../img/art4.png'),
    textureLoader.load('../img/art5.png'),
    textureLoader.load('../img/art6.png')
];
const texture_portal = textureLoader.load('../img/portal.png');
const texture_portal2 = textureLoader.load('../img/portal2.png');
const fond = textureLoader.load('../img/fond.png');
const art = textureLoader.load('../img/art.jpg');
art.wrapS = THREE.RepeatWrapping;
art.wrapT = THREE.RepeatWrapping;
art.colorSpace = THREE.SRGBColorSpace;
art.needsUpdate = true;

textures.forEach(texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.repeat.set(2, 2);
    texture.needsUpdate = true;
});

// Vertex Shader with Wave Effect and Noise
const vertexShader = `
varying vec2 vUv;
uniform float u_time;
uniform float u_offset;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, 
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), 
                          dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z += snoise(uv * 10.0 + u_time * 0.5 + u_offset) * 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Fragment Shader without Wave Effect
const fragmentShader = `
uniform sampler2D u_texture;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(u_texture, vUv);
    if (color.a < 0.1) discard;
    gl_FragColor = color;
}
`;

// Create planes with different textures
const planes = [];
const planeGeometry = new THREE.PlaneGeometry(5, 7);

const uniforms = {
    u_mouse: { value: new THREE.Vector2() },
    u_time: { value: 0.0 }
};

textures.forEach((texture, index) => {
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_texture: { value: texture },
            u_mouse: uniforms.u_mouse,
            u_time: uniforms.u_time,
            u_offset: { value: Math.random() * 1000 } 
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
        transparent: true
    });

    const plane = new THREE.Mesh(planeGeometry, shaderMaterial);
    plane.position.z = -index * 2;
    plane.scale.set(1.5, 1.5, 1.5);
    scene.add(plane);
    planes.push(plane);
});

// Create a light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 10);
scene.add(light);

// Create a cube with one transparent face and white interior
const cubeGeometry = new THREE.BoxGeometry(30, 30, 30);
const cubeMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
];
const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
cube.position.set(0, 0, 0);
cube.position.z = -1;
scene.add(cube);

// Create a cube camera
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    encoding: THREE.sRGBEncoding
});
const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
scene.add(cubeCamera);

// Create a white interior for the cube
const interiorMaterial = [
    new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture, side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture, side: THREE.BackSide })
];
const interiorCube = new THREE.Mesh(cubeGeometry, interiorMaterial);
interiorCube.position.set(0, 0, 0);
interiorCube.position.z = -1;
scene.add(interiorCube);

// Camera control variables
let moveForward = false;
let moveBackward = false;
let zoomIn = false;
let zoomOut = false;

// Zoom limits
const minZoom = -15;
const maxZoom = 75;
const minFov = 20;
const maxFov = 100;

// Event listeners for keyboard controls
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyZ':
            zoomIn = true;
            break;
        case 'KeyX':
            zoomOut = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyZ':
            zoomIn = false;
            break;
        case 'KeyX':
            zoomOut = false;
            break;
    }
});

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    if (moveForward) camera.position.z = Math.max(camera.position.z - 0.5, minZoom);
    if (moveBackward) camera.position.z = Math.min(camera.position.z + 0.5, maxZoom);
    if (zoomIn) camera.fov = Math.max(camera.fov - 0.5, minFov);
    if (zoomOut) camera.fov = Math.min(camera.fov + 0.5, maxFov);

    uniforms.u_time.value += 0.05;

    // Update cube camera
    cube.visible = false;
    cubeCamera.position.copy(interiorCube.position);
    cubeCamera.update(renderer, scene);
    cube.visible = true;

    camera.updateProjectionMatrix();

    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
}

animate();