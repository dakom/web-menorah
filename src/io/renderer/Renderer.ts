import {
    createWebGlRenderer,
    gltf_load
} from "pure3d";

export const getScreenSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight
})

export const loadRenderer = async (path:string) => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.backgroundColor = "#fff";

    document.getElementById("app").appendChild(canvas);

    const renderer = createWebGlRenderer({
        canvas,
        version: 1
    });
    renderer.gl.clearColor(0.2, 0.2, 0.2, 1.0);

    const onResize = () => renderer.resize(getScreenSize());
    onResize();
    window.addEventListener("resize", onResize);

    return gltf_load({renderer, path});
}
