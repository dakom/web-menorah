//import MyWorker from 'worker-loader!./Main-Worker';
import { getCompileFlags} from "io/utils/Utils";
import {WorkerCommand,  MESSAGE, Renderable} from "io/types/Types";
import {loadRenderer, getScreenSize} from "io/renderer/Renderer";
import {createScene} from "io/scene/Scene";
import {startController} from "io/controller/Controller";
import { GltfBridge, GltfScene, gltf_updateAnimatedScene, gltf_updateStaticScene, gltf_createAnimator } from "pure3d";
import {getWasm} from "./Wasm-Loader";

const {buildVersion, isProduction} = getCompileFlags();

console.log(`%c Web Menorah ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');


const init = async () => {
    const bridge = await loadRenderer("static/models/day1/menorah.gltf");
    const wasmLib = await getWasm();
    let scene = createScene(bridge);

    const updateScene = gltf_updateAnimatedScene(
        gltf_createAnimator(bridge.getData().animations) ({loop: true})
    )
    //const ptr = wasmLib.run(createScene(bridge), bridge.renderScene, console.log);

    const camera_ptr = wasmLib.create_camera(bridge.renderer.canvas.clientWidth, bridge.renderer.canvas.clientHeight);
    scene.camera.view = wasmLib.get_camera_view(camera_ptr);

    startController(bridge.renderer) 
        (([p1, p2]) => {
            scene.camera.view = wasmLib.update_camera(camera_ptr, p1, p2);
        });

    const onTick = now => {
        //scene = gltf_updateStaticScene (scene);
        scene = updateScene(now) (scene);
        bridge.renderScene(scene);
        requestAnimationFrame(onTick);
    } 
    requestAnimationFrame(onTick);
}

init();
