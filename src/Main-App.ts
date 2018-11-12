//import MyWorker from 'worker-loader!./Main-Worker';
import { getCompileFlags} from "io/utils/Utils";
import {WorkerCommand,  MESSAGE, Renderable} from "io/types/Types";
import {createRenderer, getScreenSize} from "io/renderer/Renderer";
import {getScene} from "io/scene/Scene";
import {startController} from "io/controller/Controller";
import {getVideo} from "io/video/Video";
import {gltf_load} from "pure3d";

import { GltfBridge, GltfScene, gltf_updateAnimatedScene, gltf_updateStaticScene, gltf_createAnimator } from "pure3d";
import {getWasm} from "./Wasm-Loader";

const {buildVersion, isProduction} = getCompileFlags();

console.log(`%c Web Menorah ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');


const init = async () => {
    const renderer = createRenderer();
    const gltf = await gltf_load({renderer, path: "static/models/day1/menorah.gltf"});
    const wasmLib = await getWasm();
    const video = await getVideo(renderer);

    const scene = getScene (renderer) (gltf);
    
    //const ptr = wasmLib.run(createScene(bridge), bridge.renderScene, console.log);

    const camera_ptr = wasmLib.create_camera(renderer.canvas.clientWidth, renderer.canvas.clientHeight);
    scene.setCamera(wasmLib.get_camera_view(camera_ptr));

    startController(renderer) 
        (([p1, p2]) => {
            scene.setCamera(wasmLib.update_camera(camera_ptr, p1, p2));
        });

    const onTick = now => {
        renderer.glToggle(renderer.gl.DEPTH_TEST) (false);
        renderer.glToggle(renderer.gl.CULL_FACE) (false);

        video.render(now);
        scene.render(now);
        requestAnimationFrame(onTick);
    } 
    requestAnimationFrame(onTick);
}

init();
