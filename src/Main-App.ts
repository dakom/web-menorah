//import MyWorker from 'worker-loader!./Main-Worker';
import { getCompileFlags} from "io/utils/Utils";
import {WorkerCommand,  MESSAGE, Renderable} from "io/types/Types";
import {loadRenderer} from "io/renderer/Renderer";
import {createScene} from "io/scene/Scene";
import { GltfBridge, GltfScene, gltf_updateScene, gltf_createAnimator } from "pure3d";
const {buildVersion, isProduction} = getCompileFlags();

console.log(`%c Web Menorah ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');

const worker = new Worker('./mainWorker.js');
let renderables:Array<Renderable>;
let render: (now:number) => void;
let scene:GltfScene;

loadRenderer("static/models/day1/menorah.gltf")
.then(bridge => {
    scene = createScene(bridge);
    const updateScene = gltf_updateScene (
            gltf_createAnimator(bridge.getData().animations) ({loop: true})
    );
    render = (now:number) => {
        scene = updateScene (now) (scene);
        bridge.renderScene(scene);
    }
    worker.postMessage({
        cmd: WorkerCommand.WORKER_START
    });
});

worker.addEventListener(MESSAGE, (evt:MessageEvent) => {
    switch(evt.data.cmd) {
        case WorkerCommand.WORKER_READY: {
            const {constants} = evt.data;
            requestAnimationFrame(now => 
                    worker.postMessage({
                        cmd: WorkerCommand.TICK,
                        now
                    })
            );

            break;
        }
        case WorkerCommand.RENDER: {
            const firstTime = renderables === undefined;
            renderables = evt.data.renderables;
            if(firstTime) {
                startMain();
            }             
            break;
        }

        case WorkerCommand.COLLISION: {
              
            const {collisionName} = evt.data;
            
            //playCollision(collisionName);

            break;
        }
    }
});

const startMain = () => {

    const tick = now => {
        //Checking if the state is fresh serves two purposes:
        //1. Avoids needless renders
        //2. Prevents buildup of worker tick messages
        if(renderables != null) {
            render(now);
            renderables = null;
            worker.postMessage({
                cmd: WorkerCommand.TICK,
                now
            });
        }
        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    /*
    startController(controller => {
        worker.postMessage({
            cmd: WorkerCommand.CONTROLLER1,
            controller
        })
        });
        */
}

