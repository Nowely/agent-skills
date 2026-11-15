import { fetchInvoices } from "@acme/billing-client";
import { readArchive } from "./archive.js";

// Every invoice the screens and the export work with: the service's, then the archive's.
export async function loadInvoices({ transport, archiveRows }) {
  return [...await fetchInvoices(transport), ...readArchive(archiveRows)];
}
