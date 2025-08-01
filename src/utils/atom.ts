import { PrimitiveAtom } from "jotai";
import { atom, createStore, getDefaultStore } from "jotai";
import * as THREE from "three";
import { basicSettingType } from "./type";

export type Store = ReturnType<typeof createStore>;
// export const defaultStore = createStore();
export const defaultStore = getDefaultStore();

export function getAtomValue<T = any>(atom: PrimitiveAtom<T>): T {
  const store = getDefaultStore();
  return store.get(atom);
}

export function setAtomValue<T = any>(
  atom: PrimitiveAtom<T>,
  value: T | ((prev: T) => T)
) {
  const store = getDefaultStore();
  store.set(atom, value);
}

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

export const modelAtom = atom<THREE.Object3D[]>([]);

//초기 세팅값
export const basicSettingAtom = atom<basicSettingType>({
  clipping: 10,
  camera: {
    moveSpeed: 2,
    rotationSpeed: 1,
    inertia: 0.9,
    fov: 75,
    matrix: [
      -0.36708142704537816, -1.734723475976807e-16, 0.9301888119722366, 0,
      0.10836348894508008, 0.9931911339745508, 0.04276360202315978, 0,
      -0.923855280973146, 0.11649622909925321, -0.3645820187881954, 0,
      -2.1393239205928385, 1.3, 1.198629524582003, 1,
    ],
  },
});
