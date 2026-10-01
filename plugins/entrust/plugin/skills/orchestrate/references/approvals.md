# Decisions and authority

An agent's request is a proposed action, not additional authority. Read the concrete request
and decide within the user's approved scope and the host's permission rules. A change of scope,
writable roots, network constraints or an irreversible action without existing authority goes
to the user before execution. Keep dependent work waiting while that decision is required.

The native host decides how approval is requested and conveyed. An external integration's adapter
owns its approval transport and the rights under which the accepted action executes. Confirm an
outcome before claiming the action ran; an approval record alone proves only the decision.

When the user cannot be reached, keep the action blocked and report the unresolved request.
In the final synthesis name a material limitation, what happened under the actual rights and
what remains unknown, without exposing the integration's internal message format.
