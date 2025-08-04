import { useAtomValue } from 'jotai';
import './PopupPc.css'
import { modalAtom, setAtomValue } from '../../../utils/atom';

const PopupPc = () => {

    const isModal = useAtomValue(modalAtom)
    return (
        <>
            {isModal &&
                <div className='background-div' onClick={() => {
                    setAtomValue(modalAtom, false)
                }}>
                    <div className="popup-wrapper">
                        <div className="popup-container">
                            <div className="popup-grid">

                                <div className="image-section">
                                    <img src="/lg.png" alt="BESPOKE 식기세척기" className="product-image" />
                                    <div className="image-dots">
                                        <span className="dot active"></span>
                                        <span className="dot inactive"></span>
                                        <span className="dot inactive"></span>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <button className="close-button">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <div className="info-content">
                                        <p className="category">BESPOKE 식기세척기</p>
                                        <h1 className="product-name">빌트인 14인용 화이트 글래스</h1>
                                        <p className="product-code">DW60BB815U01AP</p>

                                        <div className="features">
                                            <div className="feature-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.714 4.222a2 2 0 00.175 2.323l3.109 3.109a2 2 0 002.828 0l7-7z" /></svg>
                                                <span>14인용 대용량 수납</span>
                                            </div>
                                            <div className="feature-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                <span>에너지 소비효율 1등급</span>
                                            </div>
                                            <div className="feature-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span>38분 Express 세척</span>
                                            </div>
                                        </div>
                                        <a href="#" className="details-link">상세 스펙 전체 보기 →</a>
                                    </div>

                                    <div className="price-section">
                                        <p className="price-label">가격</p>
                                        <p className="price-amount">1,490,000<span>원</span></p>
                                    </div>

                                    <div className="button-group">
                                        <button className="button button-secondary">관심 상품</button>
                                        <button className="button button-primary">장바구니 담기</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default PopupPc