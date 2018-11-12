import {
    createWebGlRenderer,
    gltf_load
} from "pure3d";

export const getScreenSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight
})

export const createRenderer = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    const renderer = createWebGlRenderer({
        canvas,
        version: 1
    });
    renderer.gl.clearColor(0, 0, 0, 0);

    const onResize = () => renderer.resize(getScreenSize());
    onResize();
    window.addEventListener("resize", onResize);

    return renderer;
}
