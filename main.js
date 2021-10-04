import './style.css';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

// CREATE CONTROL PANNEL
const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  }
};

const { plane } = world;
const randomValues = [];

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments);

  // Need to call again inside onChange func
  const vertices = planeMesh.geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 1) {
    if (i % 3 === 0) {
      const x =  vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
  
      vertices[i] = x + (Math.random() - 0.5) * 3;
      vertices[i + 1] = y + (Math.random() - 0.5) * 3;
      vertices[i + 2] = z + (Math.random() - 0.5) * 3;
    }
    randomValues.push(Math.random() * Math.PI * 2);
  }
  
  // Setting randomValues and originPosition to use later for the move animation.
  planeMesh.geometry.attributes.position.
    randomValues = randomValues;
  planeMesh.geometry.attributes.position.
    originalPosition = planeMesh.geometry.attributes.position.array

  // Color attributes.
  const colors = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }
  // Floate32Array represents rba
  planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
}

gui.add(world.plane, 'width', 1, 600).onChange(generatePlane);
gui.add(world.plane, 'height', 1, 600).onChange(generatePlane);
gui.add(world.plane, 'widthSegments', 1, 1000).onChange(generatePlane);
gui.add(world.plane, 'heightSegments', 1, 1000).onChange(generatePlane);

//Raycaster - easy way to understand: "a laser that points to were the mouse is relative to the scene";
const raycaster = new THREE.Raycaster();





// THREE.JS COMMOM SETUP

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGL1Renderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

document.body.appendChild(renderer.domElement);

// Orbit controls
let controls = new OrbitControls(camera, renderer.domElement);


// Geometries
const planeGeometry = new THREE.PlaneGeometry(plane.width, plane.height, plane.widthSegments, plane.heightSegments);
const planeMaterial = new THREE.MeshPhongMaterial({
  // color: 0xff0000,
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
camera.position.z = 50;

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1);
scene.add(light);

// Back Light
const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

// Getting to the vertices and randomization it
const vertices = planeMesh.geometry.attributes.position.array;
for (let i = 0; i < vertices.length; i += 1) {
  if (i % 3 === 0) {
    const x =  vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];

    vertices[i] = x + (Math.random() - 0.5) * 3;
    vertices[i + 1] = y + (Math.random() - 0.5) * 3;
    vertices[i + 2] = z + (Math.random() - 0.5) * 3;
  }
  randomValues.push(Math.random() - 0.5);
}

// Setting randomValues and originPosition to use later for the move animation.
planeMesh.geometry.attributes.position.
  randomValues = randomValues;
planeMesh.geometry.attributes.position.
  originalPosition = planeMesh.geometry.attributes.position.array

generatePlane();

// TRACK MOUSE POSITION
const mouse = {
  x: undefined,
  y: undefined,
};

let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  // Move animation at the vertices
  frame += 0.01;
  const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    // X coordinate
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.001;

    // Y coordinate
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.001;
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  raycaster.setFromCamera(mouse, camera);
  // What object to make interaction
  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    // Change color of each individual vertex
    // console.log(intersects[0].face);
    const { color } = intersects[0].object.geometry.attributes;

    // VERTICE 1
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    // VERTICE 2
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    // VERTICE 3
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    // Animate hover back to its original color with gsap.
    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };
  
    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        // VERTICE 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        // VERTICE 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        // VERTICE 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
        color.needsUpdate = true;
      },
    });

    color.needsUpdate = true;
  }

}

animate();

// HOVER EFFECT
addEventListener('mousemove', (e) => {
  // Math operation to the center of the page be equals 0
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
});
