# Question readers: questions and the key, written from the code before any reader runs

1. What happens when listing a directory is interrupted by a signal (EINTR)? Does dust give up after some
   number of retries?
   Key: it lists the directory again, from scratch, every time: `walk_dir` loops on a retryable error
   (lines 274-305; `is_retryable` is `ErrorKind::Interrupted` only, 457-459). Each one adds 1 to
   `interrupted_error`; past 999 it prints "Too many Interrupted Errors … skipping" but keeps retrying — nothing
   stops the loop and nothing panics (472-481; no `panic!` on this path in src/). Right if it says it retries
   without a limit that stops it; wrong if it says dust gives up, skips or panics after a threshold.
2. When is a directory's Node built, and by which task?
   Key: by whichever task brings the directory's `pending` count to zero — the last to finish among the
   directory's own listing and each of its subdirectory tasks — in `finalize_chain`, after it takes the
   children out of the lock; the Node is then pushed into the parent on the next turn of the loop
   (lines 55-59, 65-67, 366-370, 430-453). Right if it names the last task to finish, the one that takes
   `pending` to zero.
3. Why does `process_entry` return a file's Node instead of pushing it into `pending.children` itself?
   Key: so file Nodes gather thread by thread in rayon's `collect`, without taking the children lock per
   file, and join the children in one `extend` (lines 307-312, 323-336, 348-351). Right if it names avoiding a
   lock per file, or contention on the children lock.
