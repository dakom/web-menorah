#![feature(custom_attribute)]
#![feature(extern_prelude)]

extern crate wasm_bindgen;
extern crate web_sys; 
extern crate js_sys;
extern crate cgmath;
extern crate arcball;
extern crate sodium_rust_push_pull;

use core::{mem};
use sodium_rust_push_pull::sodium::*;
use web_sys::console;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use std::cell::RefCell;
use std::rc::Rc;
use cgmath::{Point3, Vector3, Vector2, Matrix4};
use arcball::ArcballCamera;

#[wasm_bindgen]
pub struct Area {
    width: f64,
    height: f64
}

#[wasm_bindgen]
pub fn create_camera(screen_width: f32, screen_height: f32) -> *mut ArcballCamera { 
    let look_at = Matrix4::<f32>::look_at(Point3::new(0.0, 0.5, 1.0),
                                              Point3::new(0.0, 0.25, 0.0),
                                              Vector3::new(0.0, 1.0, 0.0));
    let boxed = Box::new(ArcballCamera::new(&look_at, 0.05, 4.0, [screen_width, screen_height]));

    Box::into_raw(boxed)
}


#[wasm_bindgen]
pub fn get_camera_view(ptr: *mut ArcballCamera) -> Box<[f32]> {

    let camera = unsafe {Box::from_raw(ptr) };

    let mat:Matrix4<f32> = camera.get_mat4();

    let view = Box::new([   mat.x.x, mat.x.y, mat.x.z, mat.x.w,
                            mat.y.x, mat.y.y, mat.y.z, mat.y.w,
                            mat.z.x, mat.z.y, mat.z.z, mat.z.w,
                            mat.w.x, mat.w.y, mat.w.z, mat.w.w,
    ]);

    mem::forget(camera);

    return view;
}


#[wasm_bindgen]
pub fn update_camera(ptr: *mut ArcballCamera, mouse_prev: &[f32], mouse_cur: &[f32]) -> Box<[f32]> {
    let mut camera = unsafe {Box::from_raw(ptr) };

    camera.rotate(Vector2::new(mouse_prev[0], mouse_prev[1]), Vector2::new(mouse_cur[0], mouse_cur[1]));

    let view = get_camera_view(ptr);

    mem::forget(camera);

    return view;
}