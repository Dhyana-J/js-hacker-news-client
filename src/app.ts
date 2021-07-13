import Router from './core/router';
import { Store } from './types';
import { NewsDetailView, NewsFeedView } from './page';
const store: Store = {
    currentPage: 1,
    feeds: [],
};

//전역 객체 세팅
//window는 자바스크립트 어디에서도 접근 가능한 전역 객체
declare global {
    interface Window {
        store: Store;
    }
}

window.store = store;

const router: Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

router.setDefaultPage(newsFeedView);
router.addRoutePath('/page/', newsFeedView);
router.addRoutePath('/show/', newsDetailView);

router.route();
