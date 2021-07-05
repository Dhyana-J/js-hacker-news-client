/*
  좋은 코드란? 
  "양이 늘어나도 복잡도가 늘어나지 않는 코드"
*/

const ajax = new XMLHttpRequest();
const content = document.createElement('div');

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const container = document.querySelector('#root');

let scrollY = 0; // scroll 위치 기억할 변수

// 공유되는 자원을 담을 객체 store
const store = {
    currentPage: 1,
};

function getData(url) {
    ajax.open('GET', url, false);
    ajax.send();
    return JSON.parse(ajax.response);
}

//기사 제목 목록 렌더링 코드
function newsFeed() {
    const newsList = [];
    const newsFeed = getData(NEWS_URL);
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

    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
        if (newsFeed[i]) {
            newsList.push(`
            <div class="p-6 ${
                newsFeed[i].read ? 'bg-red-500' : 'bg-white'
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
        store.currentPage > 1 ? store.currentPage - 1 : 1,
    );
    template = template.replace(
        '{{__next_page__}}',
        newsFeed[store.currentPage * 10] ? store.currentPage + 1 : store.currentPage,
    );

    container.innerHTML = template;

    if (scrollY > 0) window.scrollTo(0, scrollY);
}

//기사 내용 렌더링 코드
function newsDetail() {
    const id = location.hash.substr(7);
    const newsContent = getData(CONTENT_URL.replace('@id', id));
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

    function makeComment(comments, called = 0) {
        const commentString = [];

        for (let i = 0; i < comments.length; i++) {
            commentString.push(`
            <div style="padding-left: ${called * 40}px;" class="mt-4">
              <div class="text-gray-400">
                <i class="fa fa-sort-up mr-2"></i>
                <strong>${comments[i].user}</strong> ${comments[i].time_ago}
              </div>
              <p class="text-gray-700">${comments[i].content}</p>
            </div>   
            `);
            if (comments[i].comments.length > 0) {
                commentString.push(makeComment(comments[i].comments, called + 1));
            }
        }

        return commentString.join('');
    }

    container.innerHTML = template.replace('{{__comments__}}', makeComment(newsContent.comments));
    scrollY = window.scrollY;
}

function router() {
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
