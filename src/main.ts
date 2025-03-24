import "./style.css";
import * as THREE from "three";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { toggleFullscreen } from "./fullscreen";
import GUI from "lil-gui";

// setup
document.getElementById("app")!.innerHTML = `<canvas id="canvas"/>`;
const gui = new GUI({ title: "Shadows Playground", closeFolders: true });
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const canvas = document.getElementById("canvas")!;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 3, 5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.shadowMap.enabled = true;
const render = () => renderer.render(scene, camera);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const tick = () => {
  window.requestAnimationFrame(tick);
  orbitControls.update();
  render();
};
tick();

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
});
window.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "f":
      toggleFullscreen(renderer.domElement);
  }
});
renderer.domElement.addEventListener("dblclick", () =>
  toggleFullscreen(renderer.domElement)
);

// textures
const textureLoader = new THREE.TextureLoader();
const floorColor = textureLoader.load("./floor/color.webp");
const floorNormal = textureLoader.load("./floor/normal.webp");
const floorARM = textureLoader.load("./floor/arm.webp");
const floorDisplacement = textureLoader.load("./floor/displacement.webp");

const floorTextureRepetition = 3;
floorColor.colorSpace = THREE.SRGBColorSpace;

floorColor.repeat.set(floorTextureRepetition, floorTextureRepetition);
floorColor.wrapS = THREE.RepeatWrapping;
floorColor.wrapT = THREE.RepeatWrapping;
floorNormal.repeat.set(floorTextureRepetition, floorTextureRepetition);
floorNormal.wrapS = THREE.RepeatWrapping;
floorNormal.wrapT = THREE.RepeatWrapping;
floorARM.repeat.set(floorTextureRepetition, floorTextureRepetition);
floorARM.wrapS = THREE.RepeatWrapping;
floorARM.wrapT = THREE.RepeatWrapping;
floorDisplacement.repeat.set(floorTextureRepetition, floorTextureRepetition);
floorDisplacement.wrapS = THREE.RepeatWrapping;
floorDisplacement.wrapT = THREE.RepeatWrapping;

const baseColor = textureLoader.load("./base/color.webp");
const baseNormal = textureLoader.load("./base/normal.webp");
const baseARM = textureLoader.load("./base/arm.webp");

baseColor.colorSpace = THREE.SRGBColorSpace;
const baseTextureRepetitionX = 4;
const baseTextureRepetitionY = 2;

baseColor.repeat.set(baseTextureRepetitionX, baseTextureRepetitionY);
baseColor.wrapS = THREE.RepeatWrapping;
baseColor.wrapT = THREE.RepeatWrapping;
baseNormal.repeat.set(baseTextureRepetitionX, baseTextureRepetitionY);
baseNormal.wrapS = THREE.RepeatWrapping;
baseNormal.wrapT = THREE.RepeatWrapping;
baseARM.repeat.set(baseTextureRepetitionX, baseTextureRepetitionY);
baseARM.wrapS = THREE.RepeatWrapping;
baseARM.wrapT = THREE.RepeatWrapping;

// objects
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 100, 100),
  new THREE.MeshStandardMaterial({
    map: floorColor,
    normalMap: floorNormal,
    aoMap: floorARM,
    roughnessMap: floorARM,
    metalnessMap: floorARM,
    displacementMap: floorDisplacement,
    displacementScale: 0.35,
    displacementBias: -0.3,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.5;

const baseWithGeometries = new THREE.Group();

const base = new THREE.Mesh(
  new THREE.BoxGeometry(6, 2, 4, 1, 1),
  new THREE.MeshStandardMaterial({
    map: baseColor,
    normalMap: baseNormal,
    roughnessMap: baseARM,
    metalnessMap: baseARM,
    aoMap: baseARM,
  })
);
base.castShadow = true;
base.receiveShadow = true;
base.position.y = -1.35;
baseWithGeometries.add(base);

const boxMaterial = new THREE.MeshStandardMaterial({ color: "red" });
const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), boxMaterial);
box.castShadow = true;
box.receiveShadow = true;
box.position.x = -1.5;
box.position.y = 0.15;

