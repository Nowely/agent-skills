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

export function createIntake({ loadRule, emit = () => {} } = {}) {
  if (typeof loadRule !== 'function') {
    throw new TypeError('loadRule must be a function');
  }
  if (typeof emit !== 'function') {
    throw new TypeError('emit must be a function');
  }

  return { processShipment };

  async function processShipment(shipment) {
    if (!shipment || typeof shipment.id !== 'string' || shipment.id.length === 0 || !Array.isArray(shipment.crates)) {
      throw new IntakeError('INVALID_SHIPMENT', 'A shipment needs an id and a crates array');
    }

    let totalKg = 0;
    const kinds = new Set();

    for (const crate of shipment.crates) {
      await loadRule(crate.kind);
      totalKg += crate.kg;
      kinds.add(crate.kind);
    }

    return {
      shipmentId: shipment.id,
      count: shipment.crates.length,
      totalKg,
      kinds: [...kinds].sort()
    };
  }
}
