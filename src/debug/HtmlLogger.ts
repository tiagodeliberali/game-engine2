export class HtmlLogger {
    private logElement: HTMLSpanElement;
    private keyValuePairs: Map<string, string>;
    private sessionData: string | undefined = undefined;
    private writeSectionToConsole: boolean;

    constructor(elementId: string, writeSectionToConsole: boolean = false) {
        this.logElement = document.getElementById(elementId) as HTMLSpanElement;
        this.keyValuePairs = new Map<string, string>();
        this.writeSectionToConsole = writeSectionToConsole;
    }

    set(key: string, value: string) {
        if (this.sessionData != undefined) {
            this.sessionData += `${key}: ${value}\n`;
        }
        else {
            this.keyValuePairs.set(key, value);
            this.updateLogElement();
        }
    }

    startSessions() {
        this.sessionData = "started:\n"
    }

    endSessions() {
        this.sessionData += "\nended"
        if (this.writeSectionToConsole) {
            console.log(this.sessionData);
        } else {
            this.keyValuePairs.set("section", this.sessionData ?? "");
            this.updateLogElement();
        }
        this.sessionData = undefined;
    }

    private updateLogElement() {
        let debugInfo = 'Debug info\n\n';
        this.keyValuePairs.forEach((value, key) => {
            debugInfo += `${key}: ${value}\n`;
        });
        this.logElement.innerHTML = `<pre style="background-color: #f2f2f2; color: #000; padding: 10px; border-radius: 5px; font-family: monospace;">${debugInfo}</pre>`;
    }
}