const torusMaterial = new THREE.MeshStandardMaterial({ color: "yellow" });
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1), torusMaterial);
torus.castShadow = true;
torus.receiveShadow = true;
torus.position.x = 0;
torus.position.y = 0.15;

const coneMaterial = new THREE.MeshStandardMaterial({ color: "blue" });
const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 6, 1), coneMaterial);
cone.castShadow = true;
cone.receiveShadow = true;
cone.position.x = 1.5;
cone.position.y = 0.15;

baseWithGeometries.add(box, torus, cone);

const ambientLightTweaks = gui.addFolder("Ambient light");
const directionalLightTweaks = gui.addFolder("Directional light");
const spotLightTweaks = gui.addFolder("Spot light");
const pointLightTweaks = gui.addFolder("Point light");

//
//
//
// AMBIENT LIGHT
//
//
//
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
ambientLightTweaks.addColor(ambientLight, "color");
ambientLightTweaks.add(ambientLight, "intensity").min(0).max(2).step(0.01);

//
//
//
// DIRECTIONAL LIGHT
//
//
//
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.castShadow = true;

const directionalLightShadow = {
  mapSize: 1024,
};
directionalLight.shadow.mapSize.set(
  directionalLightShadow.mapSize,
  directionalLightShadow.mapSize
);
directionalLight.shadow.camera.near = 1.5;
directionalLight.shadow.camera.far = 7;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
directionalLightCameraHelper.visible = false;

const directionalLightControls = new TransformControls(
  camera,
  renderer.domElement
);
directionalLightControls.size = 0.5;
directionalLightControls.attach(directionalLight);
directionalLightControls.addEventListener("dragging-changed", (event) => {
  orbitControls.enabled = !event.value;
});
const directionalLightControlsHelper = directionalLightControls.getHelper();
directionalLightControlsHelper.visible = false;
directionalLightControls.enabled = false;

directionalLight.position.set(2, 2, 2);
directionalLightTweaks.addColor(directionalLight, "color");
directionalLightTweaks
  .add(directionalLight, "intensity")
  .min(0)
  .max(8)
  .step(0.01);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
directionalLightHelper.visible = false;
directionalLightTweaks
  .add(directionalLightHelper, "visible")
  .name("show helper");
directionalLightTweaks.add(directionalLight, "castShadow");
directionalLightTweaks
  .add(directionalLightControlsHelper, "visible")
  .name("controls")
  .onChange((value: boolean) => (directionalLightControls.enabled = value));
const directionalLightShadowTweaks = directionalLightTweaks.addFolder("Shadow");
directionalLightShadowTweaks
  .add(directionalLight.shadow, "radius")
  .min(0)
  .max(35)
  .step(0.1);
directionalLightShadowTweaks
  .add(directionalLight.shadow, "intensity")
  .min(0)
  .max(1)
  .step(0.01);
directionalLightShadowTweaks
  .add(directionalLightShadow, "mapSize")
  .options([64, 128, 256, 512, 1024, 2048, 4096, 8192])
  .onChange((value: number) => {
    directionalLight.shadow.mapSize.set(value, value);
    if (directionalLight.shadow.map) directionalLight.shadow.map.dispose();
    directionalLight.shadow.map = null;
    directionalLight.shadow.needsUpdate = true;
  });

const directionalLightCameraTweaks =
  directionalLightTweaks.addFolder("Shadow camera");
directionalLightCameraTweaks
  .add(directionalLightCameraHelper, "visible")
  .name("show helper");

const updateDirectionalLightShadowCamera = () => {
  directionalLight.shadow.camera.updateProjectionMatrix();
  directionalLight.shadow.needsUpdate = true;
  directionalLightCameraHelper.update();
};
directionalLightCameraTweaks
  .add(directionalLight.shadow.camera, "near")
  .min(0.1)
  .max(10)
  .step(0.1)
  .onChange(updateDirectionalLightShadowCamera);
directionalLightCameraTweaks
  .add(directionalLight.shadow.camera, "far")
  .min(0.5)
  .max(20)
  .step(0.1)
  .onChange(updateDirectionalLightShadowCamera);
