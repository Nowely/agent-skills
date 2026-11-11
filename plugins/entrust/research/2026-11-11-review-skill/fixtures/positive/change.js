// Fictional review input; do not execute.
export function validateExport({title, labels}) {
    const errors = {};
    const normalizedTitle = title.trim();
    const normalizedLabels = labels.map((label) => label.trim()).filter(Boolean);
    if (normalizedTitle.length === 0) errors.title = "Title is required";
    if (normalizedLabels.length > 8) errors.labels = "Too many labels";
    return errors;
}

export function submitExport(raw, save) {
    const value = {
        title: raw.title.trim(),
        labels: raw.labels.split(",").map((label) => label.trim()).filter(Boolean),
    };
    const errors = validateExport(value);
    if (Object.keys(errors).length) return {errors};
    return save(value);
}
