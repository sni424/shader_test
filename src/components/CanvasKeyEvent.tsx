import { useSetAtom } from 'jotai'
import React, { useEffect } from 'react'
import { eventAtom } from '../utils/atom'

const CanvasKeyEvent = () => {

    const setEventKey = useSetAtom(eventAtom)

    const keyDownEvent = (e: KeyboardEvent) => {
        if (e.key === "Shift") {
            setEventKey(true)
        }
    }
    const keyUpEvent = (e: KeyboardEvent) => {
        if (e.key === "Shift") {
            setEventKey(false)
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", (e) => {
            keyDownEvent(e)
        })
        window.addEventListener("keyup", (e) => {
            keyUpEvent(e)
        })


        return (() => {
            window.removeEventListener("keydown", (e) => {
                keyDownEvent(e)
            })
            window.removeEventListener("keyup", (e) => {
                keyUpEvent(e)
            })

        })
    }, [])


    return null
}

export default CanvasKeyEvent