export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function capitalize(value: string): string {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`
): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}
