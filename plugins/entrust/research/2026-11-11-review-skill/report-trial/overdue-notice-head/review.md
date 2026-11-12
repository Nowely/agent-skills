## Verdict
The change builds a notification framework (event bus, channel registry, template engine, config, service) but does not meet the task: the email is sent with the generic fallback template instead of naming invoice, amount and date, an invoice due today is treated as overdue, and nothing stops the same invoice being emailed every night. No test exercises detectOverdue or runNightly.
Target: detectOverdue(repo, mailer, today) in src/invoices/overdue.js: for each unpaid invoice with dueDate < today and no overdueNotifiedAt, build subject/body inline with formatAmount, try mailer.send, on success repo.update(id, {overdueNotifiedAt: today}), on failure log and continue. runNightly calls it after closePaidInvoices. Tests cover it through runNightly with a fake mailer. Only the detectOverdue skeleton of the change survives; the bus, registry, channel classes, template engine, config and service go.

## Findings
### 1. Email uses the fallback template, not the invoice one (behavior; traced)
`src/notifications/templates.js:2`: The template is keyed invoice_overdue but NotificationService.notify (NotificationService.js:21) looks it up with eventName "invoice.overdue". getTemplate misses and returns DEFAULT_TEMPLATE, so every customer gets subject "Notification" and body "You have a new notification: invoice.overdue." with no number, amount or due date. Requirement 1 fails. The tests only assert the recipient, so they do not notice.
Fix: Drop the lookup indirection (see finding 4) and build the text in detectOverdue; at minimum key the template "invoice.overdue" and assert the subject and body in a test.

### 2. No record of notification: resent every night; failures invisible to the caller (behavior; traced)
`src/invoices/overdue.js:2`: detectOverdue emits for every unpaid invoice past due on every run and writes nothing back, so night 2 emails the same invoice again (requirement 2 fails). NotificationService.notify also catches send errors and only logs them (NotificationService.js:31), so the caller cannot tell success from failure and could not mark only the successes. Failures do not stop the others, which is right, but 'tried again next night' only works today by accident of resending everything.
Fix: After a successful mailer.send, repo.update(invoice.id, {overdueNotifiedAt: today}); skip invoices that have it; wrap each send in try/catch so a failure is logged and the loop continues without marking.

### 3. Invoice due today counted as overdue (behavior; traced)
`src/invoices/overdue.js:3`: dueDate <= today emails on the due date itself, when the due date has not yet passed. With dueDate 2026-03-12 and now 2026-03-12T01:00Z the customer is told the invoice is overdue a day early.
Fix: Use invoice.dueDate < today (YYYY-MM-DD strings compare correctly).

### 4. Framework for one email (design; judgment)
`src/events/bus.js:1`: EventBus with middleware nobody uses, ChannelRegistry with caching/has/list, abstract NotificationChannel, EmailChannel forwarding to mailer.send, TemplateEngine with filters and registerFilter, deepMerge config, a service and a template fallback: all for one fixed event with one handler and one channel. The layers are what hid findings 1 and 2 (a key mismatch across three files, and swallowed errors). The project's own style (closePaid.js) is a plain function over repo. Judgment: it makes the job harder to read, test and keep correct.
Fix: Delete the notifications and events modules and write detectOverdue as in the target; use formatAmount directly. nightly.js then only passes mailer.

### 5. Tests cover the scaffolding, not the requirements (tests; traced)
`test/notifications.test.js:8`: Tests exercise registry caching, filters, middleware order and a service with a fake registry. None runs detectOverdue or runNightly, so the wrong template (1), repeat sends (2), the due-today boundary (3) and failed-send continuation all pass. The service test asserts only the recipient, not subject or body.
Fix: Replace with runNightly tests using a fake mailer: one overdue invoice sends once with number, amount and date in the text; a second run sends nothing; due today and paid invoices send nothing; a mailer that rejects for the first invoice still sends the second, and the first is retried next night.


## Change map
- `src/invoices/overdue.js:+3`: Overdue comparison dueDate <= today Serves 4. Fix (3).
- `src/invoices/overdue.js:+1-2, 4-14`: Loops unpaid invoices and emits an event with the payload; records nothing Serves 4. Fix (2).
- `src/jobs/nightly.js:+2-8, 11, 13-23 -4, 6`: Wires registry, engine, service, bus and runs detectOverdue after closing Serves 4, 5. Fix (4).
- `src/events/bus.js:+1-29`: Event bus with middleware Serves nothing. Remove (4).
- `src/notifications/Channel.js:+1-9`: Abstract channel base class Serves nothing. Remove (4).
- `src/notifications/ChannelRegistry.js:+1-29`: Factory registry with instance cache Serves nothing. Remove (4).
- `src/notifications/EmailChannel.js:+1-18`: Forwards message to mailer.send Serves 5. Remove (4).
- `src/notifications/NotificationService.js:+1-36`: Looks up config and template, renders, sends, swallows errors Serves 1, 3. Remove (1, 2, 4).
- `src/notifications/TemplateEngine.js:+1-33`: Placeholder rendering with filters Serves 1. Remove (4).
- `src/notifications/config.js:+1-21`: Default config and deep merge of overrides Serves nothing. Remove (4).
- `src/notifications/templates.js:+1-15`: Overdue template and default fallback; key does not match the event Serves 1. Remove (1, 4).
- `test/notifications.test.js:+1-113`: Tests registry, engine, bus, service Serves nothing. Remove (5).
- No block serves requirement 2: An invoice is not notified twice.
- `detectOverdue`: select overdue invoices, emit events. Split.
- `NotificationService.notify`: gate by config, pick template, render, send per channel, swallow errors. Remove.

## Questions and oddities
- `src/jobs/nightly.js:11`: New config parameter: who passes it and is the enable/disable switch required? The task does not ask for it; confirm with the author.
- `src/invoices/repo.js`: Where is a notified marker persisted in production? InvoiceRepo here is in-memory; settle by checking how the real repo stores fields.

## Coverage
Read all changed files, base nightly.js, repo.js, money.js, closePaid.js, mailer.js and both test files. Nothing was run (static review); a run of the overdue path would confirm the fallback subject and the repeat send.
