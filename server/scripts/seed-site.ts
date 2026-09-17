/**
 * Amorcage du contenu du site.
 *
 * Verse en base tout ce que l'administration du site gere : carrousel de tete,
 * equipes, calendrier, galerie, actualites, boutique, legendes, frise historique. De quoi ouvrir n'importe quelle page
 * sur du contenu credible, et de quoi apprendre a se servir de l'administration
 * sur de la matiere plutot que sur du vide.
 *
 * Le jeu de donnees vit dans `scripts/dataset/`. Il ne depend plus de
 * `src/data/` du site, qui n'est qu'un repli hors ligne : le contenu de
 * reference, c'est la base.
 *
 * Idempotent — une entree deja presente, reperee par son titre ou son nom,
 * n'est pas dupliquee. Relancer le script est donc sans danger.
 *
 *   npm run seed              # ajoute ce qui manque
 *   npm run seed -- --reset   # vide les huit collections puis reimporte
 *   npm run seed -- --dry-run # annonce ce qui serait ecrit, sans rien ecrire
 *
 * Ne cree aucun compte : `npm run create:admin -- <email>` s'en charge.
 */
import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase, safeMongoUri } from '../src/config/database';
import Article from '../src/models/Article.model';
import Product from '../src/models/Product.model';
import Legend from '../src/models/Legend.model';
import HistoryEvent from '../src/models/HistoryEvent.model';
import HeroSlide from '../src/models/HeroSlide.model';
import Match from '../src/models/Match.model';
import GalleryItem from '../src/models/GalleryItem.model';
import Team from '../src/models/Team.model';
import {
  seedArticles,
  seedGalleryItems,
  seedHeroSlides,
  seedTeams,
  seedHistoryEvents,
  seedMatches,
  seedLegends,
  seedProducts,
} from './dataset';

const reset = process.argv.includes('--reset');
const dryRun = process.argv.includes('--dry-run');

interface Report {
  created: number;
  skipped: number;
}

/**
 * Insere ce qui manque, en reconnaissant l'existant a une cle naturelle.
 *
 * Le titre d'un article ou le nom d'un produit suffit : deux entrees qui les
 * partagent sont la meme chose importee deux fois. C'est ce qui rend le script
 * rejouable sans creer de doublons.
 */
async function importAll<T>(
  label: string,
  // Le type exact du document importe peu ici : le script ecrit des objets
  // simples, que le schema Mongoose valide a l'insertion.
  model: mongoose.Model<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  rows: T[],
  identify: (row: T) => Record<string, unknown>,
  map: (row: T) => Record<string, unknown>
): Promise<Report> {
  if (reset && !dryRun) await model.deleteMany({});

  const report: Report = { created: 0, skipped: 0 };

  for (const row of rows) {
    // Apres un `--reset`, la collection est vide : tout est a creer. En mode
    // simulation elle ne l'est pas, d'ou la verification conditionnelle.
    const exists = reset && !dryRun ? null : await model.findOne(identify(row));

    if (exists) {
      report.skipped += 1;
      continue;
    }

    if (!dryRun) await model.create(map(row));
    report.created += 1;
  }

  const verb = dryRun ? 'à créer' : 'créé(s)';
  console.log(`  ${label.padEnd(22)} ${report.created} ${verb}, ${report.skipped} déjà présent(s)`);
  return report;
}

/** Date d'un commentaire : `daysAfter` jours apres la parution de l'article. */
const commentDate = (publishedAt: string, daysAfter: number): Date => {
  const date = new Date(`${publishedAt}T09:00:00.000Z`);
  date.setDate(date.getDate() + daysAfter);
  return date;
};

async function main(): Promise<number> {
  console.log(`Base : ${safeMongoUri()}`);
  console.log(
    dryRun ? '\nSimulation — rien ne sera écrit :\n'
      : reset ? '\nRéimport complet :\n'
      : '\nImport du contenu manquant :\n'
  );

  await connectDatabase();

  try {
    // Le titre identifie la diapositive : deux diapositives qui le partagent
    // sont la même, importée deux fois.
    await importAll(
      'diapositives de tête',
      HeroSlide,
      seedHeroSlides,
      (slide) => ({ title: slide.title }),
      (slide) => ({ ...slide })
    );

    // Le slug identifie l'équipe : c'est lui que portent les fiches de
    // l'effectif, et deux équipes ne peuvent pas le partager.
    await importAll('équipes', Team, seedTeams, (t) => ({ slug: t.slug }), (team) => ({ ...team }));

    // Adversaire et date font la rencontre : deux matchs qui les partagent
    // sont le même, importé deux fois.
    await importAll(
      'matchs',
      Match,
      seedMatches,
      (m) => ({ opponent: m.opponent, date: m.date }),
      (match) => ({ ...match })
    );

    await importAll(
      'photos de la galerie',
      GalleryItem,
      seedGalleryItems,
      (photo) => ({ title: photo.title }),
      (photo) => ({ ...photo })
    );

    await importAll('actualités', Article, seedArticles, (a) => ({ title: a.title }), (article) => ({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      image: article.image,
      category: article.category,
      publishedAt: new Date(`${article.publishedAt}T09:00:00.000Z`),
      author: article.author,
      status: article.status,
      comments: (article.comments ?? []).map((comment) => ({
        author: comment.author,
        content: comment.content,
        timestamp: commentDate(article.publishedAt, comment.daysAfter),
      })),
    }));

    await importAll('produits', Product, seedProducts, (p) => ({ name: p.name }), (product) => ({
      name: product.name,
      price: product.price,
      category: product.category,
      type: product.type,
      description: product.description,
      sizes: product.sizes,
      image: product.image,
      images: [product.image],
      inStock: product.inStock,
      isVisible: product.isVisible ?? true,
    }));

    await importAll('légendes', Legend, seedLegends, (l) => ({ name: l.name }), (legend) => ({
      ...legend,
    }));

    await importAll(
      'étapes d’histoire',
      HistoryEvent,
      seedHistoryEvents,
      (e) => ({ title: e.title }),
      (event) => ({ ...event })
    );

    if (dryRun) {
      console.log('\n--dry-run : aucune écriture. Relancer sans l’option pour importer.');
      return 0;
    }

    // Les prix sont annonces ici parce que c'est la question qui revient : la
    // boutique est en francs CFA, en entiers, sans sous-unite.
    const cheapest = Math.min(...seedProducts.map((p) => p.price));
    const dearest = Math.max(...seedProducts.map((p) => p.price));
    console.log(
      `\nBoutique : ${seedProducts.length} références de ${cheapest.toLocaleString('fr-FR')}`
      + ` à ${dearest.toLocaleString('fr-FR')} FCFA.`
    );
    console.log('Le contenu est en base. L’administration du site peut le modifier.');
    console.log('Pas encore de compte pour y accéder ? npm run create:admin -- <email>');
    return 0;
  } finally {
    await disconnectDatabase();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error('Échec :', error instanceof Error ? error.stack ?? error.message : error);
    process.exit(1);
  });
