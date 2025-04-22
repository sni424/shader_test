import { Line } from '@react-three/drei';
import * as THREE from "three"
import { isIntersectFromPoints } from '../utils/collectFun';
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

const wallPoint: Point2D[] = [
    [8.47064304626679, -2.3914815573361468],
    [8.540344301382131, 1.0343658240739768],
    [7.373327471577346, 1.041307987979887],
    [7.373, 1.185],
    [9.467511664089056, 1.1870884629265026],
    [9.45774464864664, 4.701688394025743],
    [6.495968470648811, 4.714844828448143],
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
    [3.3871451208749113, 4.729132925126728],
    [-3.8091157412694923, 4.7151624529349245],
    [-3.808278098299742, 0.8273740028503656],
    [-4.153, 0.823],
    [-4.171216579505433, 4.711455201322984],
    [-8.226354077881876, 4.713089893104126],
    [-8.23407907211119, 1.3276633889790315],
    [-5.655633960479831, 1.326024853038546],
    [-5.66, 1.2148021812932388],
    [-8.21364198328017, 1.215492988968255],
    [-8.232138202994427, -0.1485398630016327],
    [-5.301696125516181, -0.1484145168592349],
    [-5.088630754714743, -0.04811885724222709],
    [-2.7531898947502764, -0.13220593978349582],
    [-2.7415844925778834, -3.7065028151375126],
    [1.1852068168231815, -3.69298910577228],
    [1.1818413570698985, -0.10865066211980604],
    [3.222440211143511, -0.11867900327026354],
    [3.2254304708838544, -0.25290740910235754],
    [3.9303116775662295, -0.24306100678282516],
    [3.9337191632081767, -0.12665189164128188],
    [7.380139560021886, -0.11913573443496833],
    [7.473350264675792, -2.3624399511704137]
]

const walls: Point3D[] = [
    [0, 1, 0],
    [1, 2, 0],
    [2, 3, 1],
    [3, 4, 0],
    [4, 5, 1],
    [5, 6, 1],
    [6, 7, 2],
    [7, 8, 1],
    [8, 9, 1],
    [9, 10, 3],
    [10, 11, 2],
    [11, 12, 3],
    [12, 13, 2],
    [13, 14, 2],
    [14, 15, 2],
    [15, 16, 2],
    [16, 17, 2],
    [17, 18, 2],
    [18, 19, 2],
    [19, 20, 4],
    [20, 21, 5],
    [21, 22, 6],
    [22, 23, 5],
    [23, 24, 6],
    [24, 25, 6],
    [25, 26, 7],
    [26, 27, 8],
    [27, 28, 8],
    [28, 29, 8],
    [29, 30, 9],
    [30, 31, 9],
    [31, 32, 10],
    [32, 33, 11],
    [33, 34, 12],
    [34, 35, 12],
    [35, 36, 12],
    [36, 37, 11],
    [37, 38, 3],
    [38, 39, 13],
    [39, 40, 3],
    [40, 41, 0],
    [41, 42, 0],
    [42, 0, 0]
]

const PolygonPoint = () => {
    const gridSize = 0.1;

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

    const generateGridPointsInsidePolygon = (
        polygon: Point2D[],
        gridSize: number
    ): Point2D[] => {
        const points: Point2D[] = [];
        const { minX, maxX, minY, maxY } = getBoundingBox(polygon);

        for (let x = minX; x <= maxX; x += gridSize) {
            for (let y = minY; y <= maxY; y += gridSize) {
                const point: Point2D = [x, y];
                if (isPointInPolygon(point, polygon)) {
                    points.push(point); // 다각형 내부 포인트만 추가
                }
            }
        }
        return points;
    };
    const boxPoint = () => {
        const points: Point2D[] = [];
        const newBoxData = { minX: 6.112507203012343, maxX: 6.362489363760102, minY: 1.1725017856508466, maxY: 4.732323544129732 }

        for (let x = newBoxData.minX; x <= newBoxData.maxX; x += gridSize) {
            for (let y = newBoxData.minY; y <= newBoxData.maxY; y += gridSize) {
                const point: Point2D = [x, y];

                points.push(point);
            }
        }
        return points;
    }

    const checkBoxToObject = (roomArray: Point2D[], objectArray: Point2D[]): boolean => {
        for (const roomPoint of roomArray) {
            for (const boxPoint of objectArray) {
                for (const wallPointIndex of walls) {
                    const result = isIntersectFromPoints(
                        [roomPoint, boxPoint],
                        [wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]]]
                    );
                    if (!result) {
                        console.log("checkBoxToObject", [roomPoint, boxPoint],
                            [wallPoint[wallPointIndex[0]], wallPoint[wallPointIndex[1]]])
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const newBoxPoints = boxPoint()


    const generatedPoints = generateGridPointsInsidePolygon(roomPoint, gridSize);
    const masterRoomPoints = generateGridPointsInsidePolygon(masterRoom, gridSize);
    const alphaRoomPoint = generateGridPointsInsidePolygon(alphaRoom, gridSize);
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

    console.log("newBoxPoints", newBoxPoints, alphaRoomPoint)


    if (generatedPoints && newBoxPoints) {
        const occlusionResult = checkBoxToObject(generatedPoints, newBoxPoints)
        console.log("generatedPoints", occlusionResult)
    }

    if (masterRoomPoints && newBoxPoints) {
        const occlusionResult1 = checkBoxToObject(masterRoomPoints, newBoxPoints)
        console.log("masterRoomPoints", occlusionResult1)
    }
    if (alphaRoomPoint && newBoxPoints) {
        const occlusionResult2 = checkBoxToObject(alphaRoomPoint, newBoxPoints)
        console.log("alphaRoomPoint", occlusionResult2)
    }






    return (
        <>
            <Polygon points={roomPoint} />
            <Polygon points={masterRoom} />
            <Polygon points={alphaRoom} />
            <Points points={generatedPoints} />
            <Points points={masterRoomPoints} />
            <Points points={newBoxPoints} />
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