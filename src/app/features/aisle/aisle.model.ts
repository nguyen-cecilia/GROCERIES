import { Database } from '../../core/database-types';
import { AisleColorKey } from '../../core/aisle-colors';

export type Aisle = Omit<Database['public']['Tables']['sg_aisle']['Row'], 'color'> & {
    color: AisleColorKey;
};
