import { Line } from '@react-three/drei';
import * as THREE from "three"
import { isIntersectFromPoints, isPointOnLine } from '../utils/collectFun';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { modelAtom } from '../utils/atom';
import { ConvexHull } from 'three/examples/jsm/Addons.js';
type Point2D = [number, number];
type Point3D = [number, number, number];

const roomPoint: Point2D[] = [
    [3.1679208290735614, 1.0676378852121575],
    [1.1359496777171083, 1.0818637521514691],
    [1.1637169242286514, -0.14416962530295616],
    [-3.7514122353386616, -0.1040531736718628],
    [-3.7404402574282383, 4.709813234226702],
    [3.1458731169374294, 4.690934263659383],
    [3.163148624080965, 1.0914892211385294],
];

const masterRoom: Point2D[] = [
    [-4.294347553547738, 4.607913418550377],
    [-4.20627968333865, -0.04620241872076547],
    [-8.155577040673885, -0.1301539113372543],
    [-8.169466228359557, 4.636475519934749],
    [-4.287239821678524, 4.692289375564105],
]

const alphaRoom: Point2D[] = [
    [3.2050294228299965, 4.561557282127942],
    [3.1161075851584683, 1.0338200032881337],
    [1.5658398436651169, 1.039513247954269],
    [1.5086272633106006, 4.657032551449353],
    [3.276646203063997, 4.6658227944589825]
]

const bedRoom1: Point2D[] = [

    [6.6393446294581056, 0.979095050403372],
    [6.567667876402825, 4.670969795489089],
    [9.371569343004019, 4.595773901067477],
    [9.39850672379448, 1.2412015806742098],
    [7.348498594905954, 1.340498517008008],
    [7.3418424219951675, 0.983810327425368]
]

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
    [-8.230216574996533, 3.1],
    [-8.232147823553861, 1.944],
    [-8.23407907211119, 1.3276633889790315],
    [-5.655633960479831, 1.326024853038546],
    [-5.66, 1.2148021812932388],
    [-8.21364198328017, 1.215492988968255],
    [-8.232138202994427, -0.1485398630016327],
    [-6.712308172602971, -0.1368040241752686],
    [-6.7176945968190545, -0.29003598329584546],
    [-9.378789933394248, -0.2887663580720321],
    [-9.38449275159232, -2.2097976214654085],
    [-8.77205460119885, -2.8123005296509875],
    [-5.510008213504058, -2.8250470997558232],
    [-5.512036496863712, -0.29782761247981293],
    [-5.974714609062275, -0.3088554709000104],
    [-5.972957705554541, -0.16751257924019147],
    [-5.301696125516181, -0.1484145168592349],
    [-5.308268437209603, -0.46823405233231463],
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
    [-2.7531898947502764, -0.13220593978349582],
    [-2.717708712753401, -4.38927965084393],
    [1.1818292155937027, -4.394035035646912],
    [1.1818413570698985, -0.10865066211980604],
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
    [7.473350264675792, -2.3624399511704137],
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
    [28, 29, 6],
    [29, 30, 5],
    [30, 31, 5],
    [31, 32, 5],
    [32, 33, 7],
    [33, 34, 7],
    [34, 35, 7],
    [35, 36, 8],
    [36, 37, 8],
    [37, 38, 8],
    [38, 39, 8],
    [39, 40, 8],
    [40, 41, 8],
    [41, 42, 8],
    [42, 43, 8],
    [43, 44, 7],
    [44, 45, 9],
    [45, 46, 9],
    [46, 47, 9],
    [47, 48, 9],
    [48, 49, 9],
    [49, 50, 9],
    [50, 51, 9],
    [51, 52, 9],
    [52, 53, 9],
    [53, 54, 9],
    [54, 55, 9],
    [55, 56, 9],
    [56, 57, 7],
    [57, 58, 4],
    [58, 59, 10],
    [59, 60, 10],
    [60, 61, 10],
    [61, 62, 4],
    [62, 63, 1],
    [63, 64, -1],
    [64, 65, -1],
    [65, 66, -1],
    [66, 67, -1],
    [67, 68, -1],
    [68, 69, -1],
    [69, 70, -1],
    [70, 71, 1],
    [71, 72, 0],
    [72, 0, 0]
]

const bed2Mesh = {
    minX: 6.112507203012343, maxX: 6.362489363760102, minY: 1.1725017856508466, maxY: 4.732323544129732
}

