import { useAtom, useAtomValue } from 'jotai'
import React, { useEffect, useRef, useState } from 'react'
import { eventAtom, firstVectorAtom, lastVectorAtom } from '../utils/atom'
import * as THREE from "three"
import { useThree } from '@react-three/fiber'
import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js'
import { Html } from '@react-three/drei'
import { deleteLine } from '../utils/collectFun'

type LabelData = {
    position: THREE.Vector3;
    text: string;
};

const newPositionFun = (axis: string, startVector: THREE.Vector3,
    endVector: THREE.Vector3): THREE.Vector3 => {
    let newVector: THREE.Vector3;

    switch (axis) {
        case "x":
            newVector = new THREE.Vector3(endVector.x, startVector.y, startVector.z);
            break;
        case "y":
            newVector = new THREE.Vector3(startVector.x, endVector.y, startVector.z);
            break;
        case "z":
            newVector = new THREE.Vector3(startVector.x, startVector.y, endVector.z);
            break;
        default:
            newVector = new THREE.Vector3(endVector.x, endVector.y, endVector.z);
            break;
    }

    return newVector;
}

const LineComponent = () => {

    const { scene } = useThree();
    const [firstVector, setFirstVector] = useAtom(firstVectorAtom);
    const [lastVector, setLastVector] = useAtom(lastVectorAtom);
    const eventKey = useAtomValue(eventAtom)
    const horizontalLineRef = useRef(null);
    const verticalLineRef = useRef(null);
    const oneLineRef = useRef(null)
    const [labelData, setLabelData] = useState<LabelData[] | null>(null);


    useEffect(() => {

        if (firstVector && lastVector) {
            if (eventKey) {
                // 기존 선이 있으면 제거
                if (horizontalLineRef.current) scene.remove(horizontalLineRef.current);
                if (verticalLineRef.current) scene.remove(verticalLineRef.current);
                if (oneLineRef.current) scene.remove(oneLineRef.current)
                // 수평선 생성 (첫 번째 점에서 중간 지점까지)

                const axis = firstVector.normal.x !== 0 ? "x" : firstVector.normal.y !== 0 ? "y" : "z";
                console.log("axis", axis)
                const newPosition = newPositionFun(axis, firstVector.position, lastVector.position)
                const straightGeometry = new THREE.BufferGeometry().setFromPoints([
                    firstVector.position,
                    newPosition
                ]);
                const straightLine = new THREE.Line(
                    straightGeometry,
                    new THREE.LineBasicMaterial({ color: 0x00ffff })
                );
                scene.add(straightLine);
                const midPoint = new THREE.Vector3()
                    .addVectors(firstVector.position, newPosition)
                    .multiplyScalar(0.5);
                const distance = firstVector.position.distanceTo(newPosition);
                setLabelData([{ position: midPoint, text: `${distance.toFixed(2)}m` }]);
                straightLine.name = `dimensionLine.horizontalLine_${straightLine.id}`
                oneLineRef.current = straightLine;

            } else {
                // 기존 선이 있으면 제거
                if (horizontalLineRef.current) scene.remove(horizontalLineRef.current);
                if (verticalLineRef.current) scene.remove(verticalLineRef.current);
                if (oneLineRef.current) scene.remove(oneLineRef.current)
                // 중간 지점 생성 (첫 번째 점의 y, 마지막 점의 x)
                const intermediatePoint = new THREE.Vector3(lastVector.position.x, firstVector.position.y, lastVector.position.z);


                // 수직선 생성 (중간 지점에서 마지막 점까지)
                const verticalGeometry = new THREE.BufferGeometry().setFromPoints([
                    intermediatePoint,
                    lastVector.position
                ]);
                const verticalLine = new THREE.Line(
                    verticalGeometry,
                    new THREE.LineBasicMaterial({ color: 0x00ffff })
                );
                scene.add(verticalLine);
                verticalLine.name = `dimensionLine.verticalLine${verticalLine.id}`
                verticalLineRef.current = verticalLine;


                // 수평선 생성 (첫 번째 점에서 중간 지점까지)
                const horizontalGeometry = new THREE.BufferGeometry().setFromPoints([
                    firstVector.position,
                    intermediatePoint
                ]);
                const horizontalLine = new THREE.Line(
                    horizontalGeometry,
                    new THREE.LineBasicMaterial({ color: 0x00ffff })
                );
                scene.add(horizontalLine);
                horizontalLine.name = `dimensionLine.horizontalLine_${horizontalLine.id}`
                horizontalLineRef.current = horizontalLine;
                // 각 선의 중간 위치 및 길이 계산
                const horizontalMidPoint = new THREE.Vector3()
                    .addVectors(firstVector.position, intermediatePoint)
                    .multiplyScalar(0.5);
                const verticalMidPoint = new THREE.Vector3()
                    .addVectors(intermediatePoint, lastVector.position)
                    .multiplyScalar(0.5);
                const horizontalDistance = firstVector.position.distanceTo(intermediatePoint);
                const verticalDistance = intermediatePoint.distanceTo(lastVector.position);
                if (horizontalDistance < 0.1) {
                    setLabelData([

                        { position: verticalMidPoint, text: `${verticalDistance.toFixed(2)}m` },
                    ])
                } else if (verticalDistance < 0.1) {
                    setLabelData([

                        { position: horizontalMidPoint, text: `${horizontalDistance.toFixed(2)}m` },
                    ])
                } else {

                    setLabelData([
                        { position: horizontalMidPoint, text: `${horizontalDistance.toFixed(2)}m` },
                        { position: verticalMidPoint, text: `${verticalDistance.toFixed(2)}m` },
                    ]);
                }

            }

        } else {
            setLabelData(null)
        }


    }, [scene, firstVector, lastVector, eventKey]);

    useEffect(() => {
        // 언마운트 시에만 실행될 정리 함수
        return () => {

            if (horizontalLineRef.current) scene.remove(horizontalLineRef.current);
            if (verticalLineRef.current) scene.remove(verticalLineRef.current);
            if (oneLineRef.current) scene.remove(oneLineRef.current);
            setLabelData(null);
            deleteLine(scene);
            setFirstVector(null)
            setLastVector(null)
        };
    }, []); // 빈 의존성 배열 - 마운트/언마운트 시에만 실행
    return (
        <>
            {labelData &&
                labelData.map((label, index) => (
                    <Html key={index} position={label.position}>
                        <div
                            style={{
                                color: '#00ff00',
                                background: 'rgba(0,0,0,0.5)',
                                padding: '1px 2px',
                                borderRadius: '4px',
                                fontSize: '14px',
                            }}
                        >
                            {label.text}
                        </div>
                    </Html>
                ))}
        </>
    );
};

export default LineComponent;