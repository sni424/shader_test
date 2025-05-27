import { useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react'
import * as THREE from "three"

// transmission 관련 함수들을 defines에 추가할 문자열
const transmissionFunctions = /* glsl */ `
// Transmission 관련 커스텀 함수들
vec3 getVolumeTransmissionRay(vec3 n, vec3 v, float thickness, float ior, mat4 modelMatrix) {
    vec3 refractionVector = refract(-v, normalize(n), 1.0 / ior);
    vec3 modelScale;
    modelScale.x = length(vec3(modelMatrix[0].xyz));
    modelScale.y = length(vec3(modelMatrix[1].xyz));
    modelScale.z = length(vec3(modelMatrix[2].xyz));
    return normalize(refractionVector) * thickness * modelScale;
}

vec3 getTransmissionSample(vec2 fragCoord, float roughness, float ior) {
    // transmissionSamplerSize와 transmissionSamplerMap이 없으므로 환경맵으로 대체
    #ifdef USE_ENVMAP
        vec3 envSample = textureCube(envMap, vec3(fragCoord, 0.0)).rgb;
        return envSample;
    #else
        return vec3(0.5); // 기본값
    #endif
}

vec3 applyVolumeAttenuation(vec3 radiance, float transmissionDistance, vec3 attenuationColor, float attenuationDistance) {
    if (attenuationDistance <= 0.0) {
        return radiance;
    } else {
        vec3 attenuationCoefficient = -log(attenuationColor) / attenuationDistance;
        vec3 transmittance = exp(-attenuationCoefficient * transmissionDistance);
        return transmittance * radiance;
    }
}

// 커스텀 getIBLVolumeRefraction 함수 (기존 함수를 오버라이드)
vec3 getIBLVolumeRefraction(vec3 n, vec3 v, float perceptualRoughness, vec3 baseColor, vec3 specularColor, vec3 position, mat4 modelMatrix, mat4 viewMatrix, mat4 projMatrix, float ior, float thickness, vec3 attenuationColor, float attenuationDistance) {
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
`;

const TransmissionTest = () => {
    const { gl } = useThree();
    const materialRef = useRef<null | THREE.Material>(null);
    const meshRef = useRef(null);

    useEffect(() => {
        if (meshRef.current && materialRef.current) {
            console.log(meshRef.current, materialRef.current)

            materialRef.current.onBeforeCompile = function (shader) {
                // 필요한 uniforms 추가
                shader.uniforms.reflectivity = { value: 1.0 };

                // reflectivity uniform 사용을 위한 define 추가
                shader.defines = shader.defines || {};
                shader.defines.REFLECTIVITY_UNIFORM = '';

                // defines 섹션에 transmission 함수들 추가 (void main() 앞에)
                shader.fragmentShader = shader.fragmentShader.replace(
                    'void main()',
                    transmissionFunctions + '\nvoid main()'
                );

            };

            materialRef.current.needsUpdate = true;
        }
    }, [gl])

    return (
        <>
            <mesh>
                <boxGeometry args={[5, 5, 5]} />
                <meshPhysicalMaterial
                    transmission={1}
                    roughness={0}
                    thickness={1}
                    ior={1.5}
                    transparent
                    envMapIntensity={1}
                />
            </mesh>
            <mesh position={[0, 0, 8]} ref={meshRef}>
                <boxGeometry args={[5, 5, 5]} />
                <meshPhysicalMaterial
                    ref={materialRef}
                    thickness={0}
                    reflectivity={1}
                />
            </mesh>
            <mesh position={[8, 0, 4]}>
                <boxGeometry args={[5, 5, 5]} />
                <meshPhysicalMaterial />
            </mesh>
        </>
    )
}

export default TransmissionTest