import React, { useMemo, useState } from 'react'

import "./arcSelector.css"

const ArcSelector = () => {


    // 선택된 아이템의 인덱스를 관리하는 state
    const [currentIndex, setCurrentIndex] = useState(0);

    // 메뉴 아이템 데이터
    const items = useMemo(() => [
        { id: 1, icon: 'LG', label: 'LG전자' },
        { id: 2, icon: 'S', label: '삼성전자' },
        { id: 3, icon: '기본', label: '기본 모델' },
    ], []);

    // 아이템 클릭 핸들러
    const handleItemClick = (index: number) => {
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    // 각 아이템의 클래스를 계산하는 함수
    const getItemClass = (index: number) => {
        const diff = index - currentIndex;
        if (diff === 0) {
            return 'active';
        } else if (diff === -1 || diff === items.length - 1) {
            return 'left';
        } else if (diff === 1 || diff === -(items.length - 1)) {
            return 'right';
        }
        return ''; // 보이지 않는 아이템 (3개 이상일 경우)
    };
    return (
        <>


            {/* 아크 셀렉터 UI */}
            <div className="arc-selector-container">
                {items.map((item, index) => {
                    const itemClass = getItemClass(index);
                    // 보이지 않는 아이템은 렌더링하지 않음
                    if (itemClass === '') return null;

                    return (
                        <div
                            key={item.id}
                            className={`arc-item ${itemClass}`}
                            onClick={() => handleItemClick(index)}
                        >
                            <div className="icon">{item.icon}</div>
                            <div className="label">{item.label}</div>
                        </div>
                    );
                })}
            </div>
        </>
    )
}

export default ArcSelector