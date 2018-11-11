//import MyWorker from 'worker-loader!./Main-Worker';
import { getCompileFlags} from "io/utils/Utils";
import {WorkerCommand,  MESSAGE, Renderable} from "io/types/Types";
import {loadRenderer, getScreenSize} from "io/renderer/Renderer";
import {createScene} from "io/scene/Scene";
import {startController} from "io/controller/Controller";
import { GltfBridge, GltfScene, gltf_createAnimator } from "pure3d";
import {getWasm} from "./Wasm-Loader";

const {buildVersion, isProduction} = getCompileFlags();

console.log(`%c Web Menorah ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');


const init = async () => {
    const bridge = await loadRenderer("static/models/day1/menorah.gltf");
    const wasmLib = await getWasm();

    wasmLib.run(createScene(bridge), bridge.renderScene, console.log);
}

init();
