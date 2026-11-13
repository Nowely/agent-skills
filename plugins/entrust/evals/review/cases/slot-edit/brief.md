# Task: let a customer change the delivery slot of an order

`openSlotEditor(client, orderId)` in `src/slots/screen.js` opens a form with one field, `slot`: the start of a one-hour delivery slot, an ISO time in UTC. It returns `{ form, submit, close }`, as the pickup form's screen does. `submit` stores the slot with `client.setSlot`.

A slot is refused with one message. Where several apply, the one that comes first in this list is shown:

1. "This order's slot can no longer be changed." The slot has been changed three times already.
2. "Choose a slot." No slot is chosen.
3. "This slot is too soon." The slot starts less than two hours from now; in an express zone, less than one hour.
4. "This slot is outside delivery hours." The slot does not lie wholly within the zone's delivery hours.
5. "Orders over 30 kg are delivered before noon." The order weighs more than 30 kg and the slot starts at 12:00 or later.

`openSlotEditor` resolves when the editor is ready. From then on every rule applies, whatever else is slow or failing.

The slot picker gives whole minutes. While the form is open, a chosen slot that becomes too soon as time passes shows its message within a minute, without the customer touching the form, and cannot be submitted once the message shows. The service refuses a late slot itself, so the minute in between is accepted.

Closing the form stops everything it started.

The code runs in Node, as the rest of this service does.

From the author's description of the change, which nobody has reviewed: the zone's hours are loaded with `client.getZone`, as `docs/slots.md` says, and kept for five minutes so that reopening the editor does not load them again.
