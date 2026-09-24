import Joi from 'joi';

const text = (max: number) => Joi.string().allow('').max(max);
const url = Joi.string().allow('').max(500);

/**
 * Sections de l'accueil que l'on peut masquer.
 *
 * Masquer n'efface rien : le contenu de la section reste dans sa rubrique, et
 * réapparaît dès qu'on la réaffiche.
 */
export const HOME_SECTIONS = ['hero', 'matchCenter', 'news', 'facts', 'shop', 'banner', 'legends', 'gallery'] as const;

export const siteSettingsSchema = Joi.object({
  topBar: text(200),
  socials: Joi.object({
    facebook: url,
    instagram: url,
    x: url,
    youtube: url,
  }),
  facts: Joi.array()
    .items(Joi.object({ value: text(20), label: text(60) }))
    .max(8),
  banner: Joi.object({
    image: url,
    kicker: text(80),
    title: text(200),
  }),
  partners: Joi.array()
    .items(Joi.object({ name: text(80), logo: url, href: url }))
    .max(12),
  newsletter: Joi.object({
    title: text(80),
    text: text(300),
  }),
  contact: Joi.object({
    address: text(300),
    phone: text(40),
    email: text(120),
  }),
  footerNote: text(500),
  homeSections: Joi.object(
    Object.fromEntries(HOME_SECTIONS.map((section) => [section, Joi.boolean()]))
  ),
});
