import {GltfScene, GltfLightNode, NodeKind, LightKind, createTransform, GltfBridge, Camera, PerspectiveCameraSettings, CameraKind, getCameraProjection, createMat4} from "pure3d";
import {mat4} from "gl-matrix";

export const createScene = (bridge:GltfBridge) => {
    const scene = bridge.getOriginalScene(null) (0);
    
    return addLights(scene);
}

const addLights = (scene:GltfScene):GltfScene => {
    const makeDirectional = ({intensity, rotation}:{intensity:number, rotation?:Array<number>}):GltfLightNode => ({
        kind: NodeKind.LIGHT,
        light: {
            kind: LightKind.Directional,
            color: [1,1,1],
            intensity
        },
        transform: createTransform (null) ({rotation})
    })

    const makePoint = ({intensity,translation}):GltfLightNode => ({
        kind: NodeKind.LIGHT,
        light: {
            kind: LightKind.Point,
            color: [1,1,1],
            intensity
        },
        transform: createTransform (null) ({translation})
    })
    return Object.assign({}, scene, {nodes:
        scene.nodes.concat([
            makeDirectional({intensity: 5})
            //makeDirectional({ intensity: 7, rotation: [1,0,0,1] }),
            //makeDirectional({ intensity: 3, rotation: [0,0,0,1] }),
            //makeDirectional({ intensity: 3, rotation: [0,0,1,1] }),
            //makePoint({ intensity: 10, translation: [1,1,1] }),
            //makePoint({ intensity: 3, translation: [0,0,1] }),
        ])
    });
}

const createCamera = ():Camera => {
    const settings:PerspectiveCameraSettings = {
        kind: CameraKind.PERSPECTIVE,
        yfov: 45.0 * Math.PI / 180,
        aspectRatio: window.innerWidth / window.innerHeight,
        znear: .01,
        zfar: 1000
    }

    const position = Float64Array.from([0,0,5]);
    const cameraLook = Float64Array.from([0,0,0]);
    const cameraUp = Float64Array.from([0,1,0]);
   
    const projection = getCameraProjection(settings); 

    const view = mat4.lookAt(createMat4() as any, position as any, cameraLook as any,cameraUp as any);

    return {
        settings,
        position,
        view,
        projection
    }
}