/**
 * Pages d'aperçu pour le partage sur les réseaux.
 *
 * Le site est une application à page unique : le serveur renvoie toujours le
 * même `index.html`, et c'est le navigateur qui compose la page. Les robots de
 * Facebook, WhatsApp, X ou Telegram, eux, ne lancent pas le JavaScript — ils
 * lisent le HTML reçu, et n'y trouveraient donc que les balises génériques du
 * club, quel que soit l'article ou le match partagé.
 *
 * Ces routes rendent, pour un contenu précis, un HTML minimal qui porte ses
 * vraies balises `og:` — titre, description, image. L'Apache du site y dirige
 * les robots (voir `deploy/httpd-site.conf`) ; une personne qui atterrirait
 * ici est renvoyée vers la page normale.
 *
 * Aucune donnée n'est exposée qui ne le soit déjà : ces pages ne montrent que
 * ce que la vitrine publie.
 */

import { Router } from 'express';
import Article from '../models/Article.model';
import Match from '../models/Match.model';
import { handler } from '../lib/http';
import config from '../config/env';

const router = Router();

/** Une valeur qui part dans un attribut HTML doit être échappée, sans exception. */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Adresse absolue d'une image.
 *
 * Les fichiers téléversés sont stockés en chemin relatif (`/uploads/…`) pour
 * que l'API puisse changer de domaine ; les réseaux, eux, exigent une adresse
 * complète. Une image déjà absolue — une photo de banque, par exemple — est
 * laissée telle quelle.
 */
const absoluteImage = (value: string | undefined): string => {
  const trimmed = value?.trim();
  if (!trimmed) return `${config.siteUrl}/assets/img/asc-camberene-equipe-2025.webp`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${config.siteUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

/** Description resserrée : les réseaux coupent au-delà de deux cents caractères. */
const summarize = (value: string, limit = 200): string => {
  const flat = value.replace(/\s+/g, ' ').trim();
  return flat.length <= limit ? flat : `${flat.slice(0, limit - 1)}…`;
};

interface Preview {
  title: string;
  description: string;
  image: string;
  /** Page réelle, vers laquelle une personne est renvoyée. */
  path: string;
  type: 'article' | 'website';
}

const renderPreview = (preview: Preview): string => {
  const url = `${config.siteUrl}${preview.path}`;
  const title = escapeHtml(preview.title);
  const description = escapeHtml(preview.description);
  const image = escapeHtml(preview.image);

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:site_name" content="ASC Cambérène" />
    <meta property="og:type" content="${preview.type}" />
    <meta property="og:locale" content="fr_SN" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <!--
      Un robot s'arrête aux balises ci-dessus. Une personne qui ouvrirait ce
      lien est renvoyée vers la page réelle : la redirection est écrite deux
      fois, car un navigateur sans JavaScript n'a que la balise meta refresh.
    -->
    <meta http-equiv="refresh" content="0; url=${escapeHtml(url)}" />
  </head>
  <body>
    <p>Redirection vers <a href="${escapeHtml(url)}">${title}</a>…</p>
    <script>window.location.replace(${JSON.stringify(url)});</script>
  </body>
</html>`;
};

/** Repli quand le contenu n'existe plus : le lien mène au site, pas à une erreur. */
const fallback = (): Preview => ({
  title: 'ASC Cambérène — Club officiel',
  description: 'Club officiel de football sénégalais, fondé en 1965.',
  image: absoluteImage(undefined),
  path: '/',
  type: 'website',
});

const send = (res: import('express').Response, preview: Preview): void => {
  // Les aperçus sont mis en cache par les réseaux de toute façon ; cinq
  // minutes suffisent à absorber une rafale de partages sans figer une
  // correction de titre pour la journée.
  res.set('Cache-Control', 'public, max-age=300');
  res.type('html').send(renderPreview(preview));
};

router.get(
  '/article/:id',
  handler(async (req, res) => {
    const article = await Article.findOne({ _id: req.params.id, status: 'published' });

    if (!article) {
      send(res, fallback());
      return;
    }

    send(res, {
      title: article.title,
      description: summarize(article.excerpt || article.content || ''),
      image: absoluteImage(article.image),
      path: `/news/${article.id}`,
      type: 'article',
    });
  })
);

router.get(
  '/match/:id',
  handler(async (req, res) => {
    const match = await Match.findById(req.params.id);

    if (!match) {
      send(res, fallback());
      return;
    }

    const affiche =
      match.venue === 'Domicile'
        ? `ASC Cambérène — ${match.opponent}`
        : `${match.opponent} — ASC Cambérène`;

    const date = new Date(`${match.date}T12:00:00`).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    // Un match joué s'annonce par son score, un match à venir par son
    // rendez-vous : c'est ce qu'un supporter veut lire dans l'aperçu.
    const description = match.result
      ? `${affiche} · ${match.result.home} — ${match.result.away} · ${match.competition}`
      : `${date} à ${match.time} · ${match.competition} · ${match.venue}`;

    send(res, {
      title: affiche,
      description,
      image: absoluteImage(match.image),
      path: '/billetterie',
      type: 'website',
    });
  })
);

export default router;
