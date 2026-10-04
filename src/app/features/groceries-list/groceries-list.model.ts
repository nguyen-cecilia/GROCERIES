import { Database } from '../../core/database-types';

export type GroceriesListItem = Database['public']['Tables']['sg_groceries_list_item']['Row'];

export type GroceriesList = Database['public']['Tables']['sg_groceries_list']['Row'] & {
    items: GroceriesListItem[];
};

export type QuantityUnit = Database['public']['Tables']['sg_quantity_unit']['Row'];
