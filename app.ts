/*
  좋은 코드란? 
  "양이 늘어나도 복잡도가 늘어나지 않는 코드"
*/

//interface 설정
//interface는 타입을 결합하거나 조합시키는 방식에서 typeAlias와 차이가 있다.
//유니온타입 '|' 은 지원 안함

interface Store {
    currentPage: number;
    feeds: NewsFeed[]; //NewsFeed 유형의 데이터가 들어갈 배열을 의미
}

interface News {
    readonly id: number; //readonly 붙이면 코드에서 해당 값을 수정할 수 없다.
    time_ago: string;
    title: string;
    url: string;
    user: string;
    content: string;
}

/*
 * & : intersection
 * News와 뒤 내용을 합쳐서 type alias를 만든다.
 */
interface NewsFeed extends News {
    comments_count: number;
    points: number;
    read?: boolean; // ?를 붙이면 있을 수도 있고 없을 수도 있는 optional 속성이 된다.
}

interface NewsDetail extends News {
    comments: NewsComment[];
}

interface NewsComment extends News {
    comments: NewsComment[];
    level: number;
}

interface RouteInfo {
    path: string;
    page: View;
}

const container: Element | null = document.querySelector('#root');
const ajax: XMLHttpRequest = new XMLHttpRequest();

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

// 공유되는 자원을 담을 객체 store
const store: Store = {
    currentPage: 1,
    feeds: [],
};

//상속은 class를 사용하는 방법과 mixin을 사용하는 방법 두 가지가 있다.

class Api {
    url: string;
    ajax: XMLHttpRequest;
    constructor(url: string) {
        this.url = url;
        this.ajax = new XMLHttpRequest();
    }

    protected getRequest<AjaxResponse>(): AjaxResponse {
        this.ajax.open('GET', this.url, false);
        this.ajax.send();
        return JSON.parse(this.ajax.response);
    }
}

class NewsFeedApi extends Api {
    getData(): NewsFeed[] {
        return this.getRequest<NewsFeed[]>();
    }
}

class NewsDetailApi extends Api {
    getData(): NewsDetail {
        return this.getRequest<NewsDetail>();
    }
}

abstract class View {
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

//class는 대문자로 시작하는 컨벤션이 있다.
class NewsFeedView extends View {
    private api: NewsFeedApi;
    private feeds: NewsFeed[];
    constructor(containerId: string) {
        let template = `
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

class NewsDetailView extends View {
    constructor(containerId: string) {
        let template = `
            <div class="bg-gray-600 min-h-screen pb-8">
            <div class="bg-white text-xl">
              <div class="mx-auto px-4">
                <div class="flex justify-between items-center py-6">
                  <div class="flex justify-start">
                    <h1 class="font-extrabold">Hacker News</h1>
                  </div>
                  <div class="items-center justify-end">
                    <a href="#/page/{{__currentPage__}}" class="text-gray-500">
                      <i class="fa fa-times"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="h-full border rounded-xl bg-white m-6 p-4 ">
              <h2>{{__title__}}</h2>
              <div class="text-gray-400 h-20">
              {{__content__}}
              </div>

              {{__comments__}}

            </div>
          </div>
        `;

        super(containerId, template);
    }

    render() {
        const id = location.hash.substr(7);
        const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
        const newsDetail: NewsDetail = api.getData();
        for (let i = 0; i < store.feeds.length; i++) {
            if (store.feeds[i].id === Number(id)) {
                store.feeds[i].read = true;
                break;
            }
        }

        this.setTemplateData('comments', this.makeComment(newsDetail.comments));
        this.setTemplateData('currentPage', String(store.currentPage));
        this.setTemplateData('title', newsDetail.title);
        this.setTemplateData('content', newsDetail.content);
        this.updateView();
    }

    private makeComment(comments: NewsComment[]): string {
        for (let i = 0; i < comments.length; i++) {
            const comment: NewsComment = comments[i];
            this.addHtml(`
            <div style="padding-left: ${comment.level}px;" class="mt-4">
              <div class="text-gray-400">
                <i class="fa fa-sort-up mr-2"></i>
                <strong>${comment.user}</strong> ${comment.time_ago}
              </div>
              <p class="text-gray-700">${comment.content}</p>
            </div>   
            `);
            if (comment.comments.length > 0) {
                this.addHtml(this.makeComment(comment.comments));
            }
        }

        return this.getHtml();
    }
}

class Router {
    routeTable: RouteInfo[];
    defaultRoute: RouteInfo | null;
    constructor() {
        window.addEventListener('hashchange', this.route.bind(this));
        this.routeTable = [];
        this.defaultRoute = null;
    }

    setDefaultPage(page: View): void {
        this.defaultRoute = {
            path: '',
            page,
        };
    }
    addRoutePath(path: string, page: View): void {
        this.routeTable.push({
            path,
            page,
        });
    }

    route() {
        const routePath = location.hash;
        if (routePath === '' && this.defaultRoute) {
            this.defaultRoute.page.render();
        }

        for (const routeInfo of this.routeTable) {
            if (routePath.indexOf(routeInfo.path) >= 0) {
                routeInfo.page.render();
                break;
            }
        }
    }
}

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();
