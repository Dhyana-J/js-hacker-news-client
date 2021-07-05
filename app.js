/*
  좋은 코드란? 
  "양이 늘어나도 복잡도가 늘어나지 않는 코드"
*/

const ajax = new XMLHttpRequest();
const content = document.createElement('div');

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const container = document.querySelector('#root');

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
    const ul = document.createElement('ul');

    newsList.push('<ul>');

    for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
        if (newsFeed[i]) {
            newsList.push(`
          <li>
            <a href="#/show/${newsFeed[i].id}">
              ${newsFeed[i].title} (${newsFeed[i].comments_count})
            </a>
          </li>
        `);
        }
    }

    newsList.push('</ul>');

    newsList.push(`
      <div>
        <a href="#/page/${store.currentPage > 1 ? store.currentPage - 1 : 1}">이전 페이지</a>
        <a href="#/page/${
            newsFeed[store.currentPage * 10] ? store.currentPage + 1 : store.currentPage
        }">다음 페이지</a>
      </div>
    `);

    console.log(store.currentPage);

    container.innerHTML = newsList.join('');
}

//기사 내용 렌더링 코드
function newsDetail() {
    const id = location.hash.substr(7);
    const newsContent = getData(CONTENT_URL.replace('@id', id));
    const title = document.createElement('h1');

    container.innerHTML = `
    <h1>${newsContent.title}</h1>
      <div>
        <a href="#/page/${store.currentPage}">목록으로</a>
      </div>
    `;
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
