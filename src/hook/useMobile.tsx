import { useEffect, useState } from "react";

const checkIsMobile = () => {
    const isMobileWidth = window.innerWidth < 600;
    const isMobileAgent = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
    const hasTouchEvent =
        'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;

    return isMobileWidth || isMobileAgent || hasTouchEvent;
};

const useMobile = () => {
    const [isMobile, setIsMobile] = useState<boolean>(() => checkIsMobile());

    useEffect(() => {
        const handleResize = () => {
            console.log(checkIsMobile())
            setIsMobile(checkIsMobile());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isMobile };
};

export default useMobile;