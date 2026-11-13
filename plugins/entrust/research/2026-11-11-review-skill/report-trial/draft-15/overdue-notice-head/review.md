## Change
Email a customer once when an invoice becomes overdue, from the nightly job, through mailer.send. The task asks for one notification per overdue invoice, naming number, amount and due date, with failed sends retried the next night.
- invoices/overdue.js: detectOverdue emits an invoice.overdue event for each unpaid invoice with dueDate <= today
- events/bus.js: EventBus with handlers and middleware
- notifications/*: NotificationService, ChannelRegistry, NotificationChannel, EmailChannel, TemplateEngine, templates, config with deep merge
- jobs/nightly.js: builds all of the above on every run and calls detectOverdue after closePaidInvoices
- test/notifications.test.js: tests of the registry, template engine, bus and service
Sources: /tmp/review-run-xZuYE3/brief.md; the diff

## Verdict
The change does not meet its task. The email sent is the generic fallback template, with no invoice number, amount or due date, because the template key does not match the event name. Nothing records that an invoice was notified, so every unpaid overdue invoice is emailed every night. About 250 lines of event bus, registry, channel, template engine and config are built for a single email, and none of the tests would catch these defects.
Target: One function in invoices/overdue.js, notifyOverdue(repo, mailer, today), called from runNightly after closePaidInvoices. For each unpaid invoice with dueDate < today and no overdueNotifiedAt, it calls mailer.send(customerEmail, subject, body) with the body built from formatAmount, and on success sets overdueNotifiedAt via repo.update. A failed send is caught per invoice, so the others go on and the invoice stays unmarked for tomorrow. Reuses mailer, InvoiceRepo.update and formatAmount. Only the idea of detectOverdue's loop survives; the bus, notifications/* and their tests go.

## Findings
### 1. The overdue email is the generic fallback and names no invoice (behavior; traced)
`src/notifications/templates.js:2`: TEMPLATES is keyed invoice_overdue, but NotificationService.notify looks it up with getTemplate("invoice.overdue") (NotificationService.js:21, nightly.js:19). The lookup misses and falls back to DEFAULT_TEMPLATE, so the customer gets subject "Notification" and body "You have a new notification: invoice.overdue." The number, amount and due date never appear. The silent fallback hides the miss, and no test renders the real template. Breaks requirement 2.
Fix: Build the subject and body directly in the overdue function from invoice.number, formatAmount(amountMinor, currency) and dueDate, and drop the template layer and its fallback.

### 2. Nothing records that an invoice was notified, so it is emailed every night (behavior; traced)
`src/invoices/overdue.js:2`: detectOverdue takes every repo.unpaid() invoice past due and emits for it; no flag or timestamp is written. An invoice that stays unpaid is emailed on each run. The same gap means that retry-next-night works only by accident: a failed and a successful send look the same afterwards. NotificationService also logs the failure and returns, so the job never learns which sends failed. Breaks requirement 3, 4.
Fix: Set overdueNotifiedAt through repo.update after a successful mailer.send, and skip invoices that have it. Leave it unset when send rejects, and catch the rejection per invoice.

### 3. An invoice due today is treated as overdue (behavior; traced)
`src/invoices/overdue.js:3`: dueDate <= today is true on the due date itself. The task says the due date has passed, and closePaidInvoices uses strict comparison for a similar night-after rule. A customer is told an invoice is overdue on the day it is due, and for dueDate equal to today the email is early by a night. Breaks requirement 1.
Fix: Compare invoice.dueDate < today (YYYY-MM-DD strings compare correctly).

### 4. A bus, registry, channel hierarchy, template engine and deep-merged config for one email (design; judgment)
`src/notifications/ChannelRegistry.js:1`: Every layer has a single implementation and a single use: EventBus has one handler and unused middleware; ChannelRegistry has one factory, plus an instance cache, has() and list() that nothing calls; NotificationChannel is an abstract base with one subclass and an unused name getter; TemplateEngine has upper, lower and registerFilter that nothing uses; loadConfig deep-merges a config that only toggles one event; runNightly gains a config option the task does not ask for. All of it is rebuilt on every nightly run. The project's own precedent is closePaidInvoices: a plain function taking repo and today. Each layer also adds a place where the real requirements went wrong (finding 1) and where errors disappear into a log.
Fix: Delete notifications/*, events/bus.js and the config option. Send directly with mailer.send in overdue.js, as in the target.

### 5. No test covers the task, and the tests that exist pass with the defects (tests; traced)
`test/notifications.test.js:87`: No test runs runNightly with an overdue invoice. The service test uses a fake registry and checks only that send was called once and to is right, so it passes with the fallback template (finding 1). Nothing runs the job twice (finding 2), tests a due-today invoice (finding 3), or makes send reject and checks the other invoices still go and the failed one is retried. The registry, engine and bus tests pin scaffolding that should not exist.
Fix: Replace the file with nightly tests using InvoiceRepo and a fake mailer: the subject/body contain number, amount and due date; a second run sends nothing; due today sends nothing; a rejected send leaves the others sent and is sent again on the next run.


## Structure
- `runNightly -> closePaidInvoices, detectOverdue, EventBus, NotificationService, ChannelRegistry, EmailChannel, TemplateEngine, loadConfig`: runs the nightly steps, builds the notification stack on each run. Split (4).
- `detectOverdue -> InvoiceRepo, EventBus`: finds overdue invoices, emits an event for each. Split (2, 3).
- `EventBus`: routes events to handlers through middleware. Remove (4).
- `NotificationService -> ChannelRegistry, TemplateEngine, getTemplate`: checks config, picks the template, renders, sends per channel, logs failures. Remove (1, 4).
- `ChannelRegistry`: maps a type to a cached channel. Remove (4).
- `NotificationChannel`: abstract channel interface. Remove (4).
- `EmailChannel -> NotificationChannel, createMailer`: forwards to mailer.send. Remove (4).
- `TemplateEngine -> formatAmount`: substitutes placeholders and filters. Remove (4).
- `getTemplate`: looks up a template by event name, with a fallback. Remove (1, 4).
- `loadConfig`: deep-merges config over defaults. Remove (4).
- `closePaidInvoices`: closes invoices paid before today. Existing.
- `InvoiceRepo`: keeps the invoices. Existing.
- `createMailer`: sends mail through the transport. Existing.
- `formatAmount`: formats minor units with currency. Existing.
Target:
- `runNightly -> closePaidInvoices, detectOverdue`: runs the nightly steps in order. From the change.
- `detectOverdue -> InvoiceRepo, createMailer, formatAmount`: selects unpaid, past-due, unnotified invoices, sends the email, marks the invoice on success. From the change.
- `closePaidInvoices`: closes invoices paid before today. Existing.
- `InvoiceRepo`: keeps the invoices. Existing.
- `createMailer`: sends mail through the transport. Existing.
- `formatAmount`: formats minor units with currency. Existing.

## Change map
- `src/events/bus.js:+1-29`: event bus with handlers and middleware Serves nothing. Remove (4).
- `src/invoices/overdue.js:+1-14`: loops over unpaid invoices, tests dueDate <= today, emits an event with the invoice data Serves 1. Fix (2, 3, 4).
- `src/jobs/nightly.js:+2-8`: imports for the notification stack Serves nothing. Remove (4).
- `src/jobs/nightly.js:+11 -4`: adds an unneeded config option to the signature Serves nothing. Fix (4).
- `src/jobs/nightly.js:+14-19`: builds registry, engine, service, bus and subscription on every run Serves nothing. Remove (4).
- `src/jobs/nightly.js:+21-23 -6`: closes paid invoices, then calls detectOverdue Serves 1. Fix (2).
- `src/notifications/Channel.js:+1-9`: abstract channel base class Serves nothing. Remove (4).
- `src/notifications/ChannelRegistry.js:+1-29`: factory registry with instance cache, has and list Serves nothing. Remove (4).
- `src/notifications/EmailChannel.js:+1-18`: wraps mailer.send Serves nothing. Remove (4).
- `src/notifications/NotificationService.js:+1-36`: config check, template lookup, render, per-channel send with caught errors Serves 4. Remove (1, 2, 4).
- `src/notifications/TemplateEngine.js:+1-33`: placeholder and filter rendering Serves nothing. Remove (4).
- `src/notifications/config.js:+1-21`: default config and deep merge Serves nothing. Remove (4).
- `src/notifications/templates.js:+1-15`: templates keyed by the wrong name, with fallback Serves 2. Remove (1, 4).
- `test/notifications.test.js:+1-113`: tests of registry, engine, bus and service; none of the task Serves nothing. Remove (5).
- No block serves requirement 3: An invoice is not notified twice

## Questions and oddities
- `src/invoices/overdue.js:5`: Does every unpaid invoice have customerEmail, amountMinor and currency? InvoiceRepo does not say; an invoice without customerEmail would reach mailer.send with to undefined. Settle by the invoice data source.

## Coverage
Read all changed files, the base nightly.js, closePaid.js, repo.js, money.js, mailer.js and the existing test and package.json. Nothing was run, by direction; a run of the job twice would confirm findings 1 and 2. Unknown: where invoices come from beyond InvoiceRepo.
