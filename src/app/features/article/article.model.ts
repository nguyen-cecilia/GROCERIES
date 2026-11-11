import type { Aisle } from '../aisle/aisle.model';
import { Database } from '../../core/database-types';

export type Article = Database['public']['Tables']['sg_article']['Row'];
