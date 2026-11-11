# Task given to the author

Email a customer once when their invoice becomes overdue: its due date has passed and it is unpaid. The nightly job `runNightly` sends it, through `mailer.send(to, subject, body)`, the way the app sends mail.

- The email names the invoice number, the amount and the due date.
- An invoice is not notified twice.
- A send that fails must not stop the others; that invoice is tried again the next night.

Dates are calendar dates in UTC.
