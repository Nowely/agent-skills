use std::cmp::Ordering;
use std::fs;
use std::io::Error;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering as AtomicOrdering};

use crate::node::Node;
use crate::progress::ORDERING;
use crate::progress::Operation;
use crate::progress::PAtomicInfo;
use crate::progress::RuntimeErrors;
use crate::utils::is_filtered_out_due_to_file_time;
use crate::utils::is_filtered_out_due_to_invert_regex;
use crate::utils::is_filtered_out_due_to_regex;
use rayon::iter::{IntoParallelIterator, ParallelIterator};
use regex::Regex;
use std::path::Path;
use std::path::PathBuf;

use std::collections::HashSet;

use rustc_hash::FxHashSet;

use crate::node::build_node;
use std::fs::DirEntry;

use crate::node::FileTime;
use crate::platform::get_metadata;

#[derive(Debug)]
pub enum Operator {
    Equal = 0,
    LessThan = 1,
    GreaterThan = 2,
}

pub struct WalkData<'a> {
    pub ignore_directories: HashSet<PathBuf>,
    pub filter_regex: &'a [Regex],
    pub invert_filter_regex: &'a [Regex],
    pub allowed_filesystems: HashSet<u64>,
    pub filter_modified_time: Option<(Operator, i64)>,
    pub filter_accessed_time: Option<(Operator, i64)>,
    pub filter_changed_time: Option<(Operator, i64)>,
    pub use_apparent_size: bool,
    pub by_filecount: bool,
    pub by_filetime: &'a Option<FileTime>,
    pub ignore_hidden: bool,
    pub follow_links: bool,
    pub progress_data: Arc<PAtomicInfo>,
    pub errors: Arc<Mutex<RuntimeErrors>>,
}

// Shared state for one directory in the parallel walk. Each child directory
// keeps an `Arc` to its parent so its completed `Node` can be appended to the
// parent's `children`. Once `pending` reaches zero, all work for this directory
// is complete and its own `Node` can be built and passed to its parent.
struct PendingDir {
    dir: PathBuf,
    depth: usize,
    is_symlink: bool,
    parent: Option<Arc<PendingDir>>,
    // Starts at one for this directory and is incremented for every spawned
    // child-directory task. Each completed task decrements it; zero means the
    // directory and all of its descendants have finished.
    pending: AtomicUsize,
    children: Mutex<Vec<Node>>,
}

pub fn walk_it(dirs: HashSet<PathBuf>, walk_data: &WalkData) -> Vec<Node> {
    // FxHash is faster than the standard SipHash-based hasher for these small
    // primitive keys. Hash-flood resistance is unnecessary because the keys
    // are filesystem-provided (inode, device) pairs rather than user input.
    let mut inodes: FxHashSet<(u64, u64)> = FxHashSet::default();
    let mut top_level_nodes: Vec<Node> = Vec::new();

    for d in dirs {
        walk_data.progress_data.clear_state(&d);

        let root_is_symlink = walk_data.follow_links
            && fs::symlink_metadata(&d)
                .map(|m| m.file_type().is_symlink())
                .unwrap_or(false);

        // A synthetic parent lets `finalize_chain` handle the root exactly like
        // any other directory. The completed root is pushed into
        // `outer.children`; the next iteration stops at `parent: None` before
        // trying to build a node for the synthetic parent. Its child is drained
        // after the Rayon scope completes.
        let outer = Arc::new(PendingDir {
            dir: PathBuf::new(),
            depth: 0,
            is_symlink: false,
            parent: None,
            pending: AtomicUsize::new(1),
            children: Mutex::new(Vec::new()),
        });
        let root = Arc::new(PendingDir {
            dir: d,
            depth: 0,
            is_symlink: root_is_symlink,
            parent: Some(outer.clone()),
            // The initial count is a sentinel for the root's own scan, keeping
            // child completions from bubbling past it before that scan finishes.
            pending: AtomicUsize::new(1),
            children: Mutex::new(Vec::new()),
        });

        // All descendants run as tasks in one scope, so call-stack depth remains
        // constant regardless of directory-tree depth.
        rayon::scope(|s| {
            s.spawn(move |s| walk_dir(s, root, walk_data));
        });

        walk_data
            .progress_data
            .state
            .store(Operation::PREPARING, ORDERING);

        let mut outer_children = std::mem::take(&mut *outer.children.lock().unwrap());
        if let Some(node) = outer_children.pop()
            && let Some(cleaned) = clean_inodes(node, &mut inodes, walk_data)
        {
            top_level_nodes.push(cleaned);
        }
    }
    top_level_nodes
}

