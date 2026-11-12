import { createSlotForm } from "./edit.js";

export async function openSlotEditor(client, orderId) {
  const order = await client.getOrder(orderId);
  const form = createSlotForm(order, client);
  return { form, close: () => {}, submit: () => form.submit(({ slot }) => client.setSlot(order.id, slot)) };
}
