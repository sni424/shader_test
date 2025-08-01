import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const OcclusionTest: React.FC = () => {
    const { gl, camera, scene } = useThree();
    const rawGL = gl.getContext() as WebGL2RenderingContext;

    const sphereRef = useRef<THREE.Mesh>(null);
    const planeRef = useRef<THREE.Mesh>(null);

    const queryQueue = useRef<WebGLQuery[]>([]);
    const queryResult = useRef<boolean | null>(null);

    useEffect(() => {
        if (!sphereRef.current || !planeRef.current) return;

        scene.add(planeRef.current);
        scene.add(sphereRef.current);

        return () => {
            queryQueue.current.forEach((query) => rawGL.deleteQuery(query));
        };
    }, [scene]);

    useFrame(() => {
        if (!sphereRef.current || !planeRef.current) return;

        // 이전 쿼리 결과 확인
        if (queryQueue.current.length > 0) {
            const lastQuery = queryQueue.current[0];
            const available = rawGL.getQueryParameter(lastQuery, rawGL.QUERY_RESULT_AVAILABLE);
            if (available) {
                queryResult.current = rawGL.getQueryParameter(lastQuery, rawGL.QUERY_RESULT) as boolean;
                rawGL.deleteQuery(queryQueue.current.shift()!);
            }
        }

        // 새로운 오클루전 쿼리 시작
        const newQuery = rawGL.createQuery();
        rawGL.beginQuery(rawGL.ANY_SAMPLES_PASSED, newQuery);

        // 색상 쓰기 비활성화하고 스피어만 렌더링
        rawGL.colorMask(false, false, false, false);
        gl.render(sphereRef.current, camera);
        rawGL.colorMask(true, true, true, true);

        rawGL.endQuery(rawGL.ANY_SAMPLES_PASSED);
        queryQueue.current.push(newQuery);

        // 쿼리 결과에 따라 플레인 색상 변경
        if (queryResult.current !== null) {
            (planeRef.current.material as THREE.MeshStandardMaterial).color.set(queryResult.current ? 'red' : 'green');
        }
    });

    return (
        <>
            <mesh ref={sphereRef} position={[0, 0, -1]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="yellow" side={THREE.DoubleSide} depthWrite={true} />
            </mesh>

            <mesh ref={planeRef} position={[0, 0, 0]}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="red" side={THREE.DoubleSide} depthWrite={true} />
            </mesh>
        </>
    );
};

export default OcclusionTest;