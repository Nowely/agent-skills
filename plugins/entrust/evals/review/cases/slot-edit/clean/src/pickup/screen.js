import { createPickupForm } from "./form.js";

export async function openPickupForm(client, orderId) {
  const order = await client.getOrder(orderId);
  const { form, close } = createPickupForm(order);
  return { form, close, submit: () => form.submit(({ time }) => client.setPickup(order.id, time)) };
}
