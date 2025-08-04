import { useAtom } from "jotai"
import ArcSelector from "../ui/ArcSelector"
import PopupMobile from "../ui/PopupMobile"
import PopupPc from "../ui/PopupPc"
import { uiIndexAtom } from "../../../utils/atom"

const UxUiComponent = ({ isMobile }: { isMobile: boolean }) => {
    const [uiIndex, setCount] = useAtom(uiIndexAtom)
    return (
        <>
            <button
                onClick={() => setCount((prev) => {
                    if (uiIndex > 1) { return 1 } else {
                        return prev + 1
                    }
                })}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 5,
                    padding: '8px 12px',
                    fontSize: '16px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                {uiIndex}번
            </button>
            {isMobile ? <PopupMobile /> : <PopupPc />}
            {uiIndex === 2 && <ArcSelector />}


        </>

    )
}

export default UxUiComponent