directionalLightCameraTweaks
  .add(directionalLight.shadow.camera, "top")
  .min(0)
  .max(10)
  .step(0.1)
  .onChange(updateDirectionalLightShadowCamera);
directionalLightCameraTweaks
  .add(directionalLight.shadow.camera, "right")
  .min(0)
  .max(10)
  .step(0.1)
  .onChange(updateDirectionalLightShadowCamera);
directionalLightCameraTweaks
  .add(directionalLight.shadow.camera, "bottom")
  .min(-10)
  .max(0)
  .step(0.1)
  .onChange(updateDirectionalLightShadowCamera);
directionalLightCameraTweaks
  .add(directionalLight.shadow.camera, "left")
  .min(-10)
  .max(0)
  .step(0.1)
  .onChange(updateDirectionalLightShadowCamera);

//
//
//
// SPOT LIGHT
//
//
//
const spotLight = new THREE.SpotLight(0xffffff, 30, 20, Math.PI * 0.2, 0.25);
spotLight.position.set(-5, 3, -1);
spotLight.castShadow = true;
spotLight.shadow.camera.near = 2.5;
spotLight.shadow.camera.far = 10;

const spotLightShadow = {
  mapSize: 512,
};
spotLight.shadow.mapSize.set(spotLightShadow.mapSize, spotLightShadow.mapSize);
spotLight.target.position.copy(torus.position);
spotLightTweaks.addColor(spotLight, "color");
spotLightTweaks.add(spotLight, "intensity").min(0).max(60).step(0.1);
spotLightTweaks.add(spotLight, "distance").min(0.1).max(50).step(0.1);

spotLightTweaks
  .add(spotLight, "angle")
  .min(0)
  .max(Math.PI * 0.5)
  .step(0.1);
spotLightTweaks.add(spotLight, "penumbra").min(0).max(1).step(0.1);

spotLightTweaks.add(spotLight, "decay").min(0).max(5).step(0.1);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
spotLightHelper.visible = false;
spotLightTweaks.add(spotLightHelper, "visible").name("show helper");
spotLightTweaks.add(spotLight, "castShadow");

const spotLightControls = new TransformControls(camera, renderer.domElement);
spotLightControls.attach(spotLight);
spotLightControls.size = 0.35;
spotLightControls.addEventListener("dragging-changed", (event) => {
  orbitControls.enabled = !event.value;
});
const spotLightControlsHelper = spotLightControls.getHelper();
spotLightControlsHelper.visible = false;
spotLightControls.enabled = false;

spotLightTweaks
  .add(spotLightControlsHelper, "visible")
  .name("controls")
  .onChange((value: boolean) => (spotLightControls.enabled = value));

const spotLightTargetControls = new TransformControls(
  camera,
  renderer.domElement
);
spotLightTargetControls.attach(spotLight.target);
spotLightTargetControls.size = 0.35;
spotLightTargetControls.addEventListener("dragging-changed", (event) => {
  orbitControls.enabled = !event.value;
});
const spotLightTargetControlsHelper = spotLightTargetControls.getHelper();
spotLightTargetControlsHelper.visible = false;
spotLightTargetControls.enabled = false;

spotLightTweaks
  .add(spotLightTargetControlsHelper, "visible")
  .name("target controls")
  .onChange((value: boolean) => (spotLightTargetControls.enabled = value));

const spotLightShadowTweaks = spotLightTweaks.addFolder("Shadow");
spotLightShadowTweaks.add(spotLight.shadow, "radius").min(0).max(35).step(0.1);
spotLightShadowTweaks
  .add(spotLight.shadow, "intensity")
  .min(0)
  .max(1)
  .step(0.01);
spotLightShadowTweaks
  .add(spotLightShadow, "mapSize")
  .options([64, 128, 256, 512, 1024, 2048, 4096, 8192])
  .onChange((value: number) => {
    spotLight.shadow.mapSize.set(value, value);
    if (spotLight.shadow.map) spotLight.shadow.map.dispose();
    spotLight.shadow.map = null;
    spotLight.shadow.needsUpdate = true;
  });

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
spotLightCameraHelper.visible = false;
const spotLightCameraTweaks = spotLightTweaks.addFolder("Shadow camera");
spotLightCameraTweaks.add(spotLightCameraHelper, "visible").name("show helper");

