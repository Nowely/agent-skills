const compareText = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
};

export function planDispatches({ requests, varieties, lots }) {
  const knownVarieties = new Set(varieties.map((variety) => variety.id));
  const lotState = lots.map((lot) => ({
    ...lot,
    remaining: lot.packets,
    used: 0,
  }));

  const packets = [];
  const skipped = [];
  const labels = [];

  for (const request of requests) {
    const staged = [];
    let failure;

    for (const varietyId of request.items) {
      if (!knownVarieties.has(varietyId)) {
        failure = { varietyId, reason: "unknown-variety" };
        break;
      }

      const lot = lotState.find(
        (candidate) =>
          candidate.varietyId === varietyId && candidate.remaining > 0,
      );

      if (!lot) {
        failure = { varietyId, reason: "out-of-stock" };
        break;
      }

      lot.remaining -= 1;
      lot.used += 1;
      staged.push({ varietyId, lot });
    }

    if (failure) {
      for (let index = staged.length - 1; index >= 0; index -= 1) {
        staged[index].lot.remaining += 1;
        staged[index].lot.used -= 1;
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
