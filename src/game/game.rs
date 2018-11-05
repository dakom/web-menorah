use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_constants() -> f64 {
    4.2
}

#[wasm_bindgen]
pub fn start_game(time:f64, on_render:&js_sys::Function, on_collision:&js_sys::Function) -> f64 {
    let this = &JsValue::null();
    let value = &JsValue::from_str("hello world");
    on_render.call1(this, value);
    //onCollision.call1(&this, &value);
    time * 4.2
}

