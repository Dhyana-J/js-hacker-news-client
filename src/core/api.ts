import { NewsFeed, NewsDetail } from '../types';
export class Api {
    xhr: XMLHttpRequest;
    url: string;
    constructor(url: string) {
        this.xhr = new XMLHttpRequest();
        this.url = url;
    }

    //cb : call back function
    protected getRequestWithXHR<AjaxResponse>(cb: (data: AjaxResponse) => void): void {
        this.xhr.open('GET', this.url); //세 번째 parameter는 비동기로 작동시킬 것인지 여부를 설정한다. true(default)/false 로 설정
        this.xhr.addEventListener('load', () => {
            cb(JSON.parse(this.xhr.response) as AjaxResponse);
        });
        this.xhr.send();
    }

    protected getRequestWithPromise<AjaxResponse>(cb: (data: AjaxResponse) => void): void {
        // fetch API : XHR의 단점을 보완하기 위해 나온 Api
        fetch(this.url)
            .then((response) => response.json())
            .then(cb)
            .catch(() => {
                console.error('데이터 불러오기 실패');
            });
    }
}

export class NewsFeedApi extends Api {
    constructor(url: string) {
        super(url);
    }
    getDataWithXHR(cb: (data: NewsFeed[]) => void): void {
        return this.getRequestWithXHR<NewsFeed[]>(cb);
    }
    getDataWithPromise(cb: (data: NewsFeed[]) => void): void {
        return this.getRequestWithPromise<NewsFeed[]>(cb);
    }
}

export class NewsDetailApi extends Api {
    constructor(url: string) {
        super(url);
    }
    getDataWithXHR(cb: (data: NewsDetail) => void): void {
        return this.getRequestWithXHR<NewsDetail>(cb);
    }
    getDataWithPromise(cb: (data: NewsDetail) => void): void {
        return this.getRequestWithPromise<NewsDetail>(cb);
    }
}
