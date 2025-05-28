
import { useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LoadModelResult, ModelScene } from './CheckDimensions';
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js';
import modelDp from "/알파룸꽃병.glb?url"

// 타입 정의
type MeshPhysicalMaterial = THREE.MeshPhysicalMaterial;
type Mesh = THREE.Mesh;

const transmissionFunctions = /* glsl */ `
#ifdef USE_TRANSMISSION
    // 이유: MeshPhysicalMaterial의 transmission 효과를 프레임 버퍼 기반으로 커스터마이징
    // 결과: reflectivity 기반 IOR 계산과 프레임 버퍼 샘플링으로 투과 효과 구현

    uniform float transmission;
    uniform float thickness;
    uniform float attenuationDistance;
    uniform vec3 attenuationColor;
    uniform float reflectivity; // 반사율 (IOR 계산에 사용)
    uniform mat4 modelMatrix;
    uniform mat4 projectionMatrix;

    #ifdef USE_TRANSMISSIONMAP
        uniform sampler2D transmissionMap;
    #endif
    #ifdef USE_THICKNESSMAP
        uniform sampler2D thicknessMap;
    #endif

    uniform vec2 transmissionSamplerSize;
    uniform sampler2D transmissionSamplerMap;

    varying vec3 vWorldPosition; // patchFragment와 호환

    vec3 getVolumeTransmissionRay(vec3 n, vec3 v, float thickness, float ior, mat4 modelMatrix) {
        vec3 refractionVector = refract(-v, normalize(n), 1.0 / ior);
        vec3 modelScale;
        modelScale.x = length(vec3(modelMatrix[0].xyz));
        modelScale.y = length(vec3(modelMatrix[1].xyz));
        modelScale.z = length(vec3(modelMatrix[2].xyz));
        return normalize(refractionVector) * thickness * modelScale;
    }

    float applyIorToRoughness(float roughness, float ior) {
        return roughness * clamp(ior * 2.0 - 2.0, 0.0, 1.0);
    }

    vec3 getTransmissionSample(vec2 fragCoord, float roughness, float ior) {
        float framebufferLod = log2(transmissionSamplerSize.x) * applyIorToRoughness(roughness, ior);
        return texture2D(transmissionSamplerMap, fragCoord.xy).rgb; // texture2DLodEXT 대체
    }

    vec3 applyVolumeAttenuation(vec3 radiance, float transmissionDistance, vec3 attenuationColor, float attenuationDistance) {
        if (attenuationDistance == 0.0) {
            return radiance;
        } else {
            vec3 attenuationCoefficient = -log(attenuationColor) / attenuationDistance;
            vec3 transmittance = exp(-attenuationCoefficient * transmissionDistance);
            return transmittance * radiance;
        }
    }

    vec3 getIBLVolumeRefraction(
        vec3 n, vec3 v, float perceptualRoughness, vec3 baseColor, vec3 specularColor,
        vec3 position, mat4 modelMatrix, mat4 viewMatrix, mat4 projMatrix,
        float ior, float thickness, vec3 attenuationColor, float attenuationDistance
    ) {
        vec3 transmissionRay = getVolumeTransmissionRay(n, v, thickness, ior, modelMatrix);
        vec3 refractedRayExit = position + transmissionRay;
        vec4 ndcPos = projMatrix * viewMatrix * vec4(refractedRayExit, 1.0);
        vec2 refractionCoords = ndcPos.xy / ndcPos.w;
        refractionCoords += 1.0;
        refractionCoords /= 2.0;
        vec3 transmittedLight = getTransmissionSample(refractionCoords, perceptualRoughness, ior);
        vec3 attenuatedColor = applyVolumeAttenuation(transmittedLight, length(transmissionRay), attenuationColor, attenuationDistance);
        return (1.0 - specularColor) * attenuatedColor * baseColor;
    }
#endif
`;

const transmissionFragFun = `
  #ifdef USE_TRANSMISSION
                material.transmission = transmission;
                material.transmissionAlpha = 1.0;
                material.thickness = thickness;
                material.attenuationDistance = attenuationDistance;
                material.attenuationColor = attenuationColor;

                #ifdef USE_TRANSMISSIONMAP
                    material.transmission *= texture2D(transmissionMap, vTransmissionMapUv).r;
                #endif
                #ifdef USE_THICKNESSMAP
                    material.thickness *= texture2D(thicknessMap, vThicknessMapUv).g;
                #endif

                vec3 pos = vWorldPosition;
                vec3 v = normalize(cameraPosition - pos);
                float ior = (1.0 + 0.4 * reflectivity) / (1.0 - 0.4 * reflectivity);
                float transmissionFactor = material.transmission;

                vec3 transmission = transmissionFactor * getIBLVolumeRefraction(
                    geometryNormal, v, material.roughness, material.diffuseColor, material.specularColor,
                    pos, modelMatrix, viewMatrix, projectionMatrix,
                    ior, material.thickness, material.attenuationColor, material.attenuationDistance
                );

                diffuseColor.a *= clamp(1.0 - transmissionFactor + luminance(material.specularColor), 0.0, 1.0);
                totalDiffuse = mix(totalDiffuse, transmission, transmissionFactor);
            #endif    

`

const modelArray = [modelDp]
const loader = new GLTFLoader();

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

