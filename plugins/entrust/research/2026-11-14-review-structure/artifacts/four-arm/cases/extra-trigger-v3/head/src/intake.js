import { createRuleCache } from './rule-cache.js';

export class IntakeError extends Error {
  constructor(code, message, details = {}) {
    super(message, details.cause === undefined ? undefined : { cause: details.cause });
    this.name = 'IntakeError';
    this.code = code;
    this.shipmentId = details.shipmentId;
    this.crateId = details.crateId ?? null;
    this.kind = details.kind;
  }
}

export function createIntake({ loadRule, emit = () => {}, schedule = queueMicrotask } = {}) {
  if (typeof loadRule !== 'function') {
    throw new TypeError('loadRule must be a function');
  }
  if (typeof emit !== 'function') {
    throw new TypeError('emit must be a function');
  }
  if (typeof schedule !== 'function') {
    throw new TypeError('schedule must be a function');
  }

  return { processShipment };

  async function processShipment(shipment) {
    if (!shipment || typeof shipment.id !== 'string' || shipment.id.length === 0 || !Array.isArray(shipment.crates)) {
      throw new IntakeError('INVALID_SHIPMENT', 'A shipment needs an id and a crates array');
    }

    const rules = createRuleCache(loadRule, schedule);
    const shipmentId = shipment.id;
    emit({ type: 'intake.started', shipmentId, count: shipment.crates.length });
    rules.warmAll(shipment.crates.map(crate => crate?.kind));

    const seen = new Set();
    const kinds = new Set();
    let totalKg = 0;

    for (const crate of shipment.crates) {
      if (!crate || typeof crate.id !== 'string' || crate.id.length === 0 ||
          typeof crate.kind !== 'string' || crate.kind.length === 0 ||
          typeof crate.kg !== 'number' || !Number.isFinite(crate.kg) || crate.kg <= 0) {
        return fail(new IntakeError('INVALID_CRATE', 'A crate needs an id, kind, and positive weight', {
          shipmentId,
          crateId: typeof crate?.id === 'string' ? crate.id : null
        }));
      }
      if (seen.has(crate.id)) {
        return fail(new IntakeError('DUPLICATE_CRATE', `Duplicate crate: ${crate.id}`, {
          shipmentId,
          crateId: crate.id,
          kind: crate.kind
        }));
      }
      seen.add(crate.id);

      let rule;
      try {
        rule = await rules.load(crate.kind);
      } catch (cause) {
        return fail(new IntakeError('RULE_LOAD_FAILED', `Could not load rule: ${crate.kind}`, {
          shipmentId,
          crateId: crate.id,
          kind: crate.kind,
          cause
        }));
      }

      if (!rule || typeof rule.maxKg !== 'number' || !Number.isFinite(rule.maxKg) || rule.maxKg <= 0) {
        return fail(new IntakeError('INVALID_RULE', `Invalid rule: ${crate.kind}`, {
          shipmentId,
          crateId: crate.id,
          kind: crate.kind
        }));
      }
      if (rule.maxKg < crate.kg) {
        return fail(new IntakeError('OVERWEIGHT', `Crate ${crate.id} exceeds ${rule.maxKg} kg`, {
          shipmentId,
          crateId: crate.id,
          kind: crate.kind
        }));
      }

      totalKg += crate.kg;
      kinds.add(crate.kind);
      emit({ type: 'crate.accepted', shipmentId, crateId: crate.id, kind: crate.kind, kg: crate.kg });
    }

    const result = {
      shipmentId,
      count: shipment.crates.length,
      totalKg,
      kinds: [...kinds].sort()
    };
    emit({ type: 'intake.completed', shipmentId, count: result.count, totalKg });
    return result;

    function fail(error) {
      emit({ type: 'intake.failed', shipmentId, code: error.code, crateId: error.crateId });
      throw error;
    }
  }
}
