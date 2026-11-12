import { createSlotForm } from "./edit.js";

export async function openSlotEditor(client, orderId) {
  const order = await client.getOrder(orderId);
  const { form, close } = createSlotForm(order);
  return { form, close, submit: () => form.submit(({ slot }) => client.setSlot(order.id, slot)) };
}
