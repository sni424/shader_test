import React from 'react'
import * as THREE from "three"
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

const loader = new GLTFLoader();
export type ModelScene = THREE.Group;
export type LoadModelResult = ModelScene[];

const ModelLoadHook = () => {

    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath(
        'https://unpkg.com/three@latest/examples/jsm/libs/basis/',
    );
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
        'https://unpkg.com/three@latest/examples/jsm/libs/draco/gltf/',
    );
    loader.setKTX2Loader(ktx2Loader);
    loader.setDRACOLoader(dracoLoader);
    loader.setMeshoptDecoder(MeshoptDecoder)
    // 모델 로드 함수
    const loadModels = async (modelArray: string[]): Promise<LoadModelResult> => {
        const loadPromises = modelArray.map((url: string) =>
            new Promise<ModelScene>((resolve, reject) => {
                loader.load(
                    url,
                    (gltf: GLTF) => {
                        resolve(gltf.scene);
                    },
                    undefined, // 진행 상황 콜백 (필요 시 구현)
                    (event: ProgressEvent<EventTarget>) => {
                        // 에러 처리: ProgressEvent로 타입 지정
                        console.error('GLTF 로드 에러:', event);
                        reject(event); // ProgressEvent를 reject (Promise는 unknown 타입 허용)
                    }
                );
            })
        );

        // 모든 모델이 로드될 때까지 기다린 후 결과 반환
        const scenes = await Promise.all(loadPromises);
        return scenes;
    };

    return { loadModels }
}

export default ModelLoadHook