import { atom } from "jotai";
import * as THREE from "three";

export const firstVectorAtom = atom<{
  position: THREE.Vector3;
  normal: THREE.Vector3;
}>({
  position: new THREE.Vector3(),
  normal: new THREE.Vector3(),
});
