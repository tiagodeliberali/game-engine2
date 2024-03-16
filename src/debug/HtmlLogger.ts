export class HtmlLogger {
    private logElement: HTMLSpanElement;
    private keyValuePairs: Map<string, string>;

    constructor(elementId: string) {
        this.logElement = document.getElementById(elementId) as HTMLSpanElement;
        this.keyValuePairs = new Map<string, string>();
    }

    set(key: string, value: string) {
        this.keyValuePairs.set(key, value);
        this.updateLogElement();
    }

    private updateLogElement() {
        let debugInfo = 'Debug info\n\n';
        this.keyValuePairs.forEach((value, key) => {
            debugInfo += `${key}: ${value}\n`;
        });
        this.logElement.innerHTML = `<pre style="background-color: #f2f2f2; color: #000; padding: 10px; border-radius: 5px; font-family: monospace;">${debugInfo}</pre>`;
    }
}