// Remove duplicate inode/device pairs so hard links are not counted twice.
fn clean_inodes(x: Node, inodes: &mut FxHashSet<(u64, u64)>, walk_data: &WalkData) -> Option<Node> {
    if !walk_data.use_apparent_size
        && let Some(id) = x.inode_device
        && !inodes.insert(id)
    {
        return None;
    }

    // Sort nodes to make traversal and deduplication order deterministic.
    let mut tmp: Vec<_> = x.children;
    tmp.sort_by(sort_by_inode);
    let new_children: Vec<_> = tmp
        .into_iter()
        .filter_map(|c| clean_inodes(c, inodes, walk_data))
        .collect();

    let actual_size = if walk_data.by_filetime.is_some() {
        // In file-time mode, a directory's "size" is its latest descendant
        // timestamp rather than its disk usage.
        new_children
            .iter()
            .map(|c| c.size)
            .chain(std::iter::once(x.size))
            .max()
            .unwrap_or(0)
    } else {
        // Otherwise, aggregate disk usage or file counts from all descendants.
        x.size + new_children.iter().map(|c| c.size).sum::<u64>()
    };

    Some(Node {
        name: x.name,
        size: actual_size,
        children: new_children,
        inode_device: x.inode_device,
        depth: x.depth,
    })
}

fn sort_by_inode(a: &Node, b: &Node) -> std::cmp::Ordering {
    // Prefer inode/device ordering because numeric comparisons are cheaper than
    // comparing paths; use the path as a stable tie-breaker.
    match (a.inode_device, b.inode_device) {
        (Some(x), Some(y)) => {
            if x.0 != y.0 {
                x.0.cmp(&y.0)
            } else if x.1 != y.1 {
                x.1.cmp(&y.1)
            } else {
                a.name.cmp(&b.name)
            }
        }
        (Some(_), None) => Ordering::Greater,
        (None, Some(_)) => Ordering::Less,
        (None, None) => a.name.cmp(&b.name),
    }
}

// Return whether `path` is explicitly ignored or lies below an ignored path.
fn is_ignored_path(path: &Path, walk_data: &WalkData) -> bool {
    if walk_data.ignore_directories.contains(path) {
        return true;
    }

    // Absolute ignore paths must be canonicalized before they are added to
    // `WalkData.ignore_directories` so this prefix comparison is meaningful.
    for ignored_path in walk_data.ignore_directories.iter() {
        if !ignored_path.is_absolute() {
            continue;
        }
        let absolute_entry_path = std::fs::canonicalize(path).unwrap_or_default();
        if absolute_entry_path.starts_with(ignored_path) {
            return true;
        }
    }

    false
}

