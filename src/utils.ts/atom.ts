import { atom } from "jotai";
import * as THREE from "three";

export const firstVectorAtom = atom<{
  position: THREE.Vector3;
  normal: THREE.Vector3;
} | null>(null);

export const updateLineAtom = atom<number>(0);
