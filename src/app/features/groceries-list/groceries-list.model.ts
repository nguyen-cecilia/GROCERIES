import type { Database } from '../../core/database-types';
import type { Article } from '../article/article.model';
import type { Aisle } from '../aisle/aisle.model';

export type GroceriesList = Database['public']['Tables']['sg_groceries_list']['Row'];
export type GroceriesListItem = Database['public']['Tables']['sg_groceries_list_item']['Row'];
export type QuantityUnit = Database['public']['Tables']['sg_quantity_unit']['Row'];

export type GroceriesListItemView = GroceriesListItem & {
    article: Article | null;
    aisle: Aisle | null;
    quantityUnit: QuantityUnit | null;
};

export type GroceriesListWithItems = GroceriesList & {
    items: GroceriesListItemView[];
};
