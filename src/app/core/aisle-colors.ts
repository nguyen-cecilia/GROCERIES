export const AISLE_COLORS = [
    'violet', 'blue', 'cyan', 'teal', 'green', 'lime',
    'amber', 'orange', 'red', 'rose', 'brown', 'slate',
] as const;

export type AisleColorKey = (typeof AISLE_COLORS)[number];

export const AISLE_PALETTE: Record<AisleColorKey, string> = {
    violet: '#9b84b5',
    blue: '#6087be',
    cyan: '#4bbcc0',
    teal: '#4f937f',
    green: '#547951',
    lime: '#c5e397',
    amber: '#d5a332',
    orange: '#d57b32',
    red: '#c94b32',
    rose: '#c47a86',
    brown: '#8a5a3b',
    slate: '#8b99a8',
};

export const DEFAULT_AISLE_COLOR: AisleColorKey = 'slate';
export const AISLE_COLOR_FALLBACK = '#9b9b9b';

export function isAisleColorKey(value: string): value is AisleColorKey {
    return (AISLE_COLORS as readonly string[]).includes(value);
}

export function aisleColorHex(key: string | null | undefined): string {
    return key && isAisleColorKey(key) ? AISLE_PALETTE[key] : AISLE_COLOR_FALLBACK;
}

export function normalizeAisleColor(value: string | null | undefined): AisleColorKey {
    if (value && isAisleColorKey(value)) return value;
    const legacy = value?.toLowerCase();
    const match = AISLE_COLORS.find((key) => AISLE_PALETTE[key] === legacy);
    return match ?? DEFAULT_AISLE_COLOR;
}

export const AISLE_COLOR_OPTIONS = AISLE_COLORS.map((key) => ({
    value: key,
    color: AISLE_PALETTE[key],
    label: key,
}));
