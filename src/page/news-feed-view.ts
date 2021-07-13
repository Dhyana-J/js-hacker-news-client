import View from '../core/view';
import { NewsFeedApi } from '../core/api';
import { NewsFeed } from '../types';
import { NEWS_URL } from '../config';

const template = `
<div class="bg-gray-600 min-h-screen">
  <div class="bg-white text-xl">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center py-6">
        <div class="flex justify-start">
          <h1 class="font-extrabold">Hacker News</h1>
        </div>
        <div class="items-center justify-end">
          <a href="#/page/{{__prev_page__}}" class="text-gray-500">
            Previous
          </a>
          <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
            Next
          </a>
        </div>
      </div> 
    </div>
  </div>
  <div class="p-4 text-2xl text-gray-700">
    {{__news_feed__}}        
  </div>
</div>
`;

export default class NewsFeedView extends View {
    private api: NewsFeedApi;
    private feeds: NewsFeed[];
    constructor(containerId: string) {
        super(containerId, template);
        this.api = new NewsFeedApi(NEWS_URL);
        this.feeds = store.feeds;

        if (this.feeds.length === 0) this.feeds = store.feeds = this.api.getData(); //JS에서는 = 를 연속으로 사용할 수 있다. 맨 오른쪽 데이터가 연쇄적으로 왼쪽 변수에 담긴다.
        this.makeFeeds();
    }

    render(): void {
        store.currentPage = Number(location.hash.substring(7) || 1);
        for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
            if (this.feeds[i]) {
                const { read, id, title, comments_count, user, points, time_ago } = this.feeds[i];
                this.addHtml(`
                <div class="p-6 ${
                    read ? 'bg-blue-500' : 'bg-white'
                } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
                <div class="flex">
                  <div class="flex-auto">
                    <a href="#/show/${id}">${title}</a>  
                  </div>
                  <div class="text-center text-sm">
                    <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
                  </div>
                </div>
                <div class="flex mt-3">
                  <div class="grid grid-cols-3 text-sm text-gray-500">
                    <div><i class="fas fa-user mr-1"></i>${user}</div>
                    <div><i class="fas fa-heart mr-1"></i>${points}</div>
                    <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
                  </div>  
                </div>
              </div>    
            `);
            }
        }

        //여전히 코드의 중복이 많이 발생한다.
        // 이를 보완하기 위해 템플릿 라이브러리들이 많이 나와있음
        this.setTemplateData('news_feed', this.getHtml());
        this.setTemplateData(
            'prev_page',
            String(store.currentPage > 1 ? store.currentPage - 1 : 1),
        );
        this.setTemplateData(
            'next_page',
            String(this.feeds[store.currentPage * 10] ? store.currentPage + 1 : store.currentPage),
        );

        this.updateView();
    }

    // 해당 글 읽음 여부 상태를 추가해주는 함수
    makeFeeds(): void {
        for (let i = 0; i < this.feeds.length; i++) {
            this.feeds[i].read = false;
        }
    }
}
