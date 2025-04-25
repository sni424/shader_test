
import React, { useEffect, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from "three"
// import onlyBase from "/onlyBase.glb?url"
import dp004 from "/nav.glb?url"
import { useSetAtom } from 'jotai';
import { modelAtom } from '../utils/atom';
const CheckDimensions = () => {

    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);
    const setModelAtom = useSetAtom(modelAtom)

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(dp004, (gltf) => {
            setGltfScene(gltf.scene);
            setModelAtom(gltf.scene)
        });
    }, []);

    return (
        // gltfScene ? <primitive object={gltfScene} /> :
        null
    )
}

export default CheckDimensions