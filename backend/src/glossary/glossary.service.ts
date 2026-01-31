import { Injectable } from '@nestjs/common';
import {
  defaultLocale,
  glossaryByLocale,
  glossaryCategoryIds,
  supportedLocales,
  termKeysByCategory,
} from './glossary.data';
import {
  GlossaryCategoryDto,
  GlossaryResponseDto,
  GlossaryTermDto,
} from './dto/glossary-response.dto';

@Injectable()
export class GlossaryService {
  getGlossary(locale: string): GlossaryResponseDto {
    const resolvedLocale = supportedLocales.includes(
      locale as (typeof supportedLocales)[number],
    )
      ? locale
      : defaultLocale;
    const data =
      glossaryByLocale[resolvedLocale] ?? glossaryByLocale[defaultLocale];

    const categories: GlossaryCategoryDto[] = glossaryCategoryIds.map(
      (categoryId) => {
        const termKeys = termKeysByCategory[categoryId];
        const terms: GlossaryTermDto[] = termKeys
          .map((key) => {
            const entry = data.terms[key];
            if (!entry) return null;
            return { key, term: entry.term, definition: entry.definition };
          })
          .filter((t): t is GlossaryTermDto => t !== null);
        return {
          id: categoryId,
          label: data.categories[categoryId] ?? categoryId,
          terms,
        };
      },
    );

    return { categories };
  }
}
