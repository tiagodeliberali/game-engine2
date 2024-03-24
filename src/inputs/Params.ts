const params = (new URL(document.location)).searchParams;

export const getQueryParam = (name: string) => params.get(name);