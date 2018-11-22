import { getCompileFlags} from "io/utils/Utils";
import {WorkerCommand,  MESSAGE, Renderable} from "io/types/Types";
import {createRenderer, getScreenSize} from "io/renderer/Renderer";
import {createLinesRenderer} from "io/renderer/lines/Lines";
import {getScene} from "io/scene/Scene";
import {startController} from "io/controller/Controller";
import {loadOpenCv} from "./opencv/OpenCv";
import {getVideo} from "io/video/Video";
import {gltf_load} from "pure3d";
import {mat4, quat, vec3} from "gl-matrix";
import { GltfBridge, GltfScene, gltf_updateAnimatedScene, gltf_updateStaticScene, gltf_createAnimator } from "pure3d";
import {getWasm} from "./Wasm-Loader";

const {buildVersion, isProduction} = getCompileFlags();

console.log(`%c Web Menorah ${buildVersion} (productionMode: ${isProduction})`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');
const worker = new Worker('./mainWorker.js');
const init = async () => {
    const renderer = createRenderer();
    const gltf = await gltf_load({renderer, path: "static/models/day1/menorah.gltf"});
    const wasmLib = await getWasm();
    const video = await getVideo(renderer);
    const renderLines = createLinesRenderer (renderer);
    const getMarkers = loadOpenCv(video.stream);
    const scene = getScene (renderer) (gltf);
    
    //const ptr = wasmLib.run(createScene(bridge), bridge.renderScene, console.log);

    const camera_ptr = wasmLib.create_camera(renderer.canvas.clientWidth, renderer.canvas.clientHeight);
    scene.setCamera(wasmLib.get_camera_view(camera_ptr));

    startController(renderer) 
        (([p1, p2]) => {
            //scene.setCamera(wasmLib.update_camera(camera_ptr, p1, p2));
        });

    let markersBusy = false;

    let sceneVisible = false;

    const onTick = now => {
        renderer.gl.clear(renderer.gl.COLOR_BUFFER_BIT | renderer.gl.DEPTH_BUFFER_BIT); 

        if(sceneVisible) {
            scene.render(now);
        }

        if(!markersBusy) {
            markersBusy = true;
            getMarkers().then(view => {
                if(!view) {
                    //sceneVisible = false;
                } else {
                    scene.setCamera(view);
                    sceneVisible = true;
                }
                markersBusy = false;
            })
        }

        /*
        renderLines 
            (scene.getCamera()) 
            ([
                {
                    p1: [0,0,0],
                    p2: vec3.scale(vec3.create(), [1,0,0], 10),
                    color: [1,0,0]
                },
                {
                    p1: [0,0,0],
                    p2: vec3.scale(vec3.create(), [0,1,0], 10),
                    color: [0,0,1]
                },
                {
                    p1: [0,0,0],
                    p2: vec3.scale(vec3.create(), [0,0,-1], 10),
                    color: [0,1,0]
                },
            ])
            */
        requestAnimationFrame(onTick);
    } 
    requestAnimationFrame(onTick);
}

init();