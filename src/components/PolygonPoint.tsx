import { Line } from '@react-three/drei';
import * as THREE from "three"
import { isIntersectFromPoints, newRoomColorString } from '../utils/collectFun';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { modelAtom } from '../utils/atom';
// import { ConvexHull } from 'three/examples/jsm/Addons.js';
type Point2D = [number, number];
// type Point3D = [number, number, number];


const wallPoint: Point2D[] = [
    [8.47064304626679, -2.3914815573361468],
    [8.50549367382446, -0.139],
    [8.540344301382131, 1.0343658240739768],
    [7.373327471577346, 1.041307987979887],
    [7.373, 1.185],
    [9.467511664089056, 1.1870884629265026],
    [9.482200927815372, 4.724590876274765],
    [6.485136127073891, 4.733554585667719],
    [6.503437770603397, 2.024691410111702],
    [6.595207449311281, 2.019057993091214],
    [6.589647909019673, 1.1633542515101227],
    [6.5626353575704615, 1.0299057258853832],
    [4.54610367965173, 1.0349448565191686],
    [4.540891131458009, 1.159529469467849],
    [6.354, 1.1887722205126308],
    [6.347348046285421, 4.724913180901986],
    [3.67788443524693, 4.713452056606256],
    [3.676474502217091, 2.006838849443403],
    [3.7733675017882504, 2.0299339953076343],
    [3.743658306024571, 1.0437607627184315],
    [3.3642211804492295, 1.0369890438717095],
    [3.397, 4.729132925126728],
    [1.219, 4.722147689030827],
    [-3.8091157412694923, 4.7151624529349245],
    [-3.808278098299742, 0.8273740028503656],
    [-4.153, 0.823],
    [-4.171216579505433, 4.711455201322984],
    [-8.226354077881876, 4.713089893104126],
    [-8.24293370305553, 3.2149231590120895],
    [-8.539675586424252, 3.211774963178458],
    [-8.551890737085788, 3.468554729187286],
    [-9.593401808297768, 3.5336416127004],
    [-9.523858318597707, 2.4166218432556352],
    [-9.287634133835386, 2.43128386275402],
    [-9.253061185655097, 1.5179503464634996],
    [-9.505621277960538, 1.5024760573648557],
    [-9.522292676273441, -0.029477834228176014],
    [-8.645517974288001, 0.0101463008583067],
    [-8.625033530118383, 1.8176178809647576],
    [-8.246367523371456, 1.8135629607620707],
    [-8.23407907211119, 1.3276633889790315],
    [-5.655633960479831, 1.326024853038546],
    [-5.66, 1.2148021812932388],
    [-8.21364198328017, 1.215492988968255],
    [-8.232138202994427, -0.1485398630016327],
    [-6.712308172602971, -0.1368040241752686],
    [-6.717709551565815, -0.3020549689307602],
    [-9.435230260594155, -0.2037029707147464],
    [-9.389088584373972, -2.2160076491876604],
    [-8.771468449894455, -2.8215844660268075],
    [-5.50504487799236, -2.804497974218382],
    [-5.52342174342715, -0.33697209051469557],
    [-5.973302021429329, -0.3135771224034981],
    [-5.9469212550855906, -0.12796322519274733],
    [-5.31663114221851, -0.12426281157497332],
    [-5.309828067592773, -2.699750915810092],
    [-4.281312281422315, -2.6942577942440487],
    [-4.29065202611422, -1.7915577529451148],
    [-4.020914940253972, -1.7878872665964984],
    [-4.013734830640719, -1.1244306103706578],
    [-3.8512027972322955, -1.1284014293192874],
    [-3.839315119686336, -0.48018946306969834],
    [-4.589268585869148, -0.4712827460936765],
    [-4.594437781471513, -0.12032752877206085],
    [-5.100677346584275, -0.10299913933466098],
    [-5.088630754714743, -0.04811885724222709],
    [-3.831, -0.09016239851286145],
    [-3.8157842762658176, -0.15580551537493903],
    [-3.508616911674922, -0.15577802177032257],
    [-3.5044082637196468, -2.7434426078550054],
    [-2.758352210171857, -2.7746377748759734],
    [-2.7568202078571793, -2.889294292364327],
    [-3.8034505049782665, -2.882677380435239],
    [-3.7946839543573962, -3.494616926805112],
    [-3.3143688144835064, -3.518123036127567],
    [-3.319706456156121, -3.5716448289999287],
    [-4.054570201209506, -3.5473267239853397],
    [-4.771958112510788, -3.5244426237617246],
    [-5.440994913754895, -3.525606057775457],
    [-5.433244532850648, -4.561920864988817],
    [-4.087861695112663, -4.545945661963804],
    [-4.077363230834872, -4.073270294720789],
    [-3.8002873443442695, -4.137268059401542],
    [-3.808292364701966, -4.437383865599656],
    [-2.916421674464453, -4.422144347192604],
    [-2.933488852709246, -3.6267628978332764],
    [-2.7198364097221943, -3.71395445863096],
    [-2.7147605617437263, -4.378237704526104],
    [1.1818292155937027, -4.394035035646912],
    [1.1932182084199778, -3.567887799606652],
    [1.873775290781448, -3.5818580971594804],
    [1.8540866094620678, -4.422322525265182],
    [3.9399058549210078, -4.4147113432887135],
    [3.940198372354564, -2.648768992893775],
    [1.189730935086208, -2.7558821606364905],
    [1.189388405638293, -0.11716850376572774],
    [1.8804027729291326, -0.12340849148065725],
    [1.9086247155900942, -0.28829434072393667],
    [1.5307236140212441, -0.31333506258450483],
    [1.4877051851197525, -2.53164233730907],
    [2.9741027593446523, -2.436133728077291],
    [3.0315139378432105, -0.28292817326864256],
    [2.6627111178803533, -0.30416091826251374],
    [2.6763860337209273, -0.11199720931036339],
    [3.222440211143511, -0.11867900327026354],
    [3.2254304708838544, -0.25290740910235754],
    [3.2144325366862723, -1.7930565491758481],
    [3.869307178088451, -1.794642761391097],
    [3.922214381546425, -1.6000893467422315],
    [4.428626022720943, -1.5737430138464645],
    [4.446516348551407, -0.3294676075876765],
    [3.9352504814354545, -0.3368160505931307],
    [3.9337191632081767, -0.12665189164128188],
    [7.380139560021886, -0.11913573443496833],
    [7.473350264675792, -2.3624399511704137]
]

