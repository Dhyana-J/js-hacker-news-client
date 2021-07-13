export default abstract class View {
    private template: string;
    private renderTemplate: string;
    private container: HTMLElement;
    private htmlList: string[];
    constructor(containerId: string, template: string) {
        const containerElement = document.getElementById('root');

        if (!containerElement) throw '최상위 컨테이너가 없어 UI 진행이 안돼요';

        this.container = containerElement;
        this.template = template;
        this.renderTemplate = template;
        this.htmlList = [];
    }
    protected updateView(): void {
        this.container.innerHTML = this.renderTemplate;
        this.renderTemplate = this.template;
    }

    protected addHtml(htmlString: string): void {
        this.htmlList.push(htmlString);
    }

    protected getHtml(): string {
        const snapshot = this.htmlList.join('');
        this.clearHtmlList();
        return snapshot;
    }

    protected setTemplateData(key: string, value: string): void {
        this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value);
    }

    private clearHtmlList(): void {
        this.htmlList = [];
    }

    abstract render(): void; //상속받는 클래스에서 반드시 구현하도록 강제하는 추상메소드
}
