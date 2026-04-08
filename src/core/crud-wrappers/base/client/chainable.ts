import { OrderBy, SupabaseClientAdapter, GetTableOpts, UpdateTableOpts, CRUDOptions } from "../../../../types/index.js";
import { ClientWrapper } from "../../client-wrapper/index.js";

export class Chainable<T, TClient extends SupabaseClientAdapter> {
    private opts: CRUDOptions<T>;

    constructor(private client: ClientWrapper<T, TClient>) {
        this.opts = {} as CRUDOptions<T>;
    }

    where(key: keyof T, value: T[keyof T]) {
        if (!this.opts.eq) this.opts.eq = [];
        this.opts.eq.push({ key, value });
        return this;
    }

    gt(key: keyof T, value: T[keyof T]) {
        if (!this.opts.gt) this.opts.gt = [];
        this.opts.gt.push({ key, value });
        return this;
    }

    gte(key: keyof T, value: T[keyof T]) {
        if (!this.opts.gte) this.opts.gte = [];
        this.opts.gte.push({ key, value });
        return this;
    }

    lt(key: keyof T, value: T[keyof T]) {
        if (!this.opts.lt) this.opts.lt = [];
        this.opts.lt.push({ key, value });
        return this;
    }

    lte(key: keyof T, value: T[keyof T]) {
        if (!this.opts.lte) this.opts.lte = [];
        this.opts.lte.push({ key, value });
        return this;
    }

    contains(key: keyof T, value: T[keyof T]) {
        if (!this.opts.contains) this.opts.contains = [];
        this.opts.contains.push({ key, value });
        return this;
    }

    overlaps(key: keyof T, values: T[keyof T][]) {
        if (!this.opts.overlaps) this.opts.overlaps = [];
        this.opts.overlaps.push({ key, value: values });
        return this;
    }

    in(key: keyof T, values: T[keyof T][]) {
        this.opts.inValue = { key, value: values };
        return this;
    }

    or(condition: string) {
        this.opts.or = condition;
        return this;
    }

    // Pagination & Sorting
    orderBy(key: keyof T, order: OrderBy = "asc") {
        this.opts.sortBy = key;
        this.opts.orderBy = order;
        return this;
    }

    limit(n: number) {
        this.opts.limit = n;
        return this;
    }

    page(p: number, pageSize: number) {
        this.opts.page = p;
        this.opts.offset = (p - 1) * pageSize;
        return this;
    }

    // Execution
    async get() {
        return this.client.get(this.opts);
    }

    async first() {
        this.opts.single = true;
        return this.client.get(this.opts);
    }
}