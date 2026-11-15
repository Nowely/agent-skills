# Task given to the author

Some invoices show their currency in lower case, for example `usd 10.00`. Show the currency code in upper case everywhere a price is shown: the invoice list, the invoice page and the CSV export.

Invoices come from the billing service through `@acme/billing-client`, and older ones from the local archive, which the desktop app wrote before the service existed.