const bed2FrameMesh = {
    minX: 6.338491431225919, maxX:
        6.36250860487763, minY:
        1.4482526176576578, maxY: 4.003315868565173
}

const bed1Mesh = {
    minX: 6.496830691122781, maxX: 6.566571905372811,
    minY: 3.3928398684427736, maxY: 3.462581150289729
}

const bed1MeshWall = {
    minX: 6.529773965063485, maxX: 7.089774064028391,
    minY:
        4.72864707768928, maxY: 4.73364726410977
}

const PolygonPoint = () => {

    const glbModel = useAtomValue(modelAtom)
    const [navPoint, setNavPoint] = useState<[number, number][]>([])
    const { scene } = useThree()
    const [objectMesh, setObjectMesh] = useState<THREE.Mesh>()
    const [meshPolygon, setMeshPolygon] = useState<[number, number][]>([])
    const isPointInPolygon = (point: Point2D, polygon: Point2D[]): boolean => {
        const x = point[0],
            y = point[1];
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0],
                yi = polygon[i][1];
            const xj = polygon[j][0],
                yj = polygon[j][1];
            const intersect =
                yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    };
    function getOrderedPolygonFromGeometry(geometry: THREE.BufferGeometry): Point2D[] {
        const edges = new THREE.EdgesGeometry(geometry);
        const pos = edges.attributes.position as THREE.BufferAttribute;

        // 1) 세그먼트 쌍 배열로 수집
        const segments: [Point2D, Point2D][] = [];
        for (let i = 0; i < pos.count; i += 2) {
            const a: Point2D = [pos.getX(i), pos.getZ(i)];
            const b: Point2D = [pos.getX(i + 1), pos.getZ(i + 1)];
            segments.push([a, b]);
        }

        // 2) 정점별 인접 리스트 생성
        const key = (p: Point2D) => `${p[0]},${p[1]}`;
        const adj = new Map<string, Point2D[]>();
        for (const [a, b] of segments) {
            const ka = key(a), kb = key(b);
            if (!adj.has(ka)) adj.set(ka, []);
            if (!adj.has(kb)) adj.set(kb, []);
            adj.get(ka)!.push(b);
            adj.get(kb)!.push(a);
        }

        // 3) 루프 시작점 찾기 (임의의 정점)
        const startKey = key(segments[0][0]);
        let current = segments[0][0];
        let prevKey: string | null = null;
        const polygon: Point2D[] = [];

        // 4) 순회하며 폴리곤 점 순서대로 수집
        do {
            polygon.push(current);
            const neighbors = adj.get(key(current))!;
            // 이전 정점이 아닌 다음 정점 선택
            const next = neighbors.find(p => key(p) !== prevKey);
            if (!next) break;
            prevKey = key(current);
            current = next;
        } while (key(current) !== startKey);

        return polygon;
    }

    useEffect(() => {
        if (scene && glbModel) {
            // const boundingBox = new THREE.Box3().setFromObject(glbModel);
            const mesh = glbModel.children[0] as THREE.Mesh
            const geometry = mesh.geometry as THREE.BufferGeometry;
            const polygon: Point2D[] = getOrderedPolygonFromGeometry(geometry);
            console.log("edgesGeom", polygon)
            setMeshPolygon(polygon)
            const newPoint = meshInsidePoint(polygon, geometry.boundingBox?.min, geometry.boundingBox?.max)

            setNavPoint(newPoint)
            // 라인 머티리얼 생성
            // const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });

            // LineSegments로 테두리 메쉬 생성
            // const outline = new THREE.LineSegments(edgesGeom, lineMat);

            // 씬에 추가
            // scene.add(outline);

            // const newPoint = generateGridPointsInsidePolygon(glbModel.children[0].geometry.attributes.position.array)
            // const { min, max } = boundingBox
            // const navPoint = boxPoint(min, max)
            // if (newPoint) {
            //     setNavPoint(newPoint)
            // }
        }
    }, [glbModel, scene])


    const getBoundingBox = (polygon: Point2D[]): {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    } => {

        const xs = polygon.map((p) => p[0]);
        const ys = polygon.map((p) => p[1]);

        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
        };
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

    const generateGridPointsInsidePolygon = (
        polygon: Point2D[],
    ): Point2D[] => {
        const points: Point2D[] = [];
        const { minX, maxX, minY, maxY } = getBoundingBox(polygon);

        for (let x = minX; x <= maxX; x += maxX === minX || maxX - minX > 0.1 ? 0.1 : (maxX - minX) / 2) {
            for (let y = minY; y <= maxY; y += maxY === minY || maxY - minY > 0.1 ? 0.1 : (maxY - minY) / 2) {
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
    //     const resultArray = []
    //     for (const roomPoint of roomArray) {
    //         for (const boxPoint of objectArray) {
    //             for (const wallPointIndex of walls) {
    //                 const result = isIntersectFromPoints(
    //                     [roomPoint, boxPoint],
    //                     [wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]]]
    //                 );
    //                 if (result) {
    //                     continue
    //                 } else {
    //                     resultArray.push(result)
    //                 }
    //             }
    //         }
    //     }
    //     if (resultArray.every(child => child === false)) {
    //         return true
    //     } else {
    //         return false;
    //     }
    // };

    const checkBoxToObject = (roomArray: Point2D[], objectArray: Point2D[]): boolean => {
        for (const roomPoint of roomArray) {
            for (const boxPoint of objectArray) {
                // 이 경로가 어떤 벽과 교차하는지 추적
                let intersectsAnyWall = false;
                for (const wallPointIndex of walls) {
                    const result = isIntersectFromPoints(
                        [roomPoint, boxPoint],
                        [wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]]]
                    );
                    if (result) {
                        const lineInPoint = isPointOnLine(boxPoint, wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]])
                        console.log("lineInPoint", lineInPoint)
                        // 하나라도 교차하면 이 쌍은 유효하지 않음
                        // if (isPointOnLine(boxPoint, wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]])) {
                        //     intersectsAnyWall = false;
                        //     break;
                        // } else {
                        intersectsAnyWall = true;
                        break;
                        // }

                    }
                }
                if (!intersectsAnyWall) {
                    // 모든 벽과 교차하지 않는 경로 발견
                    return true;
                }
            }
        }
        // 유효한 경로가 없음
        return false;
    };

    // const newBoxPoints = boxPoint()


    // const generatedPoints = generateGridPointsInsidePolygon(roomPoint);
    // const masterRoomPoints = generateGridPointsInsidePolygon(masterRoom);
    // const alphaRoomPoint = generateGridPointsInsidePolygon(alphaRoom);
    // const bedRoom1Point = generateGridPointsInsidePolygon(bedRoom1);
    const Polygon = ({ points }: { points: Point2D[] }) => {
        const linePoints = points
            .map((p) => new THREE.Vector3(p[0], p[1], 0))
            .concat([new THREE.Vector3(points[0][0], points[0][1], 0)]);
        return <Line points={linePoints} rotation={[Math.PI / 2, 0, 0]} color="blue" lineWidth={2} />;
    };

    const Points = ({ points }: { points: Point2D[] }) => {
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
                <pointsMaterial color="red" size={0.05} />
            </points>
        );
    };



    // if (generatedPoints && newBoxPoints) {
    //     const occlusionResult = checkBoxToObject(generatedPoints, newBoxPoints)
    //     console.log("generatedPoints", occlusionResult)
    // }

    // if (masterRoomPoints && newBoxPoints) {
    //     const occlusionResult = checkBoxToObject(masterRoomPoints, newBoxPoints)
    //     console.log("masterRoomPoints", occlusionResult)
    // }
    // if (alphaRoomPoint && newBoxPoints) {
    //     const occlusionResult = checkBoxToObject(alphaRoomPoint, newBoxPoints)
    //     console.log("alphaRoomPoint", occlusionResult)
    // }

    // if (bedRoom1Point && newBoxPoints) {
    //     const occlusionResult = checkBoxToObject(bedRoom1Point, newBoxPoints)
    //     console.log("bedRoom1Point", occlusionResult)
    // }






    return (
        <>
            {/* <Polygon points={roomPoint} />
            <Polygon points={masterRoom} />
            <Polygon points={alphaRoom} />
            <Polygon points={bedRoom1} /> */}
            {/* <Points points={generatedPoints} />
            <Points points={masterRoomPoints} /> */}
            {/* {newBoxPoints && <Points points={newBoxPoints} />} */}

            {/* <Points points={bedRoom1Point} /> */}
            {navPoint.length > 0 && <Points points={navPoint} />}
            {meshPolygon.length > 0 && <Polygon points={meshPolygon} />}
            {/* {walls.map((line, index) => (

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
            ))} */}
        </>
    );
};

export default PolygonPoint;