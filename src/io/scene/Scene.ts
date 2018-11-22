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

        getCamera: () => scene.camera,

        setCamera: view => {
            scene.camera.view = view;
        },

        setTranslationRotation: ({translation, rotation}) => {
            //console.log(translation);
            /*scene.camera.view[0] = rotation[0][0],rmtx[0][1],rmtx[0][2],tvecs[0][0][0]],
                                    [rmtx[1][0],rmtx[1][1],rmtx[1][2],tvecs[0][0][1]],
                                    [rmtx[2][0],rmtx[2][1],rmtx[2][2],tvecs[0][0][2]],
                                    [0.0       ,0.0       ,0.0       ,1.0    ]])
                                    */
            //const view = mat4.translate(scene.camera.view, scene.camera.view, translation);
            //mat4.fromTranslation(scene.camera.view, translation)
            //mat4.fromRotationTranslation(scene.camera.view, rotation, translation);
            //mat4.fromTranslation(scene.camera.view, [translation[0], -translation[1], -translation[2]]);
            //const view = mat4.translate(scene.camera.view, scene.camera.view, [.1, 0, 0]);
            //scene.nodes[0].transform.trs.translation = translation;
            //console.log(scene.nodes[1].transform.trs.translation[1]);
        }
    }
}

// https://gist.github.com/shubh-agrawal/76754b9bfb0f4143819dbd146d15d4c8
/*
const getQuaternion = (R:Array<number>, Q:Array<number>) => 
{
    const trace = R.at<double>(0,0) + R.at<double>(1,1) + R.at<double>(2,2);
 
    if (trace > 0.0) 
    {
        double s = sqrt(trace + 1.0);
        Q[3] = (s * 0.5);
        s = 0.5 / s;
        Q[0] = ((R.at<double>(2,1) - R.at<double>(1,2)) * s);
        Q[1] = ((R.at<double>(0,2) - R.at<double>(2,0)) * s);
        Q[2] = ((R.at<double>(1,0) - R.at<double>(0,1)) * s);
    } 
    
    else 
    {
        int i = R.at<double>(0,0) < R.at<double>(1,1) ? (R.at<double>(1,1) < R.at<double>(2,2) ? 2 : 1) : (R.at<double>(0,0) < R.at<double>(2,2) ? 2 : 0); 
        int j = (i + 1) % 3;  
        int k = (i + 2) % 3;

        double s = sqrt(R.at<double>(i, i) - R.at<double>(j,j) - R.at<double>(k,k) + 1.0);
        Q[i] = s * 0.5;
        s = 0.5 / s;

        Q[3] = (R.at<double>(k,j) - R.at<double>(j,k)) * s;
        Q[j] = (R.at<double>(j,i) + R.at<double>(i,j)) * s;
        Q[k] = (R.at<double>(k,i) + R.at<double>(i,k)) * s;
    }
}
*/
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