const walls: [number, number, number][] = [
    [0, 1, 0],
    [1, 2, 1],
    [2, 3, 1],
    [3, 4, 2],
    [4, 5, 2],
    [5, 6, 2],
    [6, 7, 2],
    [7, 8, 2],
    [8, 9, 2],
    [9, 10, 2],
    [10, 11, 1],
    [11, 12, 1],
    [12, 13, 1],
    [13, 14, 3],
    [14, 15, 3],
    [15, 16, 3],
    [16, 17, 3],
    [17, 18, 3],
    [18, 19, 3],
    [19, 20, 1],
    [20, 21, 4],
    [21, 22, 4],
    [22, 23, 4],
    [23, 24, 4],
    [24, 25, 5],
    [25, 26, 5],
    [26, 27, 5],
    [27, 28, 5],
    [28, 29, -1],
    [29, 30, -1],
    [30, 31, -1],
    [31, 32, -1],
    [32, 33, -1],
    [33, 34, -1],
    [34, 35, -1],
    [35, 36, -1],
    [36, 37, -1],
    [37, 38, -1],
    [38, 39, -1],
    [39, 40, 5],
    [40, 41, 5],
    [41, 42, 5],
    [42, 43, 6],
    [43, 44, 6],
    [44, 45, 6],
    [45, 46, -1],
    [46, 47, -1],
    [47, 48, -1],
    [48, 49, -1],
    [49, 50, -1],
    [50, 51, -1],
    [51, 52, -1],
    [52, 53, -1],
    [53, 54, 7],
    [54, 55, 7],
    [55, 56, 7],
    [56, 57, 7],
    [57, 58, 7],
    [58, 59, 7],
    [59, 60, 7],
    [60, 61, 7],
    [61, 62, 7],
    [62, 63, 7],
    [63, 64, 7],
    [64, 65, 7],
    [65, 66, 6],
    [66, 67, -1],
    [67, 68, -1],
    [68, 69, 8],
    [69, 70, -1],
    [70, 71, -1],
    [71, 72, -1],
    [72, 73, -1],
    [73, 74, -1],
    [74, 75, -1],
    [75, 76, -1],
    [76, 77, -1],
    [77, 78, -1],
    [78, 79, -1],
    [79, 80, -1],
    [80, 81, -1],
    [81, 82, -1],
    [82, 83, -1],
    [83, 84, -1],
    [84, 85, -1],
    [85, 86, -1],
    [86, 87, -1],
    [87, 88, -1],
    [88, 89, -1],
    [89, 90, -1],
    [90, 91, -1],
    [91, 92, -1],
    [92, 93, -1],
    [93, 94, -1],
    [94, 95, -1],
    [95, 96, -1],
    [96, 97, -1],
    [97, 98, -1],
    [98, 99, -1],
    [99, 100, -1],
    [100, 101, -1],
    [101, 102, -1],
    [102, 103, -1],
    [103, 104, -1],
    [104, 105, 1],
    [105, 106, -1],
    [106, 107, -1],
    [107, 108, -1],
    [108, 109, -1],
    [109, 110, -1],
    [110, 111, -1],
    [111, 112, -1],
    [112, 113, 1],
    [113, 114, 0],
    [114, 0, 0]
]

