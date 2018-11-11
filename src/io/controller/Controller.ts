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

export const startController = (renderer:WebGlRenderer) => {

    startTickPointer
        ({
            domElement,
            hasPointer,
            status: PointerEventStatus.START,
        })
        (evt => {
            const start = evt.data as PointerEventData;
            const onMove = (move:PointerEventData) => {
            }
            startMoveInput({onMove, onEnd: _ => {}});
        });
}

const startMoveInput = ({onMove, onEnd}: {onMove: (evt:PointerEventData) => void, onEnd: (evt:PointerEventData) => void}) => {
   
    const stoppers = [];

    const stop = () => {
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
            onEnd(evt.data);
            stop();
        })
    );

    return stop;
}
