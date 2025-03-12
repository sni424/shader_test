import { useThree } from '@react-three/fiber';
import React, { useEffect, useState } from 'react'
import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import baseWithDpfrom from "/baseWithDp.glb?url"
import onlyBase from "/onlyBase.glb?url"

const cameraMatrix = [
    -0.9983257772716383,
    -5.421010862427522e-20,
    -0.05784152863626252,
    0,
    -0.0006028460694330277,
    0.9999456855805234,
    0.01040492506044473,
    0,
    0.057838387007213,
    0.010422374436610001,
    -0.9982715537865974,
    0,
    -1.1994167725716443,
    1.3,
    0.2417023555759947,
    1
]
const DimensionComplete = ({ pageStep }: { pageStep: number }) => {
    const { camera } = useThree()
    const [gltfScene, setGltfScene] = useState<THREE.Group | null>(null);

    useEffect(() => {
        const loader = new GLTFLoader();
        if (camera) {
            const matrix = new THREE.Matrix4().fromArray(cameraMatrix);
            matrix.decompose(camera.position, camera.quaternion, camera.scale);
            camera.updateMatrixWorld(true);
        }
        loader.load(pageStep === 7 ? onlyBase : baseWithDpfrom, (gltf) => {
            setGltfScene(gltf.scene);
        });

    }, [camera, pageStep]);

    return gltfScene ? <primitive object={gltfScene} /> : null;

}

export default DimensionComplete