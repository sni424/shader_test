import { Html, Line, Sphere } from '@react-three/drei';

import React from 'react'
import * as THREE from "three"

const positions: [number, number, number, number, number, number][] = [
    [1.15, 0.004, 1.044, 1.15, 0.004, 4.724],
    [1.15, 2.413, 4.732, 1.15, 0.006, 4.72],
    [1.163, 0.005, 4.721, -3.814, 0.005, 4.721],
];

const positions1: [number, number, number, number, number, number][] = [
    [-2.740, 0.019, -0.202,
    -2.740, 0.019, -2.032],
    [-2.750, 1.860, -2.032,
    -2.750, 0.016, -2.032],
    [-2.763, 0.89, -4.38,
        1.182, 0.89, -4.38,],
    [1.182, 0.89, -4.40,
        1.182, 0.89, -3.711],
    [1.182, 0.003, -3.705,
        1.182, 2.386, -3.705],
    [1.16, 0.008, -3.705,
        1.16, 0.008, -0.129],
];

const positions2: [number, number, number, number, number, number][] = [
    [-9.383, 1.687, -0.282,
    -9.383, 1.687, -2.209],
    [-9.383, 1.687, -2.209,
    -8.77, 1.687, -2.828],
    [-8.77, 1.687, -2.828,
    -5.490, 1.687, -2.828],
    [-9.35, 2.389, -1.818,
    -9.35, 0.004, -1.818],
    [-6.80, 1.2, -0.345,
    -9.397, 1.2, -0.345],
    [-5.615, 1.386, -2.832,
    -5.615, 1.386, -0.282],

];

const axisPosition = (axis: string, child: number[]): [number, number, number] => {
    switch (axis) {
        case "x":
            return [(child[0] + child[3]) / 2, (child[1] + child[4]) / 2 + 0.2, (child[2] + child[5]) / 2 - 0.1];
        case "y":
            return [(child[0] + child[3]) / 2, (child[1] + child[4]) / 2 + 0.2, (child[2] + child[5]) / 2 - 0.1];
        default:
            return [(child[0] + child[3]) / 2, (child[1] + child[4]) / 2 + 0.2, (child[2] + child[5]) / 2 - 0.1];
    }
};

const axisColor = (axis: string): string => {
    switch (axis) {
        case "x":
            return "red";
        case "y":
            return "green";
        default:
            return "blue";
    }
};


const PredrawnLine = ({ dimensionsClick, room }: { dimensionsClick: boolean, room: string }) => {
    const data = room === "거실" ? positions : room === "주방" ? positions1 : positions2;
    return (
        <>

            {dimensionsClick && data.map((child, index) => {
                const start = new THREE.Vector3(child[0], child[1], child[2]);
                const end = new THREE.Vector3(child[3], child[4], child[5]);
                const length = start.distanceTo(end); // 거리 계산
                const deltaX = Math.abs(child[3] - child[0]);
                const deltaY = Math.abs(child[4] - child[1]);
                const axis = deltaX > 0 ? "x" : deltaY > 0 ? "y" : "z";

                return (
                    <React.Fragment key={`line_${index}`}>
                        <Sphere
                            args={[0.01, 32, 32]}
                            position={[child[0], child[1], child[2]]}

                        >
                            <meshStandardMaterial color={axisColor(axis)} />
                        </Sphere>


                        <Line
                            points={[
                                [child[0], child[1], child[2]],
                                [child[3], child[4], child[5]],
                            ]}
                            color={axisColor(axis)}
                            lineWidth={2}
                            segments
                        // dashed={true}
                        // dashSize={0.1} // 점선 길이
                        // gapSize={0.1}  // 점선 간격
                        // dashScale={1}  // 점선 크기 조정
                        />
                        <Sphere
                            args={[0.01, 32, 32]}
                            position={[child[3], child[4], child[5]]}
                            color={axisColor(axis)}
                        >
                            <meshStandardMaterial color={axisColor(axis)} />
                        </Sphere>
                        <mesh position={axisPosition(axis, child) as [number, number, number]}>
                            <Html>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        backgroundColor: "white",
                                        padding: "4px 8px",
                                        whiteSpace: "nowrap",
                                        borderRadius: "4px",
                                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    <h1 style={{ fontSize: "16px", color: "black", margin: 0, textAlign: "center" }}>
                                        {length.toFixed(2)} m
                                    </h1>
                                </div>
                            </Html>
                        </mesh>
                    </React.Fragment>
                );
            })}
        </>
    );
};

export default PredrawnLine;