// const bed2Mesh = {
//     minX: 6.112507203012343, maxX: 6.362489363760102, minY: 1.1725017856508466, maxY: 4.732323544129732
// }

// const bed2FrameMesh = {
//     minX: 6.338491431225919, maxX:
//         6.36250860487763, minY:
//         1.4482526176576578, maxY: 4.003315868565173
// }

// const bed1Mesh = {
//     minX: 6.496830691122781, maxX: 6.566571905372811,
//     minY: 3.3928398684427736, maxY: 3.462581150289729
// }

// const bed1MeshWall = {
//     minX: 6.529773965063485, maxX: 7.089774064028391,
//     minY:
//         4.72864707768928, maxY: 4.73364726410977
// }

const PolygonPoint = () => {

    const glbModel = useAtomValue(modelAtom)
    const [navPoint, setNavPoint] = useState<[number, number][]>([])
    const { scene } = useThree()
    const [objectBoxPoint, setObjectBoxPoint] = useState<[number, number][][]>([])
    const [meshPolygon, setMeshPolygon] = useState<[number, number][]>([])
    // 포인트가 폴리곤 내부에 있는지 확인하는 함수
    const isPointInPolygon = (point: Point2D, polygon: Point2D[]): boolean => {
        // 포인트의 x, y 좌표를 추출
        const x = point[0], y = point[1];

        // 포인트가 폴리곤 내부에 있는지 여부를 추적 (초기값은 false)
        let inside = false;

        // 폴리곤의 모든 변을 순회
        // i는 현재 정점, j는 이전 정점 (마지막 정점과 첫 번째 정점을 연결하기 위해 j 사용)
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            // 현재 정점(i)의 x, z 좌표
            const xi = polygon[i][0], yi = polygon[i][1];
            // 이전 정점(j)의 x, z 좌표
            const xj = polygon[j][0], yj = polygon[j][1];

            // Ray Casting 알고리즘의 교차 조건 확인
            // 1. yi와 yj가 y를 기준으로 서로 다른 방향에 있는지 확인 (yi > y !== yj > y)
            // 2. 포인트의 x 좌표가 변의 x 범위 내에 있는지 확인
            const intersect =
                yi > y !== yj > y && // y 좌표가 변의 y 범위 사이에 있는지
                x < ((xj - xi) * (y - yi)) / (yj - yi) + xi; // x 좌표가 변의 방정식 왼쪽에 있는지

            // 교차가 발생하면 inside 값을 토글 (true ↔ false)
            if (intersect) inside = !inside;
        }

        // 최종적으로 inside 값 반환 (true면 내부, false면 외부)
        return inside;
    };


    // function getOrderedPolygonFromGeometry(geometry: THREE.BufferGeometry): Point2D[] {
    //     const edges = new THREE.EdgesGeometry(geometry);
    //     const pos = edges.attributes.position as THREE.BufferAttribute;

    //     // 1) 세그먼트 쌍 배열로 수집
    //     const segments: [Point2D, Point2D][] = [];
    //     for (let i = 0; i < pos.count; i += 2) {
    //         const a: Point2D = [pos.getX(i), pos.getZ(i)];
    //         const b: Point2D = [pos.getX(i + 1), pos.getZ(i + 1)];
    //         segments.push([a, b]);
    //     }

    //     // 2) 정점별 인접 리스트 생성
    //     const key = (p: Point2D) => `${p[0]},${p[1]}`;
    //     const adj = new Map<string, Point2D[]>();
    //     for (const [a, b] of segments) {
    //         const ka = key(a), kb = key(b);
    //         if (!adj.has(ka)) adj.set(ka, []);
    //         if (!adj.has(kb)) adj.set(kb, []);
    //         adj.get(ka)!.push(b);
    //         adj.get(kb)!.push(a);
    //     }

    //     // 3) 루프 시작점 찾기 (임의의 정점)
    //     const startKey = key(segments[0][0]);
    //     let current = segments[0][0];
    //     let prevKey: string | null = null;
    //     const polygon: Point2D[] = [];

    //     // 4) 순회하며 폴리곤 점 순서대로 수집
    //     do {
    //         polygon.push(current);
    //         const neighbors = adj.get(key(current))!;
    //         // 이전 정점이 아닌 다음 정점 선택
    //         const next = neighbors.find(p => key(p) !== prevKey);
    //         if (!next) break;
    //         prevKey = key(current);
    //         current = next;
    //     } while (key(current) !== startKey);

    //     return polygon;
    // }



    // function getContourPoints2D(mesh: THREE.Mesh): [number, number][] {
    //     const geometry = mesh.geometry as THREE.BufferGeometry;
    //     const edges = new THREE.EdgesGeometry(geometry);
    //     const posAttr = edges.attributes.position;

    //     // 2D 점 배열 생성 (XZ 평면 기준)
    //     const points: [number, number][] = [];

    //     for (let i = 0; i < posAttr.count; i++) {
    //         points.push([
    //             posAttr.getX(i),  // X 좌표
    //             posAttr.getZ(i)   // Z 좌표 (Y 대신 Z 사용)
    //         ]);
    //     }

    //     // 중복 제거
    //     const uniquePoints: [number, number][] = [];
    //     const threshold = 0.0001;
    //     const seen = new Set<string>();

    //     for (const point of points) {
    //         // 소수점 아래 5자리까지 반올림하여 키 생성
    //         const key = `${point[0].toFixed(5)},${point[1].toFixed(5)}`;

    //         if (!seen.has(key)) {
    //             seen.add(key);
    //             uniquePoints.push(point);
    //         }
    //     }

    //     return uniquePoints;
    // }

    function getContourSegments2D(mesh: THREE.Mesh): [number, number][][] {
        const geometry = mesh.geometry as THREE.BufferGeometry;
        const edges = new THREE.EdgesGeometry(geometry);
        const posAttr = edges.attributes.position;

        // 선분 배열 생성 (XZ 평면 기준)
        const segments: [number, number][][] = [];

        // 2개씩 짝을 이루어 선분 생성
        for (let i = 0; i < posAttr.count; i += 2) {
            const start: [number, number] = [posAttr.getX(i), posAttr.getZ(i)];
            const end: [number, number] = [posAttr.getX(i + 1), posAttr.getZ(i + 1)];
            segments.push([start, end]);
        }

        return segments;
    }

    function getContourPolygon2D(mesh: THREE.Mesh): [number, number][] {
        const segments = getContourSegments2D(mesh);
        if (segments.length === 0) return [];

        // 연결된 정점 순서로 정렬
        const polygon: [number, number][] = [];
        const visited = new Set<number>();

        // 첫 번째 선분의 시작점과 끝점 추가
        polygon.push(segments[0][0]);
        polygon.push(segments[0][1]);
        visited.add(0);

        let currentPoint = segments[0][1];
        const distance = 0.0001
        // 남은 선분들 연결
        while (visited.size < segments.length) {
            let found = false;

            for (let i = 0; i < segments.length; i++) {
                if (visited.has(i)) continue;

                const [start, end] = segments[i];

                // 시작점과 현재 점이 같은 경우
                if (Math.abs(start[0] - currentPoint[0]) < distance &&
                    Math.abs(start[1] - currentPoint[1]) < distance) {
                    polygon.push(end);
                    currentPoint = end;
                    visited.add(i);
                    found = true;
                    break;
                }

                // 끝점과 현재 점이 같은 경우
                if (Math.abs(end[0] - currentPoint[0]) < distance &&
                    Math.abs(end[1] - currentPoint[1]) < distance) {
                    polygon.push(start);
                    currentPoint = start;
                    visited.add(i);
                    found = true;
                    break;
                }
            }

            // 연결된 선분을 찾지 못했다면 루프 종료
            if (!found) break;
        }

        return polygon;
    }



    useEffect(() => {
        if (scene && glbModel.length > 1) {
            glbModel.forEach(child => {
                child.children.forEach(data => {
                    if (data instanceof THREE.Mesh) {
                        if (data.name === "nav") {
                            const mesh = data
                            const geometry = mesh.geometry as THREE.BufferGeometry;
                            if (!geometry.boundingBox) {
                                return console.warn("no geometry")
                            }
                            const polygon: Point2D[] = getContourPolygon2D(mesh);
                            const newPoint = meshInsidePoint(polygon, geometry.boundingBox?.min, geometry.boundingBox?.max)

                            setNavPoint(newPoint)

                            setMeshPolygon(polygon)
                        } else {
                            const boundingBox = new THREE.Box3().setFromObject(data);

                            const { min, max } = boundingBox

                            // const newPoint = meshInsidePoint(wallPoint, min, max)

                            const objectBoxPoint = boxPoint(min, max)

                            if (objectBoxPoint) {
                                setObjectBoxPoint(pre => [...pre, objectBoxPoint])
                            }
                        }
                    } else if (data instanceof THREE.Group) {
                        for (const child of data.children) {
                            if (child instanceof THREE.Mesh) {
                                const boundingBox = new THREE.Box3().setFromObject(child);

                                const { min, max } = boundingBox


                                if (child.name.includes("침실1dp004_17")) {
                                    const newPoint = isMeshInsidePoint(wallPoint, min, max)
                                    console.log("newPoint", newPoint, child.name, boundingBox, wallPoint)
                                    const objectBoxPoint = boxPoint(min, max)

                                    if (objectBoxPoint) {
                                        setObjectBoxPoint(pre => [...pre, objectBoxPoint])
                                    }
                                }

                            }
                        }
                    }
                })
            })


        }
    }, [glbModel, scene])

    const isMeshInsidePoint = (
        polygon: Point2D[],
        min: THREE.Vector3,
        max: THREE.Vector3,
    ): boolean => {


        for (let x = min.x; x <= max.x; x += max.x === min.x || max.x - min.x > 0.1 ?
            0.1 : 0.01) {

            for (let y = min.z; y <= max.z; y += min.z || max.z - min.z > 0.1
                ? 0.1 : 0.01) {
                const point: Point2D = [x, y];


                if (isPointInPolygon(point, polygon)) {

                    return true;
                }
            }
        }
        return false
    };

    const isMeshOutsidePoint = (
        polygon: Point2D[],
        min: THREE.Vector3,
        max: THREE.Vector3,
    ): boolean => {



        for (let x = min.x; x <= max.x; x += max.x === min.x || max.x - min.x > 0.1 ?
            0.1 : (max.x - min.x) / 2) {
            for (let y = min.z; y <= max.z; y += max.z === min.z || max.z - min.z > 0.1
                ? 0.1 : (max.y - min.y) / 2) {
                const point: Point2D = [x, y];
                if (!isPointInPolygon(point, polygon)) {
                    return true
                }
            }
        }
        return false;
    };





    const meshInsidePoint = (
        polygon: Point2D[],
        min: THREE.Vector3,
        max: THREE.Vector3,
    ): Point2D[] => {
        const points: Point2D[] = [];


        for (let x = min.x; x <= max.x; x += max.x === min.x || max.x - min.x > 0.1 ?
            0.1 : (max.x - min.x) / 2) {
            for (let y = min.z; y <= max.z; y += max.z === min.z || max.z - min.z > 0.1
                ? 0.1 : (max.y - min.y) / 2) {
                const point: Point2D = [x, y];
                if (isPointInPolygon(point, polygon)) {
                    points.push(point); // 다각형 내부 포인트만 추가
                }
            }
        }
        return points;
    };

    const boxPoint = (min: THREE.Vector3, max: THREE.Vector3) => {
        const points: Point2D[] = [];
        if (!scene) {
            return
        }

        for (let x = min.x; x <= max.x; x += max.x === min.x || max.x - min.x > 0.1 ? 0.1 : (max.x - min.x) / 2) {
            for (let y = min.z; y <= max.z; y += max.z === min.z || max.z - min.z > 0.1 ? 0.1 : (max.z - min.z) / 2) {
                const point: Point2D = [x, y];

                points.push(point);
            }
        }
        return points;
    }



    // const checkBoxToObject = (roomArray: Point2D[], objectArray: Point2D[]): boolean => {
    //     for (const roomPoint of roomArray) {
    //         for (const boxPoint of objectArray) {
    //             // 이 경로가 어떤 벽과 교차하는지 추적
    //             let intersectsAnyWall = false;
    //             for (const wallPointIndex of walls) {
    //                 const result = isIntersectFromPoints(
    //                     [roomPoint, boxPoint],
    //                     [wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]]]
    //                 );
    //                 if (result) {
    //                     // const lineInPoint = isPointOnLine(boxPoint, wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]])

    //                     // 하나라도 교차하면 이 쌍은 유효하지 않음
    //                     // if (isPointOnLine(boxPoint, wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]])) {
    //                     //     intersectsAnyWall = false;
    //                     //     break;
    //                     // } else {
    //                     intersectsAnyWall = true;
    //                     break;
    //                     // }

    //                 }
    //             }
    //             if (!intersectsAnyWall) {
    //                 // 모든 벽과 교차하지 않는 경로 발견
    //                 return true;
    //             }
    //         }
    //     }
    //     // 유효한 경로가 없음
    //     return false;
    // };


    const Polygon = ({ points }: { points: Point2D[] }) => {
        const linePoints = points
            .map((p) => new THREE.Vector3(p[0], p[1], 0))
            .concat([new THREE.Vector3(points[0][0], points[0][1], 0)]);
        return <Line points={linePoints} rotation={[Math.PI / 2, 0, 0]} color="blue" lineWidth={2} />;
    };

    const Points = ({ points, color = "red" }: { points: Point2D[], color: string }) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
                new Float32Array(points.flatMap((p) => [p[0], p[1], 0])),
                3
            )
        );
        return (
            <points geometry={geometry} rotation={[Math.PI / 2, 0, 0]}>
                <pointsMaterial color={color} size={0.05} />
            </points>
        );
    };



    // if (generatedPoints && newBoxPoints) {
    //     const occlusionResult = checkBoxToObject(generatedPoints, newBoxPoints)
    //     console.log("generatedPoints", occlusionResult)
    // }


    // if (meshPolygon && objectBoxPoint.length > 0) {
    //     objectBoxPoint.forEach(child => {
    //         const occlusionResult = checkBoxToObject(meshPolygon, child)
    //         console.log("bedRoom1Point", occlusionResult)
    //     })

    // }






    return (
        <>
            {objectBoxPoint.length > 0 &&
                objectBoxPoint.map((child, index) => {
                    return <Points key={`pointMesh_${index}`} points={child} color={newRoomColorString(index)} />
                })

            }
            {navPoint.length > 0 && <Points points={navPoint} color='red' />}
            {meshPolygon.length > 0 && <Polygon points={meshPolygon} />}
            {walls.map((line, index) => (

                <Line
                    key={index}
                    points={[
                        new THREE.Vector3(wallPoint[line[0]][0], 0, wallPoint[line[0]][1]),
                        new THREE.Vector3(wallPoint[line[1]][0], 0, wallPoint[line[1]][1]),
                    ]}
                    color="red"
                    lineWidth={2}
                    segments
                />
            ))}
        </>
    );
};

export default PolygonPoint;