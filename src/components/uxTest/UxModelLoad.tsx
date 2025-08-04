import React, { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber';
import * as THREE from "three"

import ModelLoadHook from '../../hook/ModelLoadHook';
import { resetToInitialView } from '../../utils/utill';
import { modelAtom, setAtomValue } from '../../utils/atom';

const modelArray: string[] = ["https://vra-configurator-dev.s3.ap-northeast-2.amazonaws.com/jonghyeok/kitchen.glb"];

const UxModelLoad = () => {

    const { loadModels } = ModelLoadHook();
    const { scene, camera, gl } = useThree()
    const [isModel, setModel] = useState(false);

    // 모델 로드
    useEffect(() => {
        resetToInitialView(camera as THREE.PerspectiveCamera, gl);
        const fetchAndProcessModel = async () => {
            try {
                const loadedScenes = await loadModels(modelArray);
                if (loadedScenes.length > 0) {
                    scene.add(loadedScenes[0]);
                    scene.background = null;
                    setAtomValue(modelAtom, loadedScenes[0]);
                    setModel(true);
                }
            } catch (error) {
                console.error('모델 로드 중 에러:', error);
            }
        };
        fetchAndProcessModel();
    }, [scene]);



    return (
        null
    )
}

export default UxModelLoad