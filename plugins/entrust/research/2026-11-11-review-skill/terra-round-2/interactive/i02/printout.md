## Change
Send an email when an unpaid invoice becomes overdue in the nightly job. The task requires one notification per invoice and retry after a failed send.
- Detect unpaid invoices and dispatch notifications during the nightly job.
- Add a configurable event, channel and template framework and its unit tests.
Sources: case/brief.md; commit ae60fd1

## Verdict
The change sends on the due date, repeats successful notifications on later nights, and sends a generic message without the required invoice details. Its tests exercise the new framework rather than the nightly contract.
Target: Keep the existing nightly sequence and repo and money helpers. Add one focused overdue step that selects unpaid invoices strictly before today, formats and sends the required email, and records success after delivery; handle failures per invoice so the loop continues. Replace the general notification framework with that direct path and test it through runNightly.
Recommendation: Rewrite the notification path to the target, addressing repeated sends, the date boundary and message content first (1–3), and cover the nightly behavior (5).

## Findings
### 1. Successful sends are repeated every night (behavior; traced)
`src/invoices/overdue.js:2`: An invoice that remains unpaid appears in repo.unpaid() on every run. No success marker is read or written, so a successful send is repeated on the next night (and on replay of the same night). Breaks requirement 3.
Fix: Store a notification marker with repo.update only after mailer.send succeeds, and skip invoices already marked; leave failed invoices unmarked.

### 2. Invoices are notified on their due date (behavior; traced)
`src/invoices/overdue.js:3`: For an unpaid invoice whose dueDate equals today's UTC date, <= dispatches the email even though the due date has not passed. Breaks requirement 1.
Fix: Compare dueDate strictly less than today.

### 3. The overdue template is never selected (behavior; traced)
`src/notifications/templates.js:2`: The event is named invoice.overdue throughout the dispatch path, but the template key is invoice_overdue. getTemplate therefore returns DEFAULT_TEMPLATE, whose subject and body contain none of the invoice number, amount or due date. Breaks requirement 2.
Fix: Format the overdue email directly from the invoice, or make the lookup key match and assert the actual delivered content.

### 4. A general notification framework obscures the single mail path (design; judgment)
`src/jobs/nightly.js:14`: The only production event is wired through a bus, middleware-capable dispatcher, channel factory and cache, configurable multi-channel service, fallback template and extensible parser. Following or changing the one overdue email requires coordinating these layers and their separate tests; closePaidInvoices shows the existing direct nightly-step precedent. No task requirement needs another event, channel, template language or configuration.
Fix: Call a focused overdue step directly from runNightly; use mailer.send and formatAmount there, and remove the unused framework and configuration.

### 5. No test exercises the nightly overdue contract (tests; traced)
`test/notifications.test.js:87`: The service test checks only recipient and count, and no test runs runNightly with an overdue unpaid invoice. It passes with the generic message, a due-today send, repeated successful sends, or a failed send that prevents later invoices or is not retried. Breaks requirement 1, 2, 3, 4.
Fix: Add nightly tests for past, equal and future UTC dates and paid invoices; check recipient and all message fields; run consecutive nights after success and after one failure alongside another invoice.


## Ideas
none

## Structure
- `runNightly -> closePaidInvoices, detectOverdue, ChannelRegistry, EmailChannel, TemplateEngine, NotificationService, loadConfig, EventBus`: computes the UTC date, wires notifications, closes paid invoices and detects overdue invoices. Keep.
- `detectOverdue -> InvoiceRepo, EventBus`: selects unpaid invoices by due date, emits invoice data. Keep.
- `EventBus`: registers event handlers and middleware, dispatches events. Remove (4).
- `NotificationChannel`: defines an abstract channel. Remove (4).
- `ChannelRegistry`: registers channel factories, resolves and caches channels, lists channels. Remove (4).
- `EmailChannel -> NotificationChannel, mailer.send`: adapts a message to mailer.send. Remove (4).
- `NotificationService -> ChannelRegistry, TemplateEngine, getTemplate`: selects configured channels and template, renders and sends messages, logs failures. Remove (4).
- `TemplateEngine -> formatAmount`: looks up variables and applies filters to templates. Remove (4).
- `loadConfig`: merges notification configuration. Remove (4).
- `getTemplate`: selects a notification template or fallback. Remove (3, 4).
- `InvoiceRepo`: returns unpaid invoices, updates invoice fields. Existing.
- `closePaidInvoices -> InvoiceRepo`: closes previously paid invoices. Existing.
- `formatAmount`: formats minor currency units. Existing.
- `mailer.send`: delivers a message through the transport. Existing.
Target:
- `runNightly -> closePaidInvoices, detectOverdue`: computes UTC today and runs the two nightly steps. From the change.
- `detectOverdue -> InvoiceRepo, mailer.send, formatAmount`: selects overdue, unnotified invoices, sends each email and records successful sends, continues after an individual failure. From the change.
- `InvoiceRepo`: returns unpaid invoices and updates invoice fields. Existing.
- `closePaidInvoices -> InvoiceRepo`: closes previously paid invoices. Existing.
- `formatAmount`: formats minor currency units. Existing.
- `mailer.send`: delivers a message through the transport. Existing.

## Change map
- `src/events/bus.js:+1-29`: Registers and dispatches events with middleware. Serves 1. Remove (4).
- `src/invoices/overdue.js:+1-14`: Selects unpaid invoices at or before today and emits their details. Serves 1, 2. Fix (1, 2, 4).
- `src/jobs/nightly.js:+2-8, 11, 14-19, 21-23 -4, 6`: Wires the notification framework, preserves the closing step and invokes detection. Serves 1, 5. Fix (4).
- `src/notifications/Channel.js:+1-9`: Defines an abstract channel. Serves 1. Remove (4).
- `src/notifications/ChannelRegistry.js:+1-29`: Registers, resolves, caches and lists channels. Serves 1. Remove (4).
- `src/notifications/EmailChannel.js:+1-18`: Adapts channel messages to mailer.send. Serves 1. Remove (4).
- `src/notifications/NotificationService.js:+1-36`: Selects configured channels, renders messages, sends and catches failures. Serves 1, 2, 4. Remove (4).
- `src/notifications/TemplateEngine.js:+1-33`: Resolves template variables and applies filters. Serves 2. Remove (4).
- `src/notifications/config.js:+1-21`: Defines and merges event and channel configuration. Serves 1. Remove (4).
- `src/notifications/templates.js:+1-15`: Defines the invoice and fallback templates and looks them up by event name. Serves 2. Remove (3, 4).
- `test/notifications.test.js:+1-113`: Tests framework internals and a recipient-only service send. Serves 1. Fix (4, 5).
- No block serves requirement 3 (1, 5): An invoice is not notified twice.

## Questions and oddities
- `src/invoices/overdue.js:4`: Can nightly runs overlap, or can the process crash after the transport accepts a message but before a success marker is persisted? The current mailer exposes no idempotency key; an operational delivery and persistence contract would settle whether strict once-only delivery is achievable across those cases.

## Coverage
Read the entire diff, both versions of nightly.js, all other repository source files, package.json and both test files. Traced the data and mail paths and checked date boundaries by inspection. No project code or tests were run as instructed; executing nightly integration tests would verify delivery, retry and closing behavior. Concurrent or crash recovery guarantees cannot be established from the supplied in-memory repo and mailer contract.

Interactive report: review.html