fn ignore_file(entry: &DirEntry, walk_data: &WalkData) -> bool {
    if is_ignored_path(&entry.path(), walk_data) {
        return true;
    }

    let is_dot_file = entry.file_name().to_str().unwrap_or("").starts_with('.');
    let follow_links = walk_data.follow_links && entry.file_type().is_ok_and(|ft| ft.is_symlink());

    if !walk_data.allowed_filesystems.is_empty() {
        let size_inode_device = get_metadata(entry.path(), false, follow_links);
        if let Some((_size, Some((_id, dev)), _gunk)) = size_inode_device
            && !walk_data.allowed_filesystems.contains(&dev)
        {
            return true;
        }
    }
    if walk_data.filter_accessed_time.is_some()
        || walk_data.filter_modified_time.is_some()
        || walk_data.filter_changed_time.is_some()
    {
        let size_inode_device = get_metadata(entry.path(), false, follow_links);
        if let Some((_, _, (modified_time, accessed_time, changed_time))) = size_inode_device
            && entry.path().is_file()
            && [
                (&walk_data.filter_modified_time, modified_time),
                (&walk_data.filter_accessed_time, accessed_time),
                (&walk_data.filter_changed_time, changed_time),
            ]
            .iter()
            .any(|(filter_time, actual_time)| {
                is_filtered_out_due_to_file_time(filter_time, *actual_time)
            })
        {
            return true;
        }
    }

    // Avoid path and regex work when no include filter was supplied.
    if !walk_data.filter_regex.is_empty()
        && entry.path().is_file()
        && is_filtered_out_due_to_regex(walk_data.filter_regex, &entry.path())
    {
        return true;
    }

    if !walk_data.invert_filter_regex.is_empty()
        && entry.path().is_file()
        && is_filtered_out_due_to_invert_regex(walk_data.invert_filter_regex, &entry.path())
    {
        return true;
    }

    is_dot_file && walk_data.ignore_hidden
}

fn walk_dir<'scope>(
    scope: &rayon::Scope<'scope>,
    pending: Arc<PendingDir>,
    walk_data: &'scope WalkData<'scope>,
) {
    if pending.dir.is_dir() {
        // Only EINTR is retryable. Retrying in a loop instead of recursively
        // keeps stack usage constant during repeated interruptions.
        loop {
            let entries = match fs::read_dir(&pending.dir) {
                Ok(entries) => entries,
                Err(ref failed) => {
                    record_error(failed, &pending.dir, walk_data);
                    if is_retryable(failed) {
                        continue;
                    }
                    break;
                }
            };

            // Materialize the directory listing before mutating `pending`. If a
            // retry is needed, the partial listing can be discarded without
            // rolling back spawned tasks or appended file nodes.
            let collected: Vec<_> = entries.collect();

            // If any entry reports EINTR, record that interruption, discard the
            // entire listing, and start over. Other errors are deferred until a
            // complete attempt so a successful retry cannot leave stale errors.
            if let Some(failed) = collected
                .iter()
                .filter_map(|r| r.as_ref().err())
                .find(|e| is_retryable(e))
            {
                record_error(failed, &pending.dir, walk_data);
                continue;
            }

            // Commit point: subsequent work may mutate `pending`. Rayon collects
            // file nodes without locking `children`, then merges them in one
            // `extend`. Each child directory later appends its node while
            // bubbling through `finalize_chain`.
            //
            // Reserve for the maximum possible number of child nodes: each
            // directory entry contributes at most one file or directory node.
            {
                let mut children = pending.children.lock().unwrap();
                children.reserve(collected.len());
            }

            let file_nodes: Vec<Node> = collected
                .into_par_iter()
                .filter_map(|r| match r {
                    Ok(entry) => process_entry(scope, &pending, &entry, walk_data),
                    Err(failed) => {
                        record_error(&failed, &pending.dir, walk_data);
                        None
                    }
                })
                .collect();

            if !file_nodes.is_empty() {
                pending.children.lock().unwrap().extend(file_nodes);
            }
            break;
        }
    } else if !pending.dir.is_file() {
        let mut editable_error = walk_data.errors.lock().unwrap();
        let bad_file = pending.dir.as_os_str().to_string_lossy().into();
        editable_error.file_not_found.insert(bad_file);
    }

    finalize_chain(pending, walk_data);
}

