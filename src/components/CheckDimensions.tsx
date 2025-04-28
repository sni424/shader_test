
import React, { useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from "three"
// import onlyBase from "/onlyBase.glb?url"
import dp004 from "/nav2.glb?url"
import bedRoomObject from "/침실1dp.003.glb?url"
import { useSetAtom } from 'jotai';
import { modelAtom } from '../utils/atom';

const modelArray = [dp004, bedRoomObject]
const loader = new GLTFLoader();
const CheckDimensions = () => {

    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);
    const setModelAtom = useSetAtom(modelAtom)
    const didLoadRef = useRef<boolean>(false);
    useEffect(() => {
        console.log("안녕")
        if (didLoadRef.current) return;
        didLoadRef.current = true;
        modelArray.forEach((url) => {
            loader.load(
                url,
                (gltf) => {
                    // 로드된 scene을 로컬 상태와 atom에 모두 저장
                    // setScenes(prev => [...prev, gltf.scene]);
                    setModelAtom(pre => [...pre, gltf.scene]);
                },
                undefined,
                (error) => {
                    console.error('GLTF 로드 에러:', error);
                }
            );
        });

    }, []);

    return (
        // gltfScene ? <primitive object={gltfScene} /> :
        null
    )
}

export default CheckDimensions