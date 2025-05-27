// 이유: React로 표를 렌더링하고, jsPDF와 html2canvas를 사용해 PDF로 변환
// 결과: 사용자가 제공한 데이터를 기반으로 표를 생성하고, 버튼 클릭 시 PDF로 다운로드
import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// 타입 정의
interface TableData {
  attribute: string;
  vrayMtl: string;
  meshPhysicalMaterial: string;
  comparison: string;
}

// 표 데이터
const tableData: TableData[] = [
  {
    attribute: '반사 색상 (Reflection Color)',
    vrayMtl: 'Reflect: 반사 색상을 지정하며, 색상이 Diffuse 색상을 어둡게 만듦. 텍스처 맵핑 가능.',
    meshPhysicalMaterial: 'color 및 envMap: 반사 색상은 envMap으로 환경 반사를 제어하고, color는 기본 색상 역할.',
    comparison: 'V-Ray는 반사 색상이 Diffuse에 직접 영향을 미치며, Three.js는 envMap으로 반사를 독립적으로 제어.',
  },
  {
    attribute: '반사 광택도 (Glossiness)',
    vrayMtl: 'Glossiness: 0.0(흐림) ~ 1.0(거울 같은 반사). Use Roughness 옵션으로 역방향 설정 가능.',
    meshPhysicalMaterial: 'roughness: 0.0(매끄러움) ~ 1.0(매트). 낮을수록 선명한 반사.',
    comparison: 'V-Ray는 Glossiness와 Roughness를 선택적으로 사용, Three.js는 Roughness 단일 사용. Three.js가 더 직관적.',
  },
  {
    attribute: '프레넬 반사 (Fresnel Reflections)',
    vrayMtl: 'Fresnel Reflections: 각도에 따라 반사 강도 조절. Fresnel IOR로 세부 제어.',
    meshPhysicalMaterial: 'reflectivity 및 ior: reflectivity(0~1)로 비금속 반사 강도, ior로 굴절률 조절.',
    comparison: 'V-Ray는 Fresnel IOR와 굴절 IOR를 분리 가능, Three.js는 ior로 통합 관리.',
  },
  {
    attribute: '금속성 (Metalness)',
    vrayMtl: 'Metalness: 0.0(비금속) ~ 1.0(금속). 중간 값은 비물리적.',
    meshPhysicalMaterial: 'metalness: 0.0(비금속) ~ 1.0(금속). 텍스처로 제어 가능.',
    comparison: '둘 다 유사하지만, V-Ray는 금속 반사를 위해 흰색 반사 색상 권장.',
  },
];

// React 컴포넌트
const MaterialComparisonTable = () => {
  const tableRef = useRef<HTMLDivElement>(null);

  // PDF 생성 함수
  const generatePDF = async () => {
    if (!tableRef.current) return;

    // 이유: html2canvas로 표를 캡처하고 jsPDF로 PDF 생성
    // 결과: 표가 포함된 PDF 파일 다운로드
    const canvas = await html2canvas(tableRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190; // A4 폭에 맞춤
    const pageHeight = pdf.internal.pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 페이지 추가 (표가 길 경우)
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('material_comparison.pdf');
  };

  return (
    <div>
      <button onClick={generatePDF}>PDF 다운로드</button>
      <div ref={tableRef} style={{ padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>속성</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>VRayMtl (V-Ray)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>MeshPhysicalMaterial (Three.js)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>비교 및 차이점</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 ? '#f9f9f9' : '#fff' }}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.attribute}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.vrayMtl}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.meshPhysicalMaterial}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.comparison}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialComparisonTable;