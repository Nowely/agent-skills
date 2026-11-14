function foldReference(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

function createReferenceIndex(canonicalIds, aidRows, kind) {
  const canonicalExact = new Set();
  const canonicalFolded = new Map();

  for (const id of canonicalIds) {
    if (typeof id !== "string" || id.length === 0) {
      throw new TypeError(`${kind} canonical IDs must be non-empty strings`);
    }
    if (canonicalExact.has(id)) {
      throw new TypeError(`Duplicate ${kind} canonical ID: ${id}`);
    }

    const folded = foldReference(id);
    const previous = canonicalFolded.get(folded);
    if (previous !== undefined && previous !== id) {
      throw new TypeError(
        `${kind} canonical IDs collide after normalization: ${previous}, ${id}`,
      );
    }

    canonicalExact.add(id);
    canonicalFolded.set(folded, id);
  }

  const aliases = new Map();

  for (const row of aidRows) {
    if (!canonicalExact.has(row.id)) {
      throw new TypeError(`Unknown ${kind} aid canonical ID: ${row.id}`);
    }

    for (const alias of row.aliases ?? []) {
      if (typeof alias !== "string" || alias.length === 0) {
        throw new TypeError(`${kind} aliases must be non-empty strings`);
      }

      const folded = foldReference(alias);
      const canonicalMatch = canonicalFolded.get(folded);
      if (canonicalMatch !== undefined && canonicalMatch !== row.id) {
        throw new TypeError(
          `${kind} alias collides with canonical ID ${canonicalMatch}: ${alias}`,
        );
      }

      const previous = aliases.get(folded);
      if (previous !== undefined && previous !== row.id) {
        throw new TypeError(`Ambiguous ${kind} alias: ${alias}`);
      }
      aliases.set(folded, row.id);
    }
  }

  return (reference) => {
    if (canonicalExact.has(reference)) return reference;
    if (typeof reference !== "string" || reference.length === 0) {
      return reference;
    }

    const folded = foldReference(reference);
    return canonicalFolded.get(folded) ?? aliases.get(folded) ?? reference;
  };
}

function requireItems(sourceRequest) {
  if (sourceRequest.items !== undefined) {
    if (!Array.isArray(sourceRequest.items) || sourceRequest.items.length === 0) {
      throw new TypeError("Request items must be a non-empty array");
    }
    return { values: sourceRequest.items, resolveAliases: false };
  }

  if (!Array.isArray(sourceRequest.itemCodes) || sourceRequest.itemCodes.length === 0) {
    throw new TypeError("Request needs non-empty items or itemCodes");
  }
  return { values: sourceRequest.itemCodes, resolveAliases: true };
}

export function createRequestAdapter(operatorAids, varieties) {
  if (operatorAids === undefined) {
    return (request) => request;
  }

  if (operatorAids === null || typeof operatorAids !== "object") {
    throw new TypeError("operatorAids must be an object when provided");
  }

  const varietyAids = operatorAids.varieties ?? [];
  const memberAids = operatorAids.members ?? [];

  if (!Array.isArray(varietyAids) || !Array.isArray(memberAids)) {
    throw new TypeError("operatorAids varieties and members must be arrays");
  }

  const resolveVariety = createReferenceIndex(
    varieties.map((variety) => variety.id),
    varietyAids,
    "variety",
  );
  const resolveMember = createReferenceIndex(
    memberAids.map((member) => member.id),
    memberAids,
    "member",
  );
  const membersById = new Map(memberAids.map((member) => [member.id, member]));

  for (const member of memberAids) {
    if (typeof member.householdId !== "string" || member.householdId.length === 0) {
      throw new TypeError(`Member ${member.id} needs a householdId`);
    }
    if (member.carriedOver !== undefined && typeof member.carriedOver !== "boolean") {
      throw new TypeError(`Member ${member.id} carriedOver must be boolean`);
    }
  }

  return (sourceRequest) => {
    const sourceItems = requireItems(sourceRequest);
    const items = sourceItems.resolveAliases
      ? sourceItems.values.map(resolveVariety)
      : [...sourceItems.values];

    let member;
    if (sourceRequest.memberId !== undefined) {
      const memberId = resolveMember(sourceRequest.memberId);
      member = membersById.get(memberId);
      if (!member) {
        throw new TypeError(`Unknown member reference: ${sourceRequest.memberId}`);
      }
    }

    const householdId = sourceRequest.householdId ?? member?.householdId;
    if (typeof householdId !== "string" || householdId.length === 0) {
      throw new TypeError(
        `Request ${sourceRequest.id} needs householdId or a member default`,
      );
    }

    return {
      ...sourceRequest,
      items,
      householdId,
      carriedOver: sourceRequest.carriedOver ?? member?.carriedOver ?? false,
      permits: [
        ...new Set([
          ...(sourceRequest.permits ?? []),
          ...(member?.permits ?? []),
        ]),
      ],
    };
  };
}
