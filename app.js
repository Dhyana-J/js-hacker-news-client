const ajax = new XMLHttpRequest();
const content = document.createElement('div');

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const container = document.querySelector('#root');

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

    newsFeed.map((v) => {
        newsList.push(`
    <li>
      <a href="#${v.id}">
        ${v.title} (${v.comments_count})
      </a>
    </li>
  `);
    });

    newsList.push('</ul>');

    container.innerHTML = newsList.join('');
}

//기사 내용 렌더링 코드
function newsDetail() {
    const id = location.hash.substr(1);
    const newsContent = getData(CONTENT_URL.replace('@id', id));
    const title = document.createElement('h1');

    container.innerHTML = `
  <h1>${newsContent.title}</h1>
  <div>
    <a href="#">목록으로</a>
  </div>
`;
}

function router() {
    const routePath = location.hash;
    if (routePath === '') {
        //location.hash에 '#'만 들어있을 경우 빈 값을 반환한다.
        newsFeed();
    } else {
        newsDetail();
    }
}

window.addEventListener('hashchange', router);

router();
