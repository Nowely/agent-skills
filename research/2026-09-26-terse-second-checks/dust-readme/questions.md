# Question readers: questions and the key, written from the code before any reader runs

1. I'm on a Mac. How do I install dust?
   Key: `brew install dust`, or the install script (`curl … install.sh | sh`). README install list; install.sh.
2. I want to see only the 10 biggest things in my home folder. What do I type?
   Key: `dust -n 10 ~` (`-n`/`--number-of-lines`, src/cli.rs:24-26).
3. What does dust show me that plain du does not?
   Key: the largest entries as a sorted tree, each with a bar for its share, cut to what fits the terminal
   (src/cli.rs:8 "Like du but more intuitive"; README demo). Right if it names the tree of largest entries
   with their share.
4. How do I make dust skip the node_modules folder of my project?
   Key: `dust -X node_modules` (`--ignore-directory`), which skips that path inside each target directory
   (src/main.rs:176-218, src/dir_walker.rs:191-208); at any depth, `-v node_modules`, a regex over file
   paths (src/cli.rs:101-110, src/utils.rs:105-109). Either form is right.
