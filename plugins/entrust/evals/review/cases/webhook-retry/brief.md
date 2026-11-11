# Task given to the author

Deliver each webhook message with at most three attempts in total. Try again only when the endpoint's answer is "temporary"; stop at once on "ok" or "permanent". Wait between attempts with the existing backoff.

A message the endpoint has acknowledged must never be sent again, including when the queue hands the same job to a worker a second time.
