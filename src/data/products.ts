


import { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: "Maillot Domicile ASC Camberene 2025",
    price: 45000,
    category: "Maillots",
    type: "Domicile",
    image: "assets/img/asc-camberene-equipe-2025.webp",
    images: [
      "assets/img/asc-camberene-equipe-2025.webp",
      "assets/img/asc-camberene-equipe-2025.webp"
    ],
    description: "Maillot officiel domicile ASC Camberene 2025. Couleurs jaune et bleu traditionnelles avec broderies premium. Tissu technique respirant pour un confort optimal.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true
  },
  {
    id: 2,
    name: "Maillot Extérieur ASC Camberene 2025",
    price: 45000,
    category: "Maillots", 
    type: "Extérieur",
    image: "assets/img/coupe.jpg",
    images: [
      "assets/img/coupe.jpg",
      "assets/img/coupe.jpg"
    ],
    description: "Nouveau maillot extérieur avec design moderne inspiré de l'art sénégalais. Qualité premium pour les vrais supporters.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true
  },
  {
    id: 3,
    name: "Ballon Officiel ASC Camberene",
    price: 25000,
    category: "Accessoires",
    type: "Autre",
    image: "assets/img/coupe.jpg",
    images: [
      "assets/img/coupe.jpg"
    ],
    description: "Ballon officiel ASC Camberene taille 5. Parfait pour l'entraînement et les matchs amicaux. Logo du club brodé.",
    sizes: ["Taille 5"],
    inStock: true
  },
  {
    id: 4,
    name: "Écharpe ASC Camberene",
    price: 6000,
    category: "Accessoires",
    type: "Autre",
    image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    images: [
      "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    ],
    description: "Écharpe officielle en acrylique doux. Parfaite pour les matchs en hiver.",
    sizes: ["Unique"],
    inStock: true
  },
  {
    id: 5,
    name: "Casquette Officielle",
    price: 9000,
    category: "Accessoires",
    type: "Autre",
    image: "https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    images: [
      "https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    ],
    description: "Casquette ajustable avec broderie logo. 100% coton premium.",
    sizes: ["Unique"],
    inStock: true
  },
  {
    id: 6,
    name: "Sac de Sport",
    price: 22000,
    category: "Accessoires",
    type: "Autre",
    image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    images: [
      "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    ],
    description: "Sac de sport polyvalent avec compartiments multiples. Idéal pour l'entraînement.",
    sizes: ["Unique"],
    inStock: true
  }
];