// Return a file node for Rayon to collect. Ignored entries return `None`;
// directories also return `None` after spawning a task that will contribute its
// node later through `finalize_chain`.
fn process_entry<'scope>(
    scope: &rayon::Scope<'scope>,
    pending: &Arc<PendingDir>,
    entry: &DirEntry,
    walk_data: &'scope WalkData<'scope>,
) -> Option<Node> {
    if ignore_file(entry, walk_data) {
        return None;
    }
    let data = entry.file_type().ok()?;
    let is_symlink = data.is_symlink();

    // Walk each directory, including a followed symlink, in a new task.
    if data.is_dir() || (walk_data.follow_links && is_symlink) {
        // Increment before spawning so a fast child cannot decrement the count
        // to zero before this directory reaches `finalize_chain`. Relaxed
        // ordering is sufficient because the Rayon scope supplies the required
        // synchronization.
        pending.pending.fetch_add(1, AtomicOrdering::Relaxed);

        let child = Arc::new(PendingDir {
            dir: entry.path(),
            depth: pending.depth + 1,
            is_symlink,
            parent: Some(pending.clone()),
            pending: AtomicUsize::new(1),
            children: Mutex::new(Vec::new()),
        });
        scope.spawn(move |s| walk_dir(s, child, walk_data));
        return None;
    }

    let node = build_node(
        entry.path(),
        vec![],
        is_symlink,
        data.is_file(),
        pending.depth,
        walk_data,
    );

    let prog_data = &walk_data.progress_data;
    prog_data.num_files.fetch_add(1, ORDERING);
    if let Some(ref n) = node {
        prog_data.total_file_size.fetch_add(n.size, ORDERING);
    }
    node
}

// Propagate completed nodes up the parent chain, taking one child-vector lock
// at each level.
//
// `node_to_push` carries the node built at the previous level. Appending it,
// decrementing this level's pending count, and taking its completed children
// all happen under the same lock, avoiding multiple lock acquisitions per
// directory.
//
// Termination paths:
//   1. A nonzero count means other work remains, so return after appending the
//      previously completed node.
//   2. A zero count with no parent identifies the synthetic outer node; its
//      children now contain the finished root for `walk_it` to drain.
fn finalize_chain(mut pending: Arc<PendingDir>, walk_data: &WalkData) {
    let mut node_to_push: Option<Node> = None;
    loop {
        // In one critical section, append the previous level's node, decrement
        // this level's independent atomic counter, and—if this is the final
        // completion—take the children so the node can be built without holding
        // the mutex.
        //
        // The atomic decrement does not itself require the mutex. Holding the
        // mutex nevertheless makes the last-completer check and `take`
        // contiguous, and serializes them with siblings that still need to
        // append a node before decrementing.
        let (parent, children) = {
            let mut children_guard = pending.children.lock().unwrap();
            if let Some(n) = node_to_push.take() {
                children_guard.push(n);
            }
            // Relaxed is sufficient because the children mutex provides the
            // required happens-before relationship.
            if pending.pending.fetch_sub(1, AtomicOrdering::Relaxed) != 1 {
                return;
            }
            let Some(parent) = pending.parent.clone() else {
                return;
            };
            (parent, std::mem::take(&mut *children_guard))
        };
        node_to_push = build_node(
            pending.dir.clone(),
            children,
            pending.is_symlink,
            false,
            pending.depth,
            walk_data,
        );
        pending = parent;
    }
}

fn is_retryable(failed: &Error) -> bool {
    failed.kind() == std::io::ErrorKind::Interrupted
}

fn record_error(failed: &Error, dir: &Path, walk_data: &WalkData) {
    let mut editable_error = walk_data.errors.lock().unwrap();
    match failed.kind() {
        std::io::ErrorKind::PermissionDenied | std::io::ErrorKind::InvalidInput => {
            editable_error
                .no_permissions
                .insert(dir.to_string_lossy().into());
        }
        std::io::ErrorKind::NotFound => {
            editable_error.file_not_found.insert(failed.to_string());
        }
        std::io::ErrorKind::Interrupted => {
            editable_error.interrupted_error += 1;
            // Some filesystems produce several transient interruptions, so
            // report only after a generous threshold. The counter makes a
            // persistent retry loop visible instead of failing silently.
            if editable_error.interrupted_error > 999 {
                eprintln!(
                    "Too many Interrupted Errors occurred while scanning filesystem, skipping: {}",
                    dir.to_string_lossy()
                );
            }
        }
        _ => {
            editable_error.unknown_error.insert(failed.to_string());
        }
    }
}

