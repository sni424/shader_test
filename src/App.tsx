import { Canvas } from "@react-three/fiber";
import { Stats } from '@react-three/drei';
import BoxImageTransition from "./components/BoxImageTransition";
import { Environment, OrbitControls } from "@react-three/drei";
import { useState } from "react";
import ModelTextureTransition from "./components/ModelTextureTransition";
import ModelOnBeforeShader from "./components/ModelOnBeforeShader";
import CheckPBRShader from "./components/CheckPBRShader";
import CheckLightMap from "./components/CheckLightMap";
import CheckDimensions from "./components/CheckDimensions";
import CanvasClickEvent from "./components/CanvasClickEvent";
import PointMark from "./components/PointMark";

import PredrawnLine from "./components/PredrawnLine";
import LineComponent from "./components/LineComponent";
import CanvasKeyEvent from "./components/CanvasKeyEvent";
import Type2PredrawLine from "./components/Type2PredrawLine";
import OcclusionTest from "./components/OcclusionTest";
import CheckCrossLine from "./components/CheckCrossLine";
import PolygonPoint from "./components/PolygonPoint";
import MaterialComparisonTable from "./components/MaterialComparisonTable";
import TransmissionTest from "./components/TransmissionTest";
import dancing_hall_1k from "/dancing_hall_1k.hdr?url"
import CheckSharpen from "./components/CheckSharpen";
import CubeCameraTest from "./components/CubeCameraTest";

const step = Array.from({ length: 11 }, (_, i) => i + 1);

const roomButton = ["거실", "주방", "드레스룸"]
export default function App() {
  const [isClick, setClick] = useState(false)
  const [dimensionsClick, setDimensionsClick] = useState(false)
  const [room, setRoom] = useState<string>("거실")
  const [pageStep, setPageStep] = useState(1)

  const [strength, setStrength] = useState(0.0); // 샤프닝 강도 상태
  const [opacity, setOpacity] = useState(1.0); // 블렌딩 투명도 상태
  const [roughness, setRoughness] = useState(0.0)
  const clickFun = () => {
    setClick(pre => !pre)
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100vh"
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: "10",
          top: "2.5%",
          left: "50%",
          transform: "translateX(-50%)"
        }}>
        {step.map((child: number) => {
          return (
            <button
              key={`button_${child}`}
              style={{
                padding: "10px 10px",
                fontSize: "16px",
                cursor: "pointer"
              }}
              onClick={() => {
                setPageStep(child)
              }}
            >
              {child}
            </button>
          )
        })}
      </div>
      <div style={{
        marginTop: "10%",
        position: "absolute",
        zIndex: "10"
      }}>
        <input
          type="range"
          style={{
            padding: '10px 10px',
            fontSize: '16px',
            cursor: 'pointer',

          }}
          min={0.0}
          max={1.0}
          step={0.01}
          value={roughness}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {

            setRoughness(parseFloat(e.target.value));
          }}
        />
        <span>{roughness}</span>
      </div>
      <button
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          zIndex: "10",
          cursor: "pointer"
        }}
        onClick={() => {
          clickFun()
        }}
      >
        전환하기
      </button>


      {pageStep === 2 &&

        <div

          style={{
            position: "absolute",
            zIndex: "10",
            bottom: "2.5%",
            left: "50%",
            transform: "translateX(-50%)"
          }}>
          <label>
            Sharpen Strength: {strength.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
            />
          </label>
          <label>
            Blend Opacity: {opacity.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
            />
          </label>
        </div>
      }
      {pageStep === 7 || pageStep === 6 || pageStep === 8 ?
        <button
          style={{
            position: "absolute",
            top: "20px",
            left: "140px",
            padding: "10px 20px",
            fontSize: "16px",
            zIndex: "10",
            cursor: "pointer"
          }}
          onClick={() => {
            setDimensionsClick(pre => !pre)
          }}
        >
          {dimensionsClick ? "측정취소" : "거리측정"}
        </button>
        : null}
      {pageStep === 7 && dimensionsClick &&
        <ul
          style={{
            position: "absolute",
            bottom: "0",
            zIndex: "10",
            display: "flex",
            alignItems: "center",
            listStyle: "none",
            gap: "8px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {roomButton.map((child, index) => {
            return (
              <li key={`lineButton_key_${index}`}>
                <button
                  style={{
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    setRoom(child)
                  }}
                >
                  {child}
                </button>
              </li>
            )
          })}
        </ul>
      }

      <div id="canvasDiv"
        style={{
          width: "100%",
          height: "100vh"
        }}
      >


        <Canvas>
          <Stats />
          {pageStep === 1 &&
            <CubeCameraTest roughness={roughness} />
          }
          {pageStep === 12 &&
            <ModelTextureTransition isClick={isClick} />
          }
          {pageStep === 2 &&
            <CheckSharpen strength={strength} opacity={opacity} />
            // <BoxImageTransition isClick={isClick} />
          }
          {pageStep === 3 &&
            <ModelOnBeforeShader isClick={isClick} />
          }
          {/* {pageStep !== 4 && <Environment preset="city" />} */}
          {pageStep === 4 &&
            <CheckLightMap isClick={isClick} />
          }
          {pageStep === 5 &&
            <CheckPBRShader isClick={isClick} />
          }
          {pageStep === 6 &&
            <CheckDimensions />
          }
          {pageStep === 6 &&
            <>
              <PointMark />
              <LineComponent />
              <CanvasKeyEvent />
              <CanvasClickEvent dimensionsClick={dimensionsClick} />
            </>
          }
          {/* {pageStep === 7 || pageStep === 8 ?
            <>
              <DimensionComplete pageStep={pageStep} />
              <CheckRaycaster />
            </> : null
          } */}
          {pageStep === 7 &&
            <>
              <PredrawnLine dimensionsClick={dimensionsClick}
                room={room}
              />

            </>

          }
          {pageStep === 8 &&
            // <Type2PredrawLine dimensionsClick={dimensionsClick}
            //   room={room}
            // />
            <TransmissionTest />
          }
          {pageStep === 9 && <OcclusionTest />}
          {pageStep === 10 && <CheckCrossLine />}
          {pageStep === 11 &&
            <>
              <PolygonPoint />
              <CheckDimensions />
            </>
          }
          <OrbitControls />
          {/* <Environment
            preset="warehouse"
          /> */}
        </Canvas>
      </div>
    </div>
  );
}

