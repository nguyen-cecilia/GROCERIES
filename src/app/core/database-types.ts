export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: '14.17';
    };
    graphql_public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json;
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    public: {
        Tables: {
            sg_aisle: {
                Row: {
                    color: string;
                    created_at: string;
                    id: string;
                    label: string;
                    position: number;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    color?: string;
                    created_at?: string;
                    id?: string;
                    label: string;
                    position?: number;
                    updated_at?: string;
                    user_id?: string;
                };
                Update: {
                    color?: string;
                    created_at?: string;
                    id?: string;
                    label?: string;
                    position?: number;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            sg_article: {
                Row: {
                    aisle_id: string | null;
                    created_at: string;
                    id: string;
                    label: string;
                    last_price: number | null;
                    price: number | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    aisle_id?: string | null;
                    created_at?: string;
                    id?: string;
                    label: string;
                    last_price?: number | null;
                    price?: number | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Update: {
                    aisle_id?: string | null;
                    created_at?: string;
                    id?: string;
                    label?: string;
                    last_price?: number | null;
                    price?: number | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'sg_article_aisle_id_fkey';
                        columns: ['aisle_id'];
                        isOneToOne: false;
                        referencedRelation: 'sg_aisle';
                        referencedColumns: ['id'];
                    },
                ];
            };
            sg_groceries_list: {
                Row: {
                    budget: number;
                    created_at: string;
                    id: string;
                    label: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    budget?: number;
                    created_at?: string;
                    id?: string;
                    label: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Update: {
                    budget?: number;
                    created_at?: string;
                    id?: string;
                    label?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            sg_groceries_list_item: {
                Row: {
                    article_id: string | null;
                    checked: boolean;
                    created_at: string;
                    id: string;
                    list_id: string;
                    quantity: number;
                    quantity_unit_id: string | null;
                    updated_at: string;
                };
                Insert: {
                    article_id?: string | null;
                    checked?: boolean;
                    created_at?: string;
                    id?: string;
                    list_id: string;
                    quantity?: number;
                    quantity_unit_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    article_id?: string | null;
                    checked?: boolean;
                    created_at?: string;
                    id?: string;
                    list_id?: string;
                    quantity?: number;
                    quantity_unit_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'sg_groceries_list_item_article_id_fkey';
                        columns: ['article_id'];
                        isOneToOne: false;
                        referencedRelation: 'sg_article';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'sg_groceries_list_item_list_id_fkey';
                        columns: ['list_id'];
                        isOneToOne: false;
                        referencedRelation: 'sg_groceries_list';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'sg_groceries_list_item_quantity_unit_id_fkey';
                        columns: ['quantity_unit_id'];
                        isOneToOne: false;
                        referencedRelation: 'sg_quantity_unit';
                        referencedColumns: ['id'];
                    },
                ];
            };
            sg_quantity_unit: {
                Row: {
                    apply_quantity: boolean;
                    created_at: string;
                    id: string;
                    label: string;
                    position: number;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    apply_quantity?: boolean;
                    created_at?: string;
                    id?: string;
                    label: string;
                    position?: number;
                    updated_at?: string;
                    user_id?: string;
                };
                Update: {
                    apply_quantity?: boolean;
                    created_at?: string;
                    id?: string;
                    label?: string;
                    position?: number;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            sg_reorder_aisles: { Args: { p_ids: string[] }; Returns: undefined };
            sg_reorder_quantity_units: {
                Args: { p_ids: string[] };
                Returns: undefined;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
            DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] &
            DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
    EnumName extends (DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const;
