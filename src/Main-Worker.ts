import {WorkerCommand, MESSAGE} from "io/types/Worker-Types";

console.log("hello from worker");

/*
import('./opencv/libopencv.js').then(cv => {
    console.log("cv loaded");
    console.log(cv);
});

//const worker = new Worker('static/opencv-001.js');
(self as any).addEventListener(MESSAGE, (evt:MessageEvent) => {

    switch(evt.data.cmd) {
        case WorkerCommand.WORKER_START:
            break;
        case WorkerCommand.TICK:
            break;
        case WorkerCommand.CONTROLLER:
            break;
    }
});
*/

