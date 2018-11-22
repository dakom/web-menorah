import { createSimpleTextureFromTarget, WebGlRenderer, WebGlConstants,  createShader, activateShader} from "pure3d";
import { mat4 } from 'gl-matrix';
import vertexShader from "./Video-Shader-Vertex.glsl";
import fragmentShader from "./Video-Shader-Fragment.glsl";


export const SHADER_ID = Symbol("video");
const BUFFER_ID = Symbol("video");

export interface VideoElement {
    video: HTMLVideoElement;
    texture: WebGLTexture;
    width: number;
    height: number;
    clipSpace:Float32Array;
}
export const getVideo = async (renderer:WebGlRenderer) => {
    //const video = document.createElement('video');
    const video = document.getElementById('video') as HTMLVideoElement;
    video.style.position = "absolute";
    video.style.width = "100vw";
    video.style.height = "100vh";
    video.autoplay = true;
    video.muted = true;
    video.loop = true;

    video.width = window.innerWidth;
    video.height = window.innerHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    });


    const promise = new Promise((resolve) => 
        video.addEventListener('playing',() => {
            resolve({
                stream,
                //render: createVideoRenderer(renderer) (video)
            })
        })
    ) as Promise<{
        //render: (now:DOMHighResTimeStamp) => void;
        stream: MediaStream;
    }>;
    
    video.srcObject = stream;
    video.play();

    return promise;
}



const createVideoRenderer = (renderer:WebGlRenderer) => (video:HTMLVideoElement) => {
    console.log("Setup video renderer");
    
    const {gl, buffers} = renderer;

    //This must come first here since we're also working with gltf
    renderer.attributes.globalLocations.add("a_Vertex");
    const {shaderId, uniforms, program} = createShader({renderer, shaderId: SHADER_ID, source: {
        vertex: vertexShader,
        fragment: fragmentShader
    }});
 
    const {uniform1i, uniform1f, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv} = uniforms.setters;
   
    const activateAttributeData = (aName:string) =>
        renderer.attributes.activateData(renderer.attributes.getLocationInRenderer (aName));

    const sizeMatrix = mat4.create();
    
    buffers.assign(BUFFER_ID) ({
        target: WebGlConstants.ARRAY_BUFFER,
        usagePattern: WebGlConstants.STATIC_DRAW,
        data: new Float32Array([
            0.0,1.0, // top-left
            0.0,0.0, //bottom-left
            1.0, 1.0, // top-right
            1.0, 0.0 // bottom-right
        ])
    });

    const activateVertexBuffer = () => activateAttributeData("a_Vertex") (BUFFER_ID) ({
        size: 2,
        type: gl.FLOAT
    });

    const texture = createSimpleTextureFromTarget({gl, alpha: false, flipY: true}) (video);

    const clipSpace = mat4.ortho(new Float64Array(16) as any, 0, window.innerWidth, 0, window.innerHeight, 0, 1);

    return now => {
        activateShader(shaderId);
        
        //render data
        mat4.fromScaling(sizeMatrix, [window.innerWidth, window.innerHeight, 1]);

        uniformMatrix4fv("u_Size") (false) (sizeMatrix);
        uniformMatrix4fv("u_Transform") (false) (clipSpace);

        activateVertexBuffer();

        renderer.switchTexture(0) (texture);
        //Re-sample to get updated video frame
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);

        uniform1i("u_Sampler") (0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}