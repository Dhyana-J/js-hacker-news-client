import { NewsFeed, NewsStore } from './types';
export default class Store implements NewsStore {
    private feeds: NewsFeed[];
    private _currentPage: number; //getter와 이름이 겹치면 안되므로, 내부속성들은 언더바를 주로 붙여준다.
    constructor() {
        this.feeds = [];
        this._currentPage = 1;
    }

    get currentPage() {
        return this._currentPage;
    }

    set currentPage(page: number) {
        this._currentPage = page;
    }

    get nextPage(): number {
        return this._currentPage + 1;
    }

    get prevPage(): number {
        return this._currentPage > 1 ? this._currentPage - 1 : 1;
    }

    get numberOfFeed(): number {
        return this.feeds.length;
    }

    get hasFeeds(): boolean {
        return this.feeds.length > 0;
    }

    getAllFeeds(): NewsFeed[] {
        return this.feeds;
    }

    getFeed(position: number): NewsFeed {
        return this.feeds[position];
    }

    setFeeds(feeds: NewsFeed[]): void {
        this.feeds = feeds.map((feed) => ({
            ...feed,
            read: false,
        }));
    }

    makeRead(id: number): void {
        const feed = this.feeds.find((feed: NewsFeed) => feed.id === id);
        if (feed) {
            feed.read = true;
        }
    }
}
