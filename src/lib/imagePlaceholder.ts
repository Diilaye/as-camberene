/**
 * Image de remplacement.
 *
 * Les visuels du site viennent de trois sources — le backend, les données de
 * repli de `src/data/`, et les fichiers de `public/assets/` — et l'une d'elles
 * peut toujours manquer un fichier. Sans filet, le navigateur affiche son icône
 * d'image brisée au beau milieu d'une carte ; avec, la carte garde sa forme et
 * porte les couleurs du club.
 *
 * Le visuel est une donnée en ligne : il s'affiche même quand le réseau est la
 * cause de l'échec.
 */
export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#18191c"/>
      <path d="M0 300 L400 140 L400 300 Z" fill="#0D7C27" opacity="0.35"/>
      <circle cx="200" cy="120" r="34" fill="none" stroke="#F9ED3A" stroke-width="3"/>
      <path d="M200 100 l14 10 -5 17 h-18 l-5 -17 z" fill="#F9ED3A"/>
      <text x="200" y="196" fill="#F9ED3A" font-family="Arial,sans-serif" font-size="15"
            font-weight="bold" letter-spacing="2" text-anchor="middle">VISUEL À VENIR</text>
    </svg>`
  );

/**
 * À brancher sur `onError` d'une balise `img`.
 *
 * `onerror` est retiré avant de changer `src` : si le remplacement échouait à
 * son tour, le gestionnaire se rappellerait sans fin.
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = IMAGE_PLACEHOLDER;
};
