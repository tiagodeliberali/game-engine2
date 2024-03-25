export class Params {
    private params: URLSearchParams;

    constructor(location: Location) {
        this.params = (new URL(location.href)).searchParams;
    }

    getQueryParam(name: string) {
        return this.params.get(name);
    }
}