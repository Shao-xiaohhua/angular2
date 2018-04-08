
export class Pagination<T> {
    pageSize: number;
    page: number;
    offset: number;
    totalCount: number;
    totalPage: number;
    items: T[];

    constructor(items: T[], totalCount = -1, totalPage = 1, pageSize = 20, page = 1, offset = 0) {
        if (totalCount < 0) {
            totalCount = items.length;
        }
    }

    get previous(): number {
        return this.page > 1 ? this.page - 1 : 1;
    }

    get next(): number {
        return this.page < this.totalPage ? this.page + 1 : this.totalPage;
    }

    hasPrevious(): boolean {
        return this.page > 1;
    }

    hasNext(): boolean {
        return this.page < this.totalPage;
    }
}
