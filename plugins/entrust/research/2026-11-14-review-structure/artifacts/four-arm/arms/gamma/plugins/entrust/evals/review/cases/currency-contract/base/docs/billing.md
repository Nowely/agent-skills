# Billing data

This page was written for billing-client 1.x.

Invoices come from the billing service. Each invoice has an `id`, a `currency`, and an `amountMinor` value.

- `currency` may be `null` for a draft invoice.
- `currency` arrives in whatever case the merchant typed, for example `usd`, `USD` or `Usd`.
- `amountMinor` is in minor units, for example cents.

Sum amounts per currency only after checking the currency code for the invoice.
