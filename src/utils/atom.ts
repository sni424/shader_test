import { atom } from "jotai";
import * as THREE from "three";

export const firstVectorAtom = atom<{
  position: THREE.Vector3;
  normal: THREE.Vector3;
} | null>(null);

export const lastVectorAtom = atom<{
  position: THREE.Vector3;
  normal: THREE.Vector3;
} | null>(null);

export const dotAtom = atom<{
  position: THREE.Vector3;
  normal: THREE.Vector3;
} | null>(null);

export const eventAtom = atom<boolean>(false);

export const modelAtom = atom<THREE.Object3D | null>(null);
