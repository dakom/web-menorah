#![feature(custom_attribute)]
#![feature(extern_prelude)]

extern crate wasm_bindgen;
extern crate web_sys; 
extern crate js_sys;
extern crate cgmath;
extern crate arcball;

use web_sys::console;
use wasm_bindgen::prelude::*;

use cgmath::{Point3, Vector3, Vector2, Matrix4};
use arcball::ArcballCamera;

#[wasm_bindgen]
pub fn run(scene:&JsValue, on_render:&js_sys::Function, on_temp:&js_sys::Function) { 
    let this = &JsValue::null();
   
    let window = web_sys::window().unwrap();

    window.request_animation_frame(
        on_temp.call1(this, &"hello world".into())
    );

    on_render.call1(this, scene);

//    console::log(&"Hello world".into());

    //on_render.call1(&this, &scene);

    /*
    let mut arcball_camera = {
        let look_at = Matrix4::<f32>::look_at(Point3::new(0.0, 0.0, 6.0),
                                              Point3::new(0.0, 0.0, 0.0),
                                              Vector3::new(0.0, 1.0, 0.0));
        ArcballCamera::new(&look_at, 0.05, 4.0, [screen_width, screen_height]);
    };

    let value = &JsValue::from_str("hello world");
    on_render.call1(this, value);
    //onCollision.call1(&this, &value);

    let cb = Closure::wrap(Box::new(move |time| time * 4.2) as Box<FnMut(f64) -> f64>);

    cb.as_ref()
    */
}