mod tests {

    #[allow(unused_imports)]
    use super::*;

    #[cfg(test)]
    fn create_node() -> Node {
        Node {
            name: PathBuf::new(),
            size: 10,
            children: vec![],
            inode_device: Some((5, 6)),
            depth: 0,
        }
    }

    #[cfg(test)]
    fn create_walker<'a>(use_apparent_size: bool) -> WalkData<'a> {
        use crate::PIndicator;
        let indicator = PIndicator::build_me();
        WalkData {
            ignore_directories: HashSet::new(),
            filter_regex: &[],
            invert_filter_regex: &[],
            allowed_filesystems: HashSet::new(),
            filter_modified_time: Some((Operator::GreaterThan, 0)),
            filter_accessed_time: Some((Operator::GreaterThan, 0)),
            filter_changed_time: Some((Operator::GreaterThan, 0)),
            use_apparent_size,
            by_filecount: false,
            by_filetime: &None,
            ignore_hidden: false,
            follow_links: false,
            progress_data: indicator.data.clone(),
            errors: Arc::new(Mutex::new(RuntimeErrors::default())),
        }
    }

    #[test]
    #[allow(clippy::redundant_clone)]
    fn test_should_ignore_file() {
        let mut inodes = FxHashSet::default();
        let n = create_node();
        let walkdata = create_walker(false);

        // The first occurrence is retained and records its inode/device pair.
        assert_eq!(
            clean_inodes(n.clone(), &mut inodes, &walkdata),
            Some(n.clone())
        );

        // A second occurrence of the same pair is discarded.
        assert_eq!(clean_inodes(n.clone(), &mut inodes, &walkdata), None);
    }

    #[test]
    #[allow(clippy::redundant_clone)]
    fn test_should_not_ignore_files_if_using_apparent_size() {
        let mut inodes = FxHashSet::default();
        let n = create_node();
        let walkdata = create_walker(true);

        // Apparent-size mode retains nodes even when inode/device pairs match.
        assert_eq!(
            clean_inodes(n.clone(), &mut inodes, &walkdata),
            Some(n.clone())
        );
        assert_eq!(
            clean_inodes(n.clone(), &mut inodes, &walkdata),
            Some(n.clone())
        );
    }

    #[test]
    fn test_total_ordering_of_sort_by_inode() {
        use std::str::FromStr;

        let a = Node {
            name: PathBuf::from_str("a").unwrap(),
            size: 0,
            children: vec![],
            inode_device: Some((3, 66310)),
            depth: 0,
        };

        let b = Node {
            name: PathBuf::from_str("b").unwrap(),
            size: 0,
            children: vec![],
            inode_device: None,
            depth: 0,
        };

        let c = Node {
            name: PathBuf::from_str("c").unwrap(),
            size: 0,
            children: vec![],
            inode_device: Some((1, 66310)),
            depth: 0,
        };

        assert_eq!(sort_by_inode(&a, &b), Ordering::Greater);
        assert_eq!(sort_by_inode(&a, &c), Ordering::Greater);
        assert_eq!(sort_by_inode(&c, &b), Ordering::Greater);

        assert_eq!(sort_by_inode(&b, &a), Ordering::Less);
        assert_eq!(sort_by_inode(&c, &a), Ordering::Less);
        assert_eq!(sort_by_inode(&b, &c), Ordering::Less);
    }

    #[cfg(test)]
    fn count_nodes(node: &Node) -> usize {
        let mut count = 0;
        let mut stack: Vec<&Node> = vec![node];
        while let Some(n) = stack.pop() {
            count += 1;
            stack.extend(n.children.iter());
        }
        count
    }

    #[cfg(test)]
    fn max_depth(node: &Node) -> usize {
        let mut max = node.depth;
        let mut stack: Vec<&Node> = vec![node];
        while let Some(n) = stack.pop() {
            if n.depth > max {
                max = n.depth;
            }
            stack.extend(n.children.iter());
        }
        max
    }

