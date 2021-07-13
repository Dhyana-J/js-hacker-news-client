import View from '../core/view';
//interface 설정
//interface는 타입을 결합하거나 조합시키는 방식에서 typeAlias와 차이가 있다.
//유니온타입 '|' 은 지원 안함

export interface Store {
    currentPage: number;
    feeds: NewsFeed[]; //NewsFeed 유형의 데이터가 들어갈 배열을 의미
}

export interface News {
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
export interface NewsFeed extends News {
    comments_count: number;
    points: number;
    read?: boolean; // ?를 붙이면 있을 수도 있고 없을 수도 있는 optional 속성이 된다.
}

export interface NewsDetail extends News {
    comments: NewsComment[];
}

export interface NewsComment extends News {
    comments: NewsComment[];
    level: number;
}

export interface RouteInfo {
    path: string;
    page: View;
}
