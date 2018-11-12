import {GltfScene, gltf_updateAnimatedScene, gltf_createAnimator, WebGlRenderer, gltf_updateStaticScene, GltfLightNode, NodeKind, LightKind, createTransform, GltfBridge, Camera, PerspectiveCameraSettings, CameraKind, getCameraProjection, createMat4} from "pure3d";
import {mat4} from "gl-matrix";

export const getScene = (renderer:WebGlRenderer) => (gltf:GltfBridge) => {
    let scene = gltf.getOriginalScene(null) (0);

    scene = gltf_updateStaticScene (addLights(scene));
    const updateScene = gltf_updateAnimatedScene(
        gltf_createAnimator(gltf.getData().animations) ({loop: true})
    );

    return {
        render: now => {
            scene = updateScene(now) (scene);
            gltf.renderScene(scene);
        },

        setCamera: view => {
            scene.camera.view = view
        }
    }
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
            makeDirectional({intensity: 3}),
            //makeDirectional({ intensity: 7, rotation: [1,0,0,1] }),
            //makeDirectional({ intensity: 3, rotation: [0,0,0,1] }),
            //makeDirectional({ intensity: 3, rotation: [0,0,1,1] }),
            //makePoint({ intensity: 10, translation: [1,1,1] }),
            makePoint({ intensity: 10, translation: [-1,1,1] }),
        ])
    });
}
