import * as THREE from "three";

export type VectorObject = {
  position: THREE.Vector3;
  normal: THREE.Vector3;
};
export type cameraSettingType = {
  moveSpeed: number;
  //회전속도도
  rotationSpeed: number;
  fov: number;
  //관성
  inertia: number;
  matrix: number[];
};

export type basicSettingType = {
  clipping: number;
  camera: cameraSettingType;
};
