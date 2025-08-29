use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: i32) -> i32 {
    if n <= 1 {
        n
    } else {
        fibonacci(n - 1) + fibonacci(n - 2)
    }
}

#[wasm_bindgen]
pub fn is_prime(n: i32) -> bool {
    if n <= 1 {
        return false;
    }
    let mut i = 2;
    while i * i <= n {
        if n % i == 0 {
            return false;
        }
        i += 1;
    }
    true
}

#[wasm_bindgen]
pub fn matrix_multiply(size: usize) -> Vec<f64> {
    let mut result = vec![0.0; size * size];
    let a = vec![1.0; size * size];
    let b = vec![2.0; size * size];
    
    for i in 0..size {
        for j in 0..size {
            for k in 0..size {
                result[i * size + j] += a[i * size + k] * b[k * size + j];
            }
        }
    }
    result
}