;; WebAssembly Text Format for algorithm implementations
(module
  ;; Memory for data storage
  (memory (export "memory") 1)

  ;; Fibonacci function
  (func $fibonacci (export "fibonacci") (param $n i32) (result i32)
    (if (result i32)
      (i32.le_s (local.get $n) (i32.const 1))
      (then (local.get $n))
      (else
        (i32.add
          (call $fibonacci (i32.sub (local.get $n) (i32.const 1)))
          (call $fibonacci (i32.sub (local.get $n) (i32.const 2)))
        )
      )
    )
  )

  ;; Prime number check
  (func $isPrime (export "isPrime") (param $n i32) (result i32)
    (local $i i32)
    (local $limit i32)
    
    ;; Numbers <= 1 are not prime
    (if (i32.le_s (local.get $n) (i32.const 1))
      (then (return (i32.const 0)))
    )
    
    ;; 2 is prime
    (if (i32.eq (local.get $n) (i32.const 2))
      (then (return (i32.const 1)))
    )
    
    ;; Even numbers > 2 are not prime
    (if (i32.eq (i32.rem_s (local.get $n) (i32.const 2)) (i32.const 0))
      (then (return (i32.const 0)))
    )
    
    ;; Check odd divisors up to sqrt(n)
    (local.set $i (i32.const 3))
    (local.set $limit (i32.trunc_f32_s (f32.sqrt (f32.convert_i32_s (local.get $n)))))
    
    (loop $check_loop
      (if (i32.le_s (local.get $i) (local.get $limit))
        (then
          (if (i32.eq (i32.rem_s (local.get $n) (local.get $i)) (i32.const 0))
            (then (return (i32.const 0)))
          )
          (local.set $i (i32.add (local.get $i) (i32.const 2)))
          (br $check_loop)
        )
      )
    )
    
    (i32.const 1)
  )

  ;; Factorial function
  (func $factorial (export "factorial") (param $n i32) (result i32)
    (local $result i32)
    (local $i i32)
    
    (local.set $result (i32.const 1))
    (local.set $i (i32.const 2))
    
    (loop $fact_loop
      (if (i32.le_s (local.get $i) (local.get $n))
        (then
          (local.set $result (i32.mul (local.get $result) (local.get $i)))
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $fact_loop)
        )
      )
    )
    
    (local.get $result)
  )

  ;; Matrix multiplication (simplified for demo)
  (func $matrixMultiply (export "matrixMultiply") (param $size i32) (result i32)
    (local $i i32)
    (local $j i32)
    (local $k i32)
    (local $sum i32)
    
    (local.set $i (i32.const 0))
    (loop $i_loop
      (if (i32.lt_s (local.get $i) (local.get $size))
        (then
          (local.set $j (i32.const 0))
          (loop $j_loop
            (if (i32.lt_s (local.get $j) (local.get $size))
              (then
                (local.set $sum (i32.const 0))
                (local.set $k (i32.const 0))
                (loop $k_loop
                  (if (i32.lt_s (local.get $k) (local.get $size))
                    (then
                      (local.set $sum (i32.add (local.get $sum) (i32.const 2)))
                      (local.set $k (i32.add (local.get $k) (i32.const 1)))
                      (br $k_loop)
                    )
                  )
                )
                (local.set $j (i32.add (local.get $j) (i32.const 1)))
                (br $j_loop)
              )
            )
          )
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $i_loop)
        )
      )
    )
    
    (local.get $sum)
  )

  ;; Bubble sort
  (func $bubbleSort (export "bubbleSort") (param $ptr i32) (param $len i32)
    (local $i i32)
    (local $j i32)
    (local $temp i32)
    (local $swapped i32)
    
    (local.set $i (i32.const 0))
    (loop $outer_loop
      (if (i32.lt_s (local.get $i) (local.get $len))
        (then
          (local.set $swapped (i32.const 0))
          (local.set $j (i32.const 0))
          (loop $inner_loop
            (if (i32.lt_s (local.get $j) (i32.sub (local.get $len) (local.get $i) (i32.const 1)))
              (then
                ;; Compare adjacent elements
                (if (i32.gt_s
                      (i32.load (i32.add (local.get $ptr) (i32.shl (local.get $j) (i32.const 2))))
                      (i32.load (i32.add (local.get $ptr) (i32.shl (i32.add (local.get $j) (i32.const 1)) (i32.const 2)))))
                  (then
                    ;; Swap
                    (local.set $temp (i32.load (i32.add (local.get $ptr) (i32.shl (local.get $j) (i32.const 2)))))
                    (i32.store 
                      (i32.add (local.get $ptr) (i32.shl (local.get $j) (i32.const 2)))
                      (i32.load (i32.add (local.get $ptr) (i32.shl (i32.add (local.get $j) (i32.const 1)) (i32.const 2))))
                    )
                    (i32.store
                      (i32.add (local.get $ptr) (i32.shl (i32.add (local.get $j) (i32.const 1)) (i32.const 2)))
                      (local.get $temp)
                    )
                    (local.set $swapped (i32.const 1))
                  )
                )
                (local.set $j (i32.add (local.get $j) (i32.const 1)))
                (br $inner_loop)
              )
            )
          )
          (if (i32.eq (local.get $swapped) (i32.const 0))
            (then (return))
          )
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $outer_loop)
        )
      )
    )
  )
)