function start(mymod: typeof import("../target/web_menorah")) {
    return mymod;
}

export async function getWasm() {
    return start(await import("../target/web_menorah"));
}

