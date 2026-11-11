import fs from "node:fs";
import { validate } from "./validate.js";

const schema = JSON.parse(fs.readFileSync(new URL("../../contracts/order.schema.json", import.meta.url), "utf8"));

export class ContractError extends Error {}

export async function fetchOrders(transport) {
  const orders = await transport.get("/orders");
  orders.forEach((order, index) => {
    const problems = validate(schema, order);
    if (problems.length) throw new ContractError(`order ${index}: ${problems.join("; ")}`);
  });
  return orders;
}
