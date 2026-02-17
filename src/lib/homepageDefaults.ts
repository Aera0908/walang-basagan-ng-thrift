import type { HomepageContent } from './api'

import defaultsJson from '../data/homepageDefaults.json'

const defaults = defaultsJson as HomepageContent

/**
 * Merges API homepage content with hardcoded defaults.
 * When admin/mod hasn't set a value, the default from homepageDefaults.json is used.
 */
export function mergeWithDefaults(apiContent: HomepageContent | Record<string, unknown>): HomepageContent {
  const api = apiContent as HomepageContent
  return {
    hero_banners: api.hero_banners?.length ? api.hero_banners : defaults.hero_banners,
    achievements_title: api.achievements_title || defaults.achievements_title,
    brand_intro: {
      ...defaults.brand_intro,
      ...api.brand_intro,
      title: api.brand_intro?.title ?? defaults.brand_intro?.title,
      headline: api.brand_intro?.headline || defaults.brand_intro?.headline,
      paragraph1: api.brand_intro?.paragraph1 || defaults.brand_intro?.paragraph1,
      paragraph2: api.brand_intro?.paragraph2 || defaults.brand_intro?.paragraph2,
      image: api.brand_intro?.image ?? defaults.brand_intro?.image,
    },
    jacket_showcase: {
      ...defaults.jacket_showcase,
      ...api.jacket_showcase,
      default_image: api.jacket_showcase?.default_image ?? defaults.jacket_showcase?.default_image,
      bottom_text: api.jacket_showcase?.bottom_text || defaults.jacket_showcase?.bottom_text,
      cards: api.jacket_showcase?.cards?.length ? api.jacket_showcase.cards : defaults.jacket_showcase?.cards,
    },
    about_us: {
      ...defaults.about_us,
      ...api.about_us,
      title: api.about_us?.title || defaults.about_us?.title,
      headline: api.about_us?.headline || defaults.about_us?.headline,
      sub_text: api.about_us?.sub_text || defaults.about_us?.sub_text,
      image: api.about_us?.image ?? defaults.about_us?.image,
    },
    trusted_section: {
      ...defaults.trusted_section,
      ...api.trusted_section,
      title: api.trusted_section?.title || defaults.trusted_section?.title,
      review_ids: api.trusted_section?.review_ids ?? defaults.trusted_section?.review_ids,
    },
    footer_socials: {
      ...defaults.footer_socials,
      ...api.footer_socials,
      facebook: { ...defaults.footer_socials?.facebook, ...api.footer_socials?.facebook },
      instagram: { ...defaults.footer_socials?.instagram, ...api.footer_socials?.instagram },
      tiktok: { ...defaults.footer_socials?.tiktok, ...api.footer_socials?.tiktok },
      x: { ...defaults.footer_socials?.x, ...api.footer_socials?.x },
    },
  }
}