// 쉐이더 적용 함수
const applyTransmissionShader = (
    material: MeshPhysicalMaterial,
) => {
    // 이유: 프레임 버퍼 기반 투과 쉐이더 적용
    // 결과: 대상 머티리얼에 투과 효과 통일
    material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <transmission_pars_fragment>',
            transmissionFunctions
        ).replace(
            '#include <transmission_fragment>',
            transmissionFragFun
        );
    };

    material.transparent = true;
    material.blending = THREE.NormalBlending;
    material.needsUpdate = true;
};

const TransmissionTest: React.FC = () => {
    const { scene, camera } = useThree();
    const materialRef = useRef<MeshPhysicalMaterial>(null);
    const meshRef = useRef<Mesh>(null);
    const didLoadRef = useRef<boolean>(false);
    const [glbModel, setGlbModel] = useState<THREE.Object3D[]>([])
    useEffect(() => {

        const fetchAndProcessModel = async (index: number) => {
            try {

                const loadedScenes = await loadModels(modelArray);

                loadedScenes.forEach((scene: THREE.Object3D) => {
                    const newModel = scene.clone();


                    const object = newModel.children[0];
                    if (index > 0) {
                        object.position.x += (index + 0.2) * 2;
                    }

                    object.children.forEach(data => {
                        if (!(data instanceof THREE.Mesh)) {
                            return console.error("에러!")
                        }
                        const material = data.material as THREE.MeshPhysicalMaterial;
                        if (data.name === "알파룸_라이브월_DP_M_7") {


                            if (material instanceof THREE.MeshPhysicalMaterial) {
                                // console.log("material", material)
                                material.color = new THREE.Color(0xffffff)
                                material.transmission = 1;
                                material.roughness = 0;
                                material.thickness = 0;
                                material.reflectivity = 1;
                                material.envMapIntensity = 1;
                                if ((index === 2 || index === 3)) {
                                    applyTransmissionShader(material);
                                }

                                material.needsUpdate = true;
                            }
                        } else if (data.name === "알파룸_라이브월_DP_M_8") {

                            if (material instanceof THREE.MeshPhysicalMaterial) {
                                material.transmission = 0.5;
                                material.opacity = 1
                                material.roughness = 0;
                                material.thickness = 0;
                                material.reflectivity = 0.5;
                                material.envMapIntensity = 1;
                                material.transparent = false
                                material.depthTest = true
                                material.depthWrite = true
                                if ((index === 2 || index === 3)) {
                                    applyTransmissionShader(material);
                                }

                                material.needsUpdate = true;
                            }
                        }
                        //  else {
                        //     if (material instanceof THREE.MeshPhysicalMaterial) {
                        //         material.transparent = false
                        //         material.needsUpdate = true;
                        //     }
                        // }
                    })


                    setGlbModel(prev => [...prev, newModel.children[0]]); // 또는 newModel 전체
                });
            } catch (error) {
                console.error('모델 로드 중 에러:', error);
            }
        };

        const init = async () => {
            for (let i = 0; i < 4; i++) {
                await fetchAndProcessModel(i); // 각 로드를 기다림
            }
        };

        if (!didLoadRef.current) { // 전체 로직을 한 번만 실행하고 싶다면
            didLoadRef.current = true;
            init();
        }



    }, [])

    // 렌더 타겟 설정
    useEffect(() => {
        // 이유: transmissionSamplerMap으로 사용할 프레임 버퍼 생성
        // 결과: 씬을 렌더링한 텍스처를 투과 효과에 사

        // 쉐이더 커스터마이징
        if (!materialRef.current || !meshRef.current) return;

        materialRef.current.onBeforeCompile = (shader) => {
            // 유니폼 추가


            // 쉐이더에 transmissionFunctions 삽입
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <transmission_pars_fragment>',
                transmissionFunctions
            );

            // transmission_fragment 수정
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <transmission_fragment>',
                transmissionFragFun
            );

            // 디버깅
            // console.log('Modified fragment shader:', shader.fragmentShader);
        };

        // 투명 설정
        materialRef.current.transparent = true;
        materialRef.current.blending = THREE.NormalBlending;
        materialRef.current.needsUpdate = true;

        // 클린업
        return () => {

        };
    }, [scene, camera]);


    return (
        <>
            <mesh position={[0, 5, 1]}>
                <boxGeometry args={[5, 5, 5]} />
                <meshPhysicalMaterial
                    transmission={1}
                    roughness={0}
                    thickness={1}
                    reflectivity={1}
                    transparent
                    envMapIntensity={1}
                />
            </mesh>
            <mesh position={[0, 5, -5]}>
                <boxGeometry args={[5, 5, 5]} />
                <meshPhysicalMaterial
                    transmission={1}
                    roughness={0}
                    thickness={1}
                    reflectivity={1}
                    transparent
                    envMapIntensity={1}
                />
            </mesh>
            <mesh position={[0, 5, 8]} ref={meshRef}>
                <boxGeometry args={[5, 5, 5]} />
                <meshPhysicalMaterial
                    ref={materialRef}
                    transmission={1}
                    roughness={0}
                    thickness={1}
                    reflectivity={1}
                    transparent
                    envMapIntensity={1}
                />
            </mesh>
            <mesh position={[8, 5, 4]}>
                <boxGeometry args={[5, 5, 5]} />
                <meshPhysicalMaterial />
            </mesh>
            {glbModel.map(child => {
                return (
                    <primitive key={child.uuid} object={child} />
                )
            })}
        </>
    );
};

export default TransmissionTest;