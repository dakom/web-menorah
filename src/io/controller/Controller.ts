import {
    startPointer,
    startTickPointer,
    PointerEventStatus,
    getClientCoordsFromPointerEvent,
    PointerEventData
} from 'input-senders';
import { WebGlRenderer, getMatrixFromTrs } from 'pure3d';

const domElement = document.getElementById("app");
const hasPointer = (window as any).PointerEvent ? true : false;

export const startController = (renderer:WebGlRenderer) => (onMove:([p1, p2]:[Float32Array, Float32Array]) => void) => { 
    const touch_start = new Float32Array(2);
    const touch_move = new Float32Array(2);

    startTickPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.START,
        })
        (evt => {
            touch_start[0] = evt.data.x;
            touch_start[1] = evt.data.y; 
            startMoveInput(data => {
                touch_move[0] = data.x;
                touch_move[1] = data.y;
                onMove([touch_start, touch_move]);
                touch_start[0] = data.x;
                touch_start[1] = data.y;
            })
        });
}

const startMoveInput = (onMove: (evt:PointerEventData) => void) => { 
    const stoppers = [];

    const stop = () => {
        console.log("STOPPING");
        stoppers.forEach(fn => fn());
    }


    stoppers.push(
        startTickPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.MOVE,
        })
        (evt => onMove(evt.data))
    );

    stoppers.push(startPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.END,
        })
        (evt => {
            stop();
        })
    );

    return stop;
}
