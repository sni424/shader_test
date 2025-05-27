
import { useEffect, useRef } from 'react'
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from "three"
// import onlyBase from "/onlyBase.glb?url"
import dp004 from "/nav2.glb?url"
import base from "/base.glb?url"
import bedRoomObject from "/침실1dp.003.glb?url"
import 침실2_base from "/침실2_base.glb?url"
import 침실1dp_004 from "/침실1dp_004.glb?url"
import main9 from "/main9.glb?url"
import main10 from "/main10.glb?url"
import main11 from "/main11.glb?url"
import { useSetAtom } from 'jotai';
import { modelAtom } from '../utils/atom';

const modelArray = [dp004, bedRoomObject, base, main9, main10, main11, 침실2_base, 침실1dp_004]
const loader = new GLTFLoader();


type ModelScene = THREE.Group;
type LoadModelResult = ModelScene[];

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

const CheckDimensions = () => {


    const setModelAtom = useSetAtom(modelAtom)
    const didLoadRef = useRef<boolean>(false);

    useEffect(() => {
        setModelAtom([]);
        if (didLoadRef.current) return;
        didLoadRef.current = true;
        const fetchModels = async () => {
            try {
                const loadedScenes = await loadModels(modelArray);
                console.log("모델로드 완료")
                setModelAtom(loadedScenes);
            } catch (error) {
                console.error('모델 로드 중 에러:', error);
                setModelAtom([]);
            }
        };
        fetchModels();

    }, []);

    return (
        // gltfScene ? <primitive object={gltfScene} /> :
        null
    )
}

export default CheckDimensions