export const TEMPLATES = {
  invoice_overdue: {
    subject: "Invoice {{ invoice.number }} is overdue",
    body: "Invoice {{ invoice.number }} for {{ invoice.amount | money }} was due on {{ invoice.dueDate }}.",
  },
};

export const DEFAULT_TEMPLATE = {
  subject: "Notification",
  body: "You have a new notification: {{ event }}.",
};

export function getTemplate(eventName) {
  return TEMPLATES[eventName] ?? DEFAULT_TEMPLATE;
}
