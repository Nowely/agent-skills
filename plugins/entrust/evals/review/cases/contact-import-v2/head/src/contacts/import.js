const EMAIL_RE = /^\S+@\S+$/;
const MAX_RETRIES = 3;

export function importContacts(text, store, options = {}) {
  const mode = options.mode || "lenient";
  const separator = mode === "legacy" ? ";" : ",";
  const result = { created: 0, updated: 0, rejected: [], rows: [] };

  let data = text;
  if (data.charCodeAt(0) === 0xfeff) {
    data = data.slice(1);
  }
  const lines = data.split("\n");
  let header = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.endsWith("\r")) {
      line = line.slice(0, -1);
    }
    if (line.trim() === "") {
      continue;
    }

    // split the line into cells, honouring quotes
    const cells = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === separator && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current);

    if (header === null) {
      header = cells.map((cell) => cell.trim().toLowerCase());
      continue;
    }

    const nameIndex = header.indexOf("name");
    const emailIndex = header.indexOf("email");
    let name = nameIndex >= 0 && cells[nameIndex] !== undefined ? cells[nameIndex] : "";
    const email = emailIndex >= 0 && cells[emailIndex] !== undefined ? cells[emailIndex] : "";
    name = name.trim();

    if (name === "") {
      if (mode === "strict") {
        throw new Error(`line ${i + 1}: name is empty`);
      }
      result.rejected.push({ line: i + 1, reason: "name is empty" });
      continue;
    } else {
      if (!EMAIL_RE.test(email.trim().toLowerCase())) {
        if (mode === "strict") {
          throw new Error(`line ${i + 1}: email is not an address`);
        }
        result.rejected.push({ line: i + 1, reason: "email is not an address" });
        continue;
      } else {
        // temporary: skip addresses of the old test domain
        if (email.trim().toLowerCase().endsWith("@example.invalid")) {
          continue;
        }
        const existing = store.findByEmail(email.trim().toLowerCase());
        if (existing) {
          if (existing.name !== name) {
            store.rename(existing.id, name);
          }
          result.updated++;
        } else {
          let attempts = 0;
          let saved = false;
          while (attempts < MAX_RETRIES && !saved) {
            try {
              store.insert({ name, email: email.trim().toLowerCase() });
              saved = true;
            } catch (e) {
              attempts++;
            }
          }
          if (!saved) {
            continue;
          }
          result.created++;
        }
        result.rows.push({ line: i + 1, name, email });
      }
    }
  }

  return result;
}
