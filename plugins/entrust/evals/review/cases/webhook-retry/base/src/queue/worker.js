import { deliver } from "../delivery/deliver.js";

// The queue leases a job to one handler at a time and hands it out again only when that handler's
// process died before returning. The same message can therefore reach deliver() twice, never concurrently.
export async function handle(job, deps) {
  return deliver(job.message, deps);
}
