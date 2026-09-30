import { Article } from '../article/article.model';

export interface GroceriesList {
    id: string;
    label: string;
    userId: string;
    budget: number;
    items: GroceriesListItem[];
    lastUpdated: Date;
}

export interface GroceriesListItem {
    id: string;
    listId: string;
    quantity: number;
    quantityUnit: QuantityUnit;
    checked: boolean;
    articleId: string;
    article?: Article;
}

export interface QuantityUnit {
    id: string;
    label: string;
}
