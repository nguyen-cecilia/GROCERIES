import { Aisle } from '../aisle/aisle.model';

export interface Article {
    id: string;
    label: string;
    price: number | null;
    lastPrice: number | null;
    priceCurrency: string;
    userId: string;
    aisleId: string;
    aisle: Aisle;
}
