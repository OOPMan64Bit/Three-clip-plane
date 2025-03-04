import * as THREE from "three";
import * as OBC from "@thatopen-platform/components-beta";
import * as OBCF from "@thatopen-platform/components-front-beta";
import * as BUI from "@thatopen-platform/ui-beta";

import Stats from "stats.js";
// import { Clipper } from "@thatopen-platform/components-beta";
import { Clipper } from "./Clipper";
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

async function main() {
  // Set up scene

  //
  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);

  const container = document.getElementById("container") as HTMLDivElement;

  const world = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBCF.RendererWith2D
  >();

  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBCF.RendererWith2D(components, container);
  world.camera = new OBC.SimpleCamera(components);

  components.init();

  world.scene.setup();
  // world.camera.three.far = 10000;

  world.scene.three.add(new THREE.AxesHelper());

  world.camera.three.far = 10000;

  // Get fragments model

  // prettier-ignore
  const workerUrl = "./worker.mjs";
  const fragments = components.get(OBC.FragmentsManager);
  fragments.init(workerUrl);

  // LOAD MODEL

  async function loadModel(
    url: string,
    id = url,
    transform = new THREE.Vector3()
  ) {
    const fetched = await fetch(url);
    const buffer = await fetched.arrayBuffer();

    const model = await fragments.core.load(buffer, {
      modelId: id,
      camera: world.camera.three,
    });

    model.getClippingPlanesEvent = () => {
      return Array.from(world.renderer!.three.clippingPlanes) || [];
    };

    model.object.position.add(transform);

    world.scene.three.add(model.object);
  }

  loadModel("/medium_test.frag");

  // Scene update

  world.camera.controls.addEventListener("control", () =>
    fragments.core.update()
  );
  
  const stats = new Stats();
  stats.showPanel(2);
  document.body.append(stats.dom);
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "unset";
  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());

  // Clipping plane system

  const casters = components.get(OBC.Raycasters);
  casters.get(world)

  const clipper = new Clipper(components);
  clipper.enabled = true;


  // Create plane on location
  // const plane = clipper.createFromNormalAndCoplanarPoint(
  //   world,
  //   new THREE.Vector3(),
  //   new THREE.Vector3()
  // )

  // Create plane on click
  let plane;
  container.ondblclick = async () => {
    if (clipper.enabled) {
      plane = await clipper.create(world);
      // Make it invisible
      if(plane) {
        // plane.visible = false;
      }
    }
  };

  //   Create an icon
  //   const iconDiv = document.createElement("div");
  //   iconDiv.style.backgroundColor = "#ffffff";
  //   iconDiv.style.width = "32px";
  //   iconDiv.style.height = "32px";
  //   const icon = new CSS2DObject( iconDiv );
  //   world.scene.three.add( icon );

  // Create a check box
function createCheckbox(label) {
  // Create a new checkbox input element
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = label; // Setting an ID for the checkbox
  checkbox.name = label; // Setting a name for the checkbox
  checkbox.checked = true;
  checkbox.onchange = function (e) {
    plane._controls.showArrow(this.checked);
    console.log(this.checked);
  }
  // Create a label for the checkbox
  const labelElement = document.createElement('label');
  labelElement.htmlFor = label; // Linking label to checkbox
  labelElement.style.color = "white";
  labelElement.appendChild(document.createTextNode(label)); // Set label text

  // Create a container to hold everything
  const container = document.createElement('div');
  container.style.position = "fixed";
  container.style.right = "0px";
  container.style.top = "0px";
  container.appendChild(checkbox);
  container.appendChild(labelElement);
  document.body.append(container);
}

  createCheckbox("show arrow");

}

main();
