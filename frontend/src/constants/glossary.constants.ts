export const glossaryCategoryIds = ['platform', 'legal'] as const;

export type GlossaryCategoryId = (typeof glossaryCategoryIds)[number];

export const glossaryCategoryIdPlatform: GlossaryCategoryId = 'platform';

export const glossaryCategoryIdLegal: GlossaryCategoryId = 'legal';
