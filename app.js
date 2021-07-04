const ajax = new XMLHttpRequest();
const content = document.createElement('div');

const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const container = document.querySelector('#root');

const getData = (url)=>{
  ajax.open('GET',url,false);
  ajax.send();
  return JSON.parse(ajax.response);
}

const newsFeed = getData(NEWS_URL);
const ul = document.createElement('ul');

window.addEventListener('hashchange',function(){
  const id = this.location.hash.substr(1);
  const newsContent = getData(CONTENT_URL.replace('@id',id));
  const title = document.createElement('h1');

  title.innerHTML = newsContent.title;
  content.appendChild(title);
});

newsFeed.reduce((ul,cur)=>{

  const div = document.createElement('div');
  const li = document.createElement('li');
  const a = document.createElement('a');

  div.innerHTML = `
  <li>
    <a href="#${cur.id}">
      ${cur.title} (${cur.comments_count})
    </a>
  </li>
  `;

  return ul.appendChild(div.firstElementChild);
},ul);

container.appendChild(ul);
container.appendChild(content);