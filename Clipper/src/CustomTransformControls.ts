import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

class CustomTransformControls extends TransformControls {
  
  constructor(camera, domElement) {
      super(camera, domElement);
      this.addEventListener("mouseDown", this.onMouseDownEvent);
      this.addEventListener("mouseUp", this.onMouseUpEvent);
  }

  private newIcon() {
    const iconDiv = document.createElement("div");
    iconDiv.style.backgroundColor = "#ffffff";
    iconDiv.style.width = "32px";
    iconDiv.style.height = "32px";
    iconDiv.style.borderRadius = "50%";
    iconDiv.style.cursor = "pointer";
    iconDiv.style.border = "1px solid gray";
    iconDiv.style.background = "#FFF";
    iconDiv.style.textAlign = "center";
    iconDiv.style.lineHeight = "32px";
    iconDiv.innerHTML="&#x2702";
    const icon = new CSS2DObject( iconDiv );
    this._iconDiv = iconDiv;
    return icon;
  }

  attach( object ) {
    super.attach(object);
    object.add(this.newIcon());
		return this;
	}

  isOverIcon ( pointer ) {

    const rtDom = this.domElement.getBoundingClientRect();
    const clientX = (pointer.x+1)/2*rtDom.width+rtDom.left;
    const clientY = -(pointer.y-1)/2*rtDom.height+rtDom.top;

    const rect = this._iconDiv.getBoundingClientRect();
    const isHovering = clientX >= rect.left &&
                        clientX <= rect.right &&
                        clientY >= rect.top &&
                        clientY <= rect.bottom;
    return isHovering;
  }

  onMouseDownEvent (e) {
    if (e.mode == "translate") {
      this.domElement.style.cursor = "grabbing";
    }
  }

  onMouseUpEvent (e) {
    if (e.mode == "translate") {
      this.domElement.style.cursor = "default";
    }
  }

  showArrow (visible) {
    this.showX = false;
    this.showY = false;
    this.showZ = visible;
  }

  pointerHover( pointer ) {

		if ( this.object === undefined || this.dragging === true ) return;

		if ( pointer !== null ) _raycaster.setFromCamera( pointer, this.camera );

		let intersect = intersectObjectWithRay( this._gizmo.picker[ this.mode ], _raycaster );

    if(this.isOverIcon(pointer)) {

      if (this.mode === "translate" && !intersect) {
        intersect = {object:{name: "Z"}};
      }

      this.domElement.style.cursor = "pointer";
    } else {
      this.domElement.style.cursor = "default";
    }

		if ( intersect ) {

			this.axis = intersect.object.name;

		} else {

			this.axis = null;
		}

	}
}

const _raycaster = new THREE.Raycaster();

function intersectObjectWithRay( object, raycaster, includeInvisible ) {

	const allIntersections = raycaster.intersectObject( object, true );

	for ( let i = 0; i < allIntersections.length; i ++ ) {

		if ( allIntersections[ i ].object.visible || includeInvisible ) {

			return allIntersections[ i ];

		}

	}

	return false;

}

export { CustomTransformControls};