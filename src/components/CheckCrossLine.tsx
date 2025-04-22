import { Line, Plane } from '@react-three/drei'
import { useThree } from '@react-three/fiber';
import React from 'react'
import * as THREE from "three"
import { isIntersectFromPoints } from '../utils/collectFun';

// const epsilon = 1e-10;
// const isZero = (value:float)=>{
//     return Math.abs(value) < epsilon;
// }


const roomPoint = [[-2.668383479085586, -4.328145059353603]
    , [-2.6802263957505104, -0.1651258665643493]
    , [1.1439089260352815, -0.214379542470640]
    , [1.0947307590790802, -4.347281550162903]]

const lineArray: [number, number][][] = [
    [[-3.6514122353386615, -0.04416962530295615], [6.112507203012343, 1.1725017856508466]],
    [[
        8.47064304626679, -2.3914815573361468
    ], [8.540344301382131, 1.0343658240739768]],
];

//https://snowfleur.tistory.com/98
//https://netcanis.tistory.com/112
//https://gaussian37.github.io/math-algorithm-line_intersection/
//http://www.gisdeveloper.co.kr/?p=89
// Counter Clock Wise ccw알고리즘


const vectorLineArray: [THREE.Vector2, THREE.Vector2][] = lineArray.map(
    ([start, end]) => [
        new THREE.Vector2(start[0], start[1]),
        new THREE.Vector2(end[0], end[1]),
    ],
);
const crossProduct = (p1: THREE.Vector2, p2: THREE.Vector2, p3: THREE.Vector2) => {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}


const areSegmentsIntersecting = (line1: THREE.Vector2[],
    line2: THREE.Vector2[],) => {
    const [a, b] = line1;
    const [c, d] = line2;
    const ccw_ab_c = crossProduct(a, b, c);
    const ccw_ab_d = crossProduct(a, b, d);
    const ccw_cd_a = crossProduct(c, d, a);
    const ccw_cd_b = crossProduct(c, d, b);

    if (ccw_ab_c * ccw_ab_d <= 0 && ccw_cd_a * ccw_cd_b <= 0) {
        return true;
    }
    return false;
}
const CheckCrossLine = () => {

    const { scene } = useThree()

    const result = isIntersectFromPoints(lineArray[0], lineArray[1])
    const newResult = areSegmentsIntersecting(vectorLineArray[0], vectorLineArray[1])
    console.log(result, newResult)

    return (
        <>
            {lineArray.map((line, index) => (
                <Line
                    key={index}
                    points={[
                        new THREE.Vector3(line[0][0], 1, line[0][1]),
                        new THREE.Vector3(line[1][0], 1, line[1][1]),
                    ]}
                    color="red"
                    lineWidth={2}
                    segments
                />
            ))}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="gray" side={THREE.DoubleSide} />
            </mesh>
        </>
    );
};

export default CheckCrossLine;