const updateSpotLightShadowCamera = () => {
  spotLight.shadow.camera.updateProjectionMatrix();
  spotLight.shadow.needsUpdate = true;
  spotLightCameraHelper.update();
};
spotLightCameraTweaks
  .add(spotLight.shadow.camera, "near")
  .min(0.1)
  .max(10)
  .step(0.1)
  .onChange(updateSpotLightShadowCamera);
spotLightCameraTweaks
  .add(spotLight.shadow.camera, "far")
  .min(0.5)
  .max(20)
  .step(0.1)
  .onChange(updateSpotLightShadowCamera);

//
//
//
// POINT LIGHT
//
//
//
const pointLight = new THREE.PointLight("blue", 50, 8);
pointLight.position.set(1.5, 1.25, 0);
pointLight.castShadow = true;
pointLight.shadow.camera.far = 2;

pointLightTweaks.addColor(pointLight, "color");
pointLightTweaks.add(pointLight, "intensity").min(0).max(100).step(0.1);
pointLightTweaks.add(pointLight, "distance").min(0).max(15).step(0.1);
pointLightTweaks.add(pointLight, "decay").min(0).max(15).step(0.1);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
pointLightHelper.visible = false;
pointLightTweaks.add(pointLightHelper, "visible").name("show helper");
pointLightTweaks.add(pointLight, "castShadow");

const pointLightControls = new TransformControls(camera, renderer.domElement);
pointLightControls.attach(pointLight);
pointLightControls.size = 0.4;
pointLightControls.addEventListener("dragging-changed", (event) => {
  orbitControls.enabled = !event.value;
});
const pointLightControlsHelper = pointLightControls.getHelper();
pointLightControlsHelper.visible = false;
pointLightControls.enabled = false;

pointLightTweaks
  .add(pointLightControlsHelper, "visible")
  .name("controls")
  .onChange((value: boolean) => (pointLightControls.enabled = value));

const pointLightShadowTweaks = pointLightTweaks.addFolder("Shadow");
const pointLightShadow = {
  mapSize: 512,
};
pointLightShadowTweaks
  .add(pointLight.shadow, "radius")
  .min(0)
  .max(35)
  .step(0.1);

pointLightShadowTweaks
  .add(pointLight.shadow, "intensity")
  .min(0)
  .max(1)
  .step(0.01);
pointLightShadowTweaks
  .add(pointLightShadow, "mapSize")
  .options([64, 128, 256, 512, 1024, 2048, 4096, 8192])
  .onChange((value: number) => {
    pointLight.shadow.mapSize.set(value, value);
    if (pointLight.shadow.map) pointLight.shadow.map.dispose();
    pointLight.shadow.map = null;
    pointLight.shadow.needsUpdate = true;
  });

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
pointLightCameraHelper.visible = false;
const pointLightCameraTweaks = pointLightTweaks.addFolder("Shadow camera");
pointLightCameraTweaks
  .add(pointLightCameraHelper, "visible")
  .name("show helper");
const updatePointLightShadowCamera = () => {
  pointLight.shadow.camera.updateProjectionMatrix();
  pointLight.shadow.needsUpdate = true;
  pointLightCameraHelper.update();
};
pointLightCameraTweaks
  .add(pointLight.shadow.camera, "near")
  .min(0.1)
  .max(10)
  .step(0.1)
  .onChange(updatePointLightShadowCamera);
pointLightCameraTweaks
  .add(pointLight.shadow.camera, "far")
  .min(0.5)
  .max(20)
  .step(0.1)
  .onChange(updatePointLightShadowCamera);

scene.add(
  floor,
  baseWithGeometries,
  ambientLight,
  directionalLight,
  directionalLightHelper,
  directionalLightControlsHelper,
  directionalLightCameraHelper,
  spotLight,
  spotLight.target,
  spotLightHelper,
  spotLightControlsHelper,
  spotLightTargetControlsHelper,
  spotLightCameraHelper,
  pointLight,
  pointLightHelper,
  pointLightControlsHelper,
  pointLightCameraHelper
);
