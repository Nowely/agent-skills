import { createRequestAdapter } from "./operatorAids.js";

const compareText = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

export function planDispatches({
  requests,
  varieties,
  lots,
  cycleDate,
  operatorAids,
}) {
  const varietiesById = new Map(
    varieties.map((variety) => [variety.id, variety]),
  );
  const adaptRequest = createRequestAdapter(operatorAids, varieties);

  const ranked = requests.map((sourceRequest, sourceIndex) => ({
    sourceIndex,
    request: adaptRequest(sourceRequest),
  }));

  ranked.sort((left, right) => {
    const a = left.request;
    const b = right.request;

    const carryDifference = Number(b.carriedOver) - Number(a.carriedOver);
    if (carryDifference !== 0) return carryDifference;

    const submittedDifference = compareText(a.submittedAt, b.submittedAt);
    if (submittedDifference !== 0) return submittedDifference;

    return compareText(a.id, b.id) || left.sourceIndex - right.sourceIndex;
  });

  const lotState = lots
    .map((lot, sourceIndex) => ({
      ...lot,
      sourceIndex,
      remaining: lot.packets,
      used: 0,
    }))
    .sort(
      (left, right) =>
        compareText(left.expiresOn, right.expiresOn) ||
        compareText(left.id, right.id) ||
        left.sourceIndex - right.sourceIndex,
    );

  const packets = [];
  const skipped = [];
  const labels = [];
  const alliumHouseholds = new Set();

  for (const { request } of ranked) {
    const permits = new Set(request.permits ?? []);
    const hadAlliumBeforeRequest = alliumHouseholds.has(request.householdId);
    const staged = [];
    let failure;

    for (const varietyId of request.items) {
      const variety = varietiesById.get(varietyId);

      if (!variety) {
        failure = { varietyId, reason: "unknown-variety" };
        break;
      }

      if (variety.treatment === "scarified" && !permits.has("SCARIFY")) {
        failure = { varietyId, reason: "permit-required" };
        break;
      }

      if (
        variety.family === "allium" &&
        alliumHouseholds.has(request.householdId)
      ) {
        failure = { varietyId, reason: "household-allium-limit" };
        break;
      }

      const lot = lotState.find(
        (candidate) =>
          candidate.varietyId === varietyId &&
          candidate.remaining > 0 &&
          candidate.expiresOn >= cycleDate,
      );

      if (!lot) {
        failure = { varietyId, reason: "out-of-stock" };
        break;
      }

      lot.remaining -= 1;
      lot.used += 1;

      if (variety.family === "allium") {
        alliumHouseholds.add(request.householdId);
      }

      staged.push({ varietyId, lot });
    }

    if (failure) {
      for (let index = staged.length - 1; index >= 0; index -= 1) {
        staged[index].lot.remaining += 1;
        staged[index].lot.used -= 1;
      }

      if (hadAlliumBeforeRequest) {
        alliumHouseholds.add(request.householdId);
      } else {
        alliumHouseholds.delete(request.householdId);
      }

      skipped.push({
        requestId: request.id,
        varietyId: failure.varietyId,
        reason: failure.reason,
      });
      continue;
    }

    for (const { varietyId, lot } of staged) {
      packets.push({
        requestId: request.id,
        householdId: request.householdId,
        varietyId,
        lotId: lot.id,
      });
      labels.push(`${request.id}:${varietyId}@${lot.id}`);
    }
  }

  const lotUse = lotState
    .filter((lot) => lot.used > 0)
    .sort((left, right) => compareText(left.id, right.id))
    .map((lot) => ({
      lotId: lot.id,
      varietyId: lot.varietyId,
      used: lot.used,
      remaining: lot.remaining,
    }));

  return { packets, skipped, labels, lotUse };
}
