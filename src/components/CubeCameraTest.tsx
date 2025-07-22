import { useThree, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import ModelLoadHook from '../hook/ModelLoadHook';
import modelDp from "/latest.glb?url";

// 1. Drei에서 CubeCamera와 OrbitControls를 import합니다.
import { CubeCamera, OrbitControls } from '@react-three/drei';

const modelArray = [modelDp];




interface CubeCameraTestProps {
    roughness: number;
}

const CubeCameraTest: React.FC<CubeCameraTestProps> = ({ roughness }) => {
    const { scene } = useThree();

    const [isModel, setModel] = useState(false);
    const { loadModels } = ModelLoadHook();

    // 모델 로드
    useEffect(() => {

        const fetchAndProcessModel = async () => {
            try {
                const loadedScenes = await loadModels(modelArray);
                scene.add(loadedScenes[0]);

                setModel(true);
            } catch (error) {
                console.error('모델 로드 중 에러:', error);
            }
        };
        fetchAndProcessModel();
    }, [scene]);
    // 배경과 조명을 JSX 내에서 선언적으로 추가합니다.
    useEffect(() => {
        scene.background = null;

    }, [scene]);

    return (
        <>


            <ambientLight intensity={0.5} />
            <directionalLight intensity={0.5} position={[5, 5, 5]} />
            {isModel &&
                <CubeCamera resolution={256} position={[-0.8, 1.3, -1]}>
                    {(texture) => (
                        <>


                            {/* 4. 이 객체는 위에서 생성된 큐브맵("texture")을 사용합니다. */}
                            <mesh >
                                <sphereGeometry args={[1, 32, 32]} />
                                <meshPhysicalMaterial
                                    roughness={roughness}
                                    metalness={0.5}
                                    envMap={texture} // 생성된 텍스처를 envMap으로 설정
                                    envMapIntensity={0.8}
                                    reflectivity={1}
                                />
                            </mesh>
                        </>
                    )}
                </CubeCamera>
            }

        </>
    );
};

export default CubeCameraTest;