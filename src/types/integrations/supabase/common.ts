export interface CommonSchema {
  id: string;
  created_at: string;
  updated_at?: string;
}

export type OrderBy = "asc" | "dec";

export interface CRUDOptions<Table> {
  eq?: { key: keyof Table; value: Table[keyof Table] }[];
  gt?: { key: keyof Table; value: Table[keyof Table] }[];
  gte?: { key: keyof Table; value: Table[keyof Table] }[];
  lt?: { key: keyof Table; value: Table[keyof Table] }[];
  lte?: { key: keyof Table; value: Table[keyof Table] }[];
  sortBy?: keyof Table;
  orderBy?: OrderBy;
  limit?: number;
  single?: boolean;
  maybeSingle?: boolean;
  or?: string;
  contains?: { key: keyof Table; value: Table[keyof Table] }[];
  overlaps?: { key: keyof Table; value: Table[keyof Table][] }[];
  ilike?: { key: keyof Table; value: Table[keyof Table] }[];
  inValue?: { key: keyof Table; value: Table[keyof Table][] };
  search?: string;
  searchFields?: (keyof Table)[];
  page?: number;
  offset?: number;
}

type OmittedUpdateTableOpts =
  | "limit"
  | "single"
  | "maybeSingle"
  | "orderBy"
  | "sortBy"
  | "search"
  | "searchFields"
  | "page"
  | "offset";

export interface UpdateTableOpts<Table>
  extends Omit<
    CRUDOptions<Table>,
    OmittedUpdateTableOpts
  > { }

export interface GetTableOpts<Table>
  extends CRUDOptions<Table> { }