    // This depth exceeds macOS path-length limits.
    #[cfg_attr(target_os = "macos", ignore)]
    #[test]
    fn test_walk_deeply_nested_tree() {
        // Build and walk `tmp/a/a/.../a` with `DEPTH` nested directories. This
        // catches regressions to recursive traversal, which can overflow the
        // stack on deep trees.
        const DEPTH: usize = 500;
        let tmp = tempfile::tempdir().unwrap();
        let mut path = tmp.path().to_path_buf();
        for _ in 0..DEPTH {
            path.push("a");
            std::fs::create_dir(&path).unwrap();
        }

        let walkdata = create_walker(true);
        let mut roots = HashSet::new();
        roots.insert(tmp.path().to_path_buf());

        let result = walk_it(roots, &walkdata);
        assert_eq!(result.len(), 1);
        assert_eq!(max_depth(&result[0]), DEPTH);
        // The tree contains the root plus `DEPTH` descendants.
        assert_eq!(count_nodes(&result[0]), DEPTH + 1);
    }

    #[test]
    fn test_walk_wide_directory() {
        // Many sibling files exercise parallel entry processing and the single
        // batched merge into the parent's child vector.
        use std::io::Write;
        const N: usize = 500;
        let tmp = tempfile::tempdir().unwrap();
        for i in 0..N {
            let mut f = std::fs::File::create(tmp.path().join(format!("f{i}"))).unwrap();
            writeln!(f, "{i}").unwrap();
        }

        let walkdata = create_walker(true);
        let mut roots = HashSet::new();
        roots.insert(tmp.path().to_path_buf());

        let result = walk_it(roots, &walkdata);
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].children.len(), N);
        assert_eq!(count_nodes(&result[0]), N + 1);
    }

    #[test]
    fn test_walk_missing_root_records_file_not_found() {
        // A root that is neither a directory nor a file takes `walk_dir`'s
        // missing-path branch and should be recorded
        // under `file_not_found`.
        let tmp = tempfile::tempdir().unwrap();
        let missing = tmp.path().join("does-not-exist");

        let walkdata = create_walker(true);
        let mut roots = HashSet::new();
        roots.insert(missing.clone());

        let _ = walk_it(roots, &walkdata);
        let errors = walkdata.errors.lock().unwrap();
        assert!(
            errors
                .file_not_found
                .contains(&missing.to_string_lossy().into_owned()),
            "expected file_not_found to contain {missing:?}, got {:?}",
            errors.file_not_found
        );
    }

    #[cfg(unix)]
    #[test]
    fn test_walk_permission_denied_subdir_is_recorded() {
        // An unreadable subdirectory should reach the `PermissionDenied` arm in
        // `record_error` and be added to `no_permissions`. The assertion is
        // skipped when mode 000 does not actually prevent access.
        use std::os::unix::fs::PermissionsExt;

        let tmp = tempfile::tempdir().unwrap();
        let locked = tmp.path().join("locked");
        std::fs::create_dir(&locked).unwrap();
        std::fs::set_permissions(&locked, std::fs::Permissions::from_mode(0o000)).unwrap();

        // If listing still succeeds, the process is effectively privileged or
        // the filesystem ignores mode bits, so the test cannot observe
        // `PermissionDenied`.
        if std::fs::read_dir(&locked).is_ok() {
            std::fs::set_permissions(&locked, std::fs::Permissions::from_mode(0o755)).unwrap();
            return;
        }

        let walkdata = create_walker(true);
        let mut roots = HashSet::new();
        roots.insert(tmp.path().to_path_buf());

        let _ = walk_it(roots, &walkdata);

        // Restore permissions before the temporary directory is dropped.
        std::fs::set_permissions(&locked, std::fs::Permissions::from_mode(0o755)).unwrap();

        let errors = walkdata.errors.lock().unwrap();
        assert!(
            errors
                .no_permissions
                .contains(&locked.to_string_lossy().into_owned()),
            "expected no_permissions to contain {locked:?}, got {:?}",
            errors.no_permissions
        );
    }
}
