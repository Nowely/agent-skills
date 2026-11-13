// Fictional review input; do not execute.
export async function deliver(message, send) {
    let result = await send(message);
    if (result.kind === "temporarily-unavailable") {
        result = await send(message);
    }
    return result;
}
