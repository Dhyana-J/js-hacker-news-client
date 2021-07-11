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

const container: Element | null = document.querySelector('#root');
const ajax: XMLHttpRequest = new XMLHttpRequest();

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

let scrollPosition: number = 0; // scroll 위치 기억할 변수

// 공유되는 자원을 담을 객체 store
const store: Store = {
    currentPage: 1,
    feeds: [],
};

//generic
function getData<AjaxResponse>(url: string): AjaxResponse {
    ajax.open('GET', url, false);
    ajax.send();

    return JSON.parse(ajax.response);
}

// 해당 글 읽음 여부 상태를 추가해주는 함수
function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
    for (let i = 0; i < feeds.length; i++) {
        feeds[i].read = false;
    }

    return feeds;
}

//return값 없으면 void
function updateView(html: string): void {
    if (container) {
        container.innerHTML = html;
    } else {
        console.error('최상위 컨테이너가 없어 UI 진행이 안돼요');
    }
}
//기사 제목 목록 렌더링 코드
function newsFeed(): void {
    let newsFeed: NewsFeed[] = store.feeds;
    const newsList = [];
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

    if (newsFeed.length === 0) newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL)); //JS에서는 = 를 연속으로 사용할 수 있다. 맨 오른쪽 데이터가 연쇄적으로 왼쪽 변수에 담긴다.

    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
        if (newsFeed[i]) {
            newsList.push(`
            <div class="p-6 ${
                newsFeed[i].read ? 'bg-blue-500' : 'bg-white'
            } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
              <div class="flex-auto">
                <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
              </div>
              <div class="text-center text-sm">
                <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
                    newsFeed[i].comments_count
                }</div>
              </div>
            </div>
            <div class="flex mt-3">
              <div class="grid grid-cols-3 text-sm text-gray-500">
                <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
                <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
                <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
              </div>  
            </div>
          </div>    
        `);
        }
    }

    //여전히 코드의 중복이 많이 발생한다.
    // 이를 보완하기 위해 템플릿 라이브러리들이 많이 나와있음
    template = template.replace('{{__news_feed__}}', newsList.join(''));
    template = template.replace(
        '{{__prev_page__}}',
        String(store.currentPage > 1 ? store.currentPage - 1 : 1),
    );
    template = template.replace(
        '{{__next_page__}}',
        String(newsFeed[store.currentPage * 10] ? store.currentPage + 1 : store.currentPage),
    );

    updateView(template);

    if (scrollPosition > 0) window.scrollTo(0, scrollPosition); //기존 스크롤 위치로 이동한다.
}

//기사 내용 렌더링 코드
function newsDetail(): void {
    const id = location.hash.substr(7);
    const newsContent = getData<NewsDetail>(CONTENT_URL.replace('@id', id));
    const title = document.createElement('h1');

    let template = `
      <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>
    `;

    for (let i = 0; i < store.feeds.length; i++) {
        if (store.feeds[i].id === Number(id)) {
            store.feeds[i].read = true;
            break;
        }
    }

    updateView(template);

    scrollPosition = window.scrollY; //기존 스크롤 위치를 저장해둔다.
}

function makeComment(comments: NewsComment[]): string {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
        const comment: NewsComment = comments[i];
        commentString.push(`
          <div style="padding-left: ${comment.level}px;" class="mt-4">
            <div class="text-gray-400">
              <i class="fa fa-sort-up mr-2"></i>
              <strong>${comment.user}</strong> ${comment.time_ago}
            </div>
            <p class="text-gray-700">${comment.content}</p>
          </div>   
          `);
        if (comment.comments.length > 0) {
            commentString.push(makeComment(comment.comments));
        }
    }

    return commentString.join('');
}

function router(): void {
    const routePath = location.hash;
    if (routePath === '') {
        //location.hash에 '#'만 들어있을 경우 빈 값을 반환한다.
        newsFeed();
    } else if (routePath.indexOf('#/page/') >= 0) {
        // store.currentPage = routePath.substr(7);
        store.currentPage = Number(routePath.substr(7)); // 문자열을 숫자로 변환해주어야한다. 문자열에 숫자가 있는 경우, 뺄셈은 숫자연산이 이루어지지만, 덧셈은 문자열 연산이 이루어진다.

        newsFeed();
    } else {
        newsDetail();
    }
}

window.addEventListener('hashchange', router);

router();