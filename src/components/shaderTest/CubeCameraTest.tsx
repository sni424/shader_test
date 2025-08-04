import { useThree, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import ModelLoadHook from '../../hook/ModelLoadHook';


// 1. Drei에서 CubeCamera와 OrbitControls를 import합니다.
import { CubeCamera, OrbitControls } from '@react-three/drei';

const modelArray = [];




interface CubeCameraTestProps {
    roughness: number;
}

const CubeCameraTest: React.FC<CubeCameraTestProps> = ({ roughness }) => {
    const { scene, gl } = useThree();

    const [isModel, setModel] = useState(false);
    const [isTexture, setTexture] = useState(false)
    const { loadModels } = ModelLoadHook();
    const cameraTexture = useRef<THREE.CubeTexture | null>(null);


    const cubeCameraRender = new THREE.WebGLCubeRenderTarget(512, { generateMipmaps: true })
    const cubeCamera = new THREE.CubeCamera(1, 1000, cubeCameraRender)

    // 모델 로드
    useEffect(() => {

        const fetchAndProcessModel = async () => {
            try {
                const loadedScenes = await loadModels(modelArray);
                scene.add(loadedScenes[0]);
                scene.background = null;

                setModel(true);
            } catch (error) {
                console.error('모델 로드 중 에러:', error);
            }
        };
        fetchAndProcessModel();
    }, [scene]);
    // 배경과 조명을 JSX 내에서 선언적으로 추가합니다.
    useEffect(() => {
        if (isModel) {
            cubeCamera.position.set(0, 4, 1)
            cubeCamera.update(gl, scene)

            if (cubeCameraRender.texture) {
                cubeCamera.layers.enableAll();
                // const newTexture = cubeCameraRender.fromEquirectangularTexture(gl, cubeCameraRender.texture)
                // console.log("newTexture", newTexture, cubeCameraRender.texture)
                cameraTexture.current = cubeCameraRender.texture ?? null
                setTexture(true)
            }
        }
        scene.background = null;

    }, [isModel]);

    return (
        <>


            <ambientLight intensity={0.5} />
            <directionalLight intensity={0.5} position={[5, 5, 5]} />
            {isTexture &&

                <mesh position={[0, 4, 1]} scale={[0.1, 0.1, 0.1]} >
                    <sphereGeometry args={[15, 32, 16]} />
                    <meshPhysicalMaterial
                        roughness={roughness}
                        metalness={1.0}
                        envMap={cameraTexture.current ? cameraTexture.current : null}
                        envMapIntensity={0.8}
                        specularIntensity={1.0}
                        reflectivity={1}
                    />
                </mesh>


            }

        </>
    );
};

export default CubeCameraTest;