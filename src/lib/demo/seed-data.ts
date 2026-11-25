import type {
  Address,
  AuditLog,
  Brand,
  Category,
  Coupon,
  InventoryMovement,
  Order,
  Product,
  ProductVariant,
  Review,
  Role,
  Session,
  ShippingRule,
  StoreSettings,
  User,
} from "@/lib/types";
import { slugify } from "@/lib/utils";

export interface DemoUser extends User {
  passwordHash: string;
}

export interface DemoStore {
  users: DemoUser[];
  sessions: Record<string, Session>;
  categories: Category[];
  brands: Brand[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  addresses: Address[];
  wishlists: Record<string, string[]>;
  coupons: Coupon[];
  newsletter: { email: string; createdAt: string }[];
  settings: StoreSettings;
  content: Record<string, unknown>;
  audit: AuditLog[];
  inventory: InventoryMovement[];
  webhooks: unknown[];
  shippingRules: ShippingRule[];
}

const img = (id: string, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const images = {
  hero: img("photo-1483985988355-763728e1935b", 1800),
  heroMobile: img("photo-1469334031218-e382a71b716b", 900),
  editorial: img("photo-1529139574466-a303027c1d8b", 1400),
  campaign: img("photo-1558769132-cb1aea458c5e", 1400),
  womenCategory: img("photo-1490481651871-ab68de25d43d", 800),
  menCategory: img("photo-1516257984-b1b4d707412e", 800),
  dressCategory: img("photo-1595777457583-95e059d581b8", 800),
  shoesCategory: img("photo-1549298916-b41d501d3772", 800),
  bagCategory: img("photo-1584917865442-de89df76afd3", 800),
  accessoryCategory: img("photo-1523275335684-37898b6baf30", 800),
  sportCategory: img("photo-1517836357463-d25dfeac3438", 800),
  beautyCategory: img("photo-1596462502278-27bfdc403348", 800),
};

const photoIds = [
  "photo-1483985988355-763728e1935b",
  "photo-1490481651871-ab68de25d43d",
  "photo-1445205170230-053b83016050",
  "photo-1469334031218-e382a71b716b",
  "photo-1487222477894-8943e31ef7b2",
  "photo-1503342217505-b0a15ec3261c",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1525507119028-ed4c629a60a3",
  "photo-1539109136881-3be0616acf4b",
  "photo-1542291026-7eec264c27ff",
  "photo-1549298916-b41d501d3772",
  "photo-1560769629-975ec94e6a86",
  "photo-1600185365483-26d7a4cc7519",
  "photo-1523275335684-37898b6baf30",
  "photo-1584917865442-de89df76afd3",
  "photo-1553062407-98eeb64c6a62",
  "photo-1547949003-9792a18a2601",
  "photo-1591047139829-d91aecb6caea",
  "photo-1551028719-00167b16eac5",
  "photo-1591369822096-ffd140ec948f",
  "photo-1515372039744-b8f02a3ae446",
  "photo-1572804013309-59a88b7e92f1",
  "photo-1566174053879-31528523f8ae",
  "photo-1509631179647-0177331693ae",
  "photo-1485231183945-fffde7ccf795",
  "photo-1475180098004-ca77a66827be",
  "photo-1516257984-b1b4d707412e",
  "photo-1617137968427-85924c800a22",
  "photo-1620799140408-edc6dcb6d633",
  "photo-1521572163474-6864f9cf17ab",
  "photo-1503341504253-dff4815485f1",
  "photo-1596755094514-f87e34085b2c",
  "photo-1542272604-787c3835535d",
  "photo-1541099649105-f69ad21f3246",
  "photo-1551232864-3f0890e580d9",
  "photo-1558769132-cb1aea458c5e",
  "photo-1489987707025-afc232f7ea0f",
  "photo-1434389677669-e08b4cac3105",
  "photo-1524250502761-1ac6f2e30d43",
  "photo-1534528741775-53994a69daeb",
  "photo-1496747611176-843222e1e57c",
  "photo-1581044777550-4cfa60707c03",
  "photo-1485968579580-b6d095142e6e",
  "photo-1550614000-4895a10e1bfd",
  "photo-1539008835657-9e8e9680c956",
  "photo-1583496661160-fb5886a13d27",
  "photo-1539533018447-63fcce2678e3",
  "photo-1544022613-e87ca75a784a",
  "photo-1529139574466-a303027c1d8b",
  "photo-1517836357463-d25dfeac3438",
  "photo-1596462502278-27bfdc403348",
];

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

const brandNames = [
  "AURELIA",
  "NOIR ATELIER",
  "MAISON V",
  "STUDIO 84",
  "LUNE",
  "FORM & FIELD",
  "NORTHERN",
  "VERA",
  "KAIRO",
  "ÉLAN",
];

const categorySeeds: Array<{
  name: string;
  gender: Category["gender"];
  parent: string | null;
  image: string;
  order: number;
  description: string;
}> = [
  { name: "Women", gender: "women", parent: null, image: images.womenCategory, order: 1, description: "Considered collections for the modern woman." },
  { name: "Men", gender: "men", parent: null, image: images.menCategory, order: 2, description: "Elevated staples and statement pieces for men." },
  { name: "Clothing", gender: "unisex", parent: "women", image: img(photoIds[35]), order: 3, description: "Everyday clothing, reimagined." },
  { name: "Dresses", gender: "women", parent: "women", image: images.dressCategory, order: 4, description: "Occasion and everyday dresses." },
  { name: "Tops", gender: "women", parent: "women", image: img(photoIds[28]), order: 5, description: "Blouses, shirts and knitwear." },
  { name: "Jeans", gender: "unisex", parent: "women", image: img(photoIds[32]), order: 6, description: "Denim in every fit and wash." },
  { name: "Shoes", gender: "unisex", parent: null, image: images.shoesCategory, order: 7, description: "Footwear that carries you through the season." },
  { name: "Bags", gender: "unisex", parent: null, image: images.bagCategory, order: 8, description: "Bags designed to be lived in." },
  { name: "Accessories", gender: "unisex", parent: null, image: images.accessoryCategory, order: 9, description: "The finishing touches." },
  { name: "Sportswear", gender: "unisex", parent: null, image: images.sportCategory, order: 10, description: "Performance-led pieces for movement." },
  { name: "Beauty", gender: "women", parent: null, image: images.beautyCategory, order: 11, description: "Beauty essentials and ritual." },
  { name: "Shirts", gender: "men", parent: "men", image: img(photoIds[30]), order: 12, description: "Shirts for every occasion." },
  { name: "Outerwear", gender: "unisex", parent: null, image: img(photoIds[46]), order: 13, description: "Layers for changing weather." },
  { name: "Knitwear", gender: "unisex", parent: null, image: img(photoIds[18]), order: 14, description: "Soft knits, considered construction." },
];

type ProductSeed = {
  name: string;
  brand: number;
  category: string;
  gender: Product["gender"];
  price: number;
  compare?: number;
  photo: number;
  colours: [string, string][];
  sizes?: string[];
  material: string;
  style: string;
  flags?: Array<"featured" | "newArrival" | "trending">;
  rating?: number;
};

const apparelSizes = ["XS", "S", "M", "L", "XL"];
const shoeSizes = ["36", "37", "38", "39", "40", "41", "42", "43"];
const oneSize = ["One Size"];

const productSeeds: ProductSeed[] = [
  { name: "Sculpted Midi Dress", brand: 0, category: "dresses", gender: "women", price: 18900, compare: 24500, photo: 18, colours: [["Black", "#161616"], ["Sand", "#c9b49a"]], material: "Viscose blend", style: "Occasion", flags: ["featured", "trending"], rating: 4.8 },
  { name: "Fluid Satin Slip Dress", brand: 2, category: "dresses", gender: "women", price: 22500, photo: 20, colours: [["Champagne", "#d8c7a8"], ["Emerald", "#1f4d3a"]], material: "Satin", style: "Occasion", flags: ["newArrival"] },
  { name: "Pleated Midi Skirt", brand: 4, category: "clothing", gender: "women", price: 14200, compare: 18000, photo: 23, colours: [["Navy", "#1d2637"], ["Cream", "#ece4d6"]], material: "Polyester", style: "Workwear" },
  { name: "Tailored Blazer", brand: 1, category: "clothing", gender: "women", price: 31900, photo: 17, colours: [["Charcoal", "#33343a"], ["Camel", "#a9825b"]], material: "Wool blend", style: "Workwear", flags: ["featured"] },
  { name: "Cropped Trench Coat", brand: 0, category: "outerwear", gender: "women", price: 34800, photo: 46, colours: [["Stone", "#b8ab98"], ["Black", "#161616"]], material: "Cotton gabardine", style: "Streetwear", flags: ["newArrival", "trending"] },
  { name: "Ribbed Knit Cardigan", brand: 5, category: "knitwear", gender: "women", price: 16500, photo: 18, colours: [["Oat", "#d6c8b4"], ["Rust", "#a65338"]], material: "Merino wool", style: "Everyday" },
  { name: "Silk Blouse", brand: 2, category: "tops", gender: "women", price: 19800, compare: 25000, photo: 22, colours: [["Ivory", "#f2ece1"], ["Sky", "#9db9c9"]], material: "Silk", style: "Workwear" },
  { name: "Relaxed Cotton Shirt", brand: 5, category: "tops", gender: "women", price: 12900, photo: 29, colours: [["White", "#f7f6f3"], ["Blue", "#7e9ab1"]], material: "Cotton poplin", style: "Everyday", flags: ["featured"] },
  { name: "Wide-Leg Trousers", brand: 1, category: "clothing", gender: "women", price: 21400, photo: 35, colours: [["Black", "#161616"], ["Taupe", "#9b8b79"]], material: "Crepe", style: "Workwear" },
  { name: "High-Rise Straight Jeans", brand: 6, category: "jeans", gender: "women", price: 16900, compare: 21000, photo: 33, colours: [["Indigo", "#2f4270"], ["Washed Black", "#2a2a2c"]], sizes: ["24", "25", "26", "27", "28", "29", "30", "31"], material: "Organic denim", style: "Everyday", flags: ["trending"] },
  { name: "Denim Mini Skirt", brand: 6, category: "jeans", gender: "women", price: 11800, photo: 34, colours: [["Light Wash", "#8ba5c0"]], sizes: ["24", "25", "26", "27", "28", "29"], material: "Denim", style: "Streetwear" },
  { name: "Linen Wrap Top", brand: 4, category: "tops", gender: "women", price: 11500, photo: 24, colours: [["White", "#f7f6f3"], ["Olive", "#6b6f4e"]], material: "Linen", style: "Summer" },
  { name: "Sequin Party Dress", brand: 9, category: "dresses", gender: "women", price: 38900, compare: 48000, photo: 44, colours: [["Gold", "#c9a227"], ["Black", "#161616"]], material: "Sequined mesh", style: "Partywear", flags: ["featured"] },
  { name: "Belted Shirt Dress", brand: 0, category: "dresses", gender: "women", price: 24500, photo: 21, colours: [["Navy", "#1d2637"], ["White", "#f7f6f3"]], material: "Cotton poplin", style: "Workwear", flags: ["newArrival"] },
  { name: "Cashmere Crew Knit", brand: 5, category: "knitwear", gender: "women", price: 28500, photo: 18, colours: [["Camel", "#a9825b"], ["Grey", "#8b8b8f"]], material: "Cashmere", style: "Everyday", flags: ["featured"] },
  { name: "Pleated Maxi Dress", brand: 2, category: "dresses", gender: "women", price: 26500, compare: 32000, photo: 43, colours: [["Terracotta", "#b15c3a"], ["Navy", "#1d2637"]], material: "Chiffon", style: "Occasion" },
  { name: "Sports Luxe Leggings", brand: 7, category: "sportswear", gender: "women", price: 9800, photo: 49, colours: [["Black", "#161616"], ["Stone", "#b8ab98"]], sizes: ["XS", "S", "M", "L"], material: "Recycled polyamide", style: "Sportswear" },
  { name: "Cropped Training Jacket", brand: 7, category: "sportswear", gender: "women", price: 14500, photo: 49, colours: [["Black", "#161616"]], material: "Technical shell", style: "Sportswear" },

  { name: "Slim Fit Oxford Shirt", brand: 0, category: "shirts", gender: "men", price: 15500, photo: 30, colours: [["White", "#f7f6f3"], ["Sky", "#9db9c9"], ["Navy", "#1d2637"]], material: "Cotton oxford", style: "Workwear", flags: ["featured", "trending"] },
  { name: "Relaxed Linen Shirt", brand: 5, category: "shirts", gender: "men", price: 17900, compare: 22000, photo: 31, colours: [["Ecru", "#e8dfcf"], ["Sage", "#88907a"]], material: "Linen", style: "Summer", flags: ["newArrival"] },
  { name: "Printed Resort Shirt", brand: 8, category: "shirts", gender: "men", price: 16500, photo: 30, colours: [["Navy Print", "#1d2637"], ["Sand Print", "#c9b49a"]], material: "Viscose", style: "Summer" },
  { name: "Tailored Wool Suit Jacket", brand: 1, category: "clothing", gender: "men", price: 42500, photo: 26, colours: [["Charcoal", "#33343a"], ["Navy", "#1d2637"]], material: "Wool", style: "Workwear", flags: ["featured"] },
  { name: "Slim Fit Chinos", brand: 0, category: "clothing", gender: "men", price: 17200, photo: 35, colours: [["Stone", "#b8ab98"], ["Navy", "#1d2637"], ["Black", "#161616"]], material: "Cotton twill", style: "Everyday", flags: ["trending"] },
  { name: "Straight Leg Denim Jeans", brand: 6, category: "jeans", gender: "men", price: 18500, compare: 23000, photo: 33, colours: [["Mid Blue", "#4a6b96"], ["Black", "#26262a"]], sizes: ["30", "31", "32", "33", "34", "36", "38"], material: "Denim", style: "Everyday" },
  { name: "Heavyweight Hoodie", brand: 7, category: "sportswear", gender: "men", price: 19500, photo: 28, colours: [["Black", "#161616"], ["Grey", "#8b8b8f"], ["Sand", "#c9b49a"]], material: "Cotton fleece", style: "Streetwear", flags: ["trending"] },
  { name: "Merino Half-Zip Knit", brand: 5, category: "knitwear", gender: "men", price: 24000, photo: 18, colours: [["Charcoal", "#33343a"], ["Camel", "#a9825b"]], material: "Merino wool", style: "Everyday" },
  { name: "Quilted Field Jacket", brand: 6, category: "outerwear", gender: "men", price: 35800, photo: 46, colours: [["Olive", "#5b6146"], ["Black", "#161616"]], material: "Cotton", style: "Streetwear", flags: ["newArrival"] },
  { name: "Training Tee", brand: 7, category: "sportswear", gender: "men", price: 7200, photo: 28, colours: [["Black", "#161616"], ["White", "#f7f6f3"]], material: "Performance mesh", style: "Sportswear" },
  { name: "Relaxed graphic Tee", brand: 8, category: "clothing", gender: "men", price: 8500, compare: 11000, photo: 28, colours: [["White", "#f7f6f3"], ["Black", "#161616"]], material: "Cotton jersey", style: "Streetwear" },

  { name: "Leather Ankle Boots", brand: 1, category: "shoes", gender: "women", price: 34500, compare: 42000, photo: 9, colours: [["Black", "#161616"], ["Cognac", "#8a542f"]], sizes: shoeSizes, material: "Leather", style: "Everyday", flags: ["featured"] },
  { name: "Minimal White Sneakers", brand: 3, category: "shoes", gender: "unisex", price: 22900, photo: 11, colours: [["White", "#f7f6f3"], ["Cream", "#ece4d6"]], sizes: shoeSizes, material: "Leather upper", style: "Everyday", flags: ["featured", "trending"] },
  { name: "Retro Runner Sneakers", brand: 7, category: "shoes", gender: "unisex", price: 26500, photo: 13, colours: [["Grey", "#8b8b8f"], ["Green", "#455e4a"]], sizes: shoeSizes, material: "Mesh & suede", style: "Sportswear", flags: ["newArrival"] },
  { name: "Pointed Toe Heels", brand: 2, category: "shoes", gender: "women", price: 27800, photo: 10, colours: [["Black", "#161616"], ["Nude", "#d6b49b"]], sizes: shoeSizes, material: "Leather", style: "Occasion" },
  { name: "Leather Loafers", brand: 1, category: "shoes", gender: "men", price: 29500, photo: 11, colours: [["Black", "#161616"], ["Brown", "#5b3a26"]], sizes: shoeSizes, material: "Leather", style: "Workwear" },
  { name: "Canvas High-Tops", brand: 3, category: "shoes", gender: "unisex", price: 16800, compare: 21000, photo: 13, colours: [["Black", "#161616"], ["Ecru", "#e8dfcf"]], sizes: shoeSizes, material: "Canvas", style: "Streetwear" },

  { name: "Structured Leather Tote", brand: 1, category: "bags", gender: "women", price: 38500, photo: 14, colours: [["Black", "#161616"], ["Tan", "#a46d3f"]], sizes: oneSize, material: "Leather", style: "Workwear", flags: ["featured"] },
  { name: "Quilted Shoulder Bag", brand: 2, category: "bags", gender: "women", price: 31500, compare: 39000, photo: 15, colours: [["Black", "#161616"], ["Cream", "#ece4d6"]], sizes: oneSize, material: "Leather", style: "Occasion", flags: ["trending"] },
  { name: "Mini Crossbody Bag", brand: 4, category: "bags", gender: "women", price: 18900, photo: 16, colours: [["Sand", "#c9b49a"], ["Black", "#161616"]], sizes: oneSize, material: "Leather", style: "Everyday", flags: ["newArrival"] },
  { name: "Canvas Weekender", brand: 6, category: "bags", gender: "unisex", price: 24500, photo: 14, colours: [["Olive", "#5b6146"], ["Navy", "#1d2637"]], sizes: oneSize, material: "Canvas", style: "Everyday" },

  { name: "Minimalist Watch", brand: 3, category: "accessories", gender: "unisex", price: 27500, compare: 34000, photo: 13, colours: [["Silver", "#c9ccd1"], ["Gold", "#c9a227"]], sizes: oneSize, material: "Stainless steel", style: "Everyday", flags: ["featured"] },
  { name: "Leather Belt", brand: 1, category: "accessories", gender: "unisex", price: 9800, photo: 15, colours: [["Black", "#161616"], ["Brown", "#5b3a26"]], sizes: ["S", "M", "L", "XL"], material: "Leather", style: "Everyday" },
  { name: "Silk Scarf", brand: 2, category: "accessories", gender: "women", price: 12500, photo: 23, colours: [["Print", "#b15c3a"], ["Navy", "#1d2637"]], sizes: oneSize, material: "Silk", style: "Occasion" },
  { name: "Metal Frame Sunglasses", brand: 8, category: "accessories", gender: "unisex", price: 14500, photo: 13, colours: [["Gold", "#c9a227"], ["Black", "#161616"]], sizes: oneSize, material: "Metal", style: "Summer", flags: ["newArrival"] },
  { name: "Cashmere Beanie", brand: 5, category: "accessories", gender: "unisex", price: 8900, photo: 18, colours: [["Grey", "#8b8b8f"], ["Camel", "#a9825b"]], sizes: oneSize, material: "Cashmere", style: "Everyday" },

  { name: "Hydrating Serum", brand: 9, category: "beauty", gender: "women", price: 8900, compare: 11500, photo: 50, colours: [["30ml", "#e8dfcf"]], sizes: oneSize, material: "Vegan formula", style: "Beauty", flags: ["newArrival"] },
  { name: "Matte Lip Colour", brand: 9, category: "beauty", gender: "women", price: 6200, photo: 50, colours: [["Rose", "#b4666a"], ["Berry", "#7a3446"]], sizes: oneSize, material: "Cruelty-free", style: "Beauty" },
  { name: "Eau de Parfum", brand: 2, category: "beauty", gender: "unisex", price: 32000, photo: 50, colours: [["50ml", "#d8c7a8"]], sizes: oneSize, material: "Fragrance", style: "Beauty", flags: ["featured"] },
];

function buildProducts(categories: Category[], brands: Brand[]): Product[] {
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const brandById = new Map(brands.map((b, i) => [i, b]));

  return productSeeds.map((seed, index) => {
    const category = categoryBySlug.get(seed.category) ?? categories[0];
    const brand = brandById.get(seed.brand) ?? brands[0];
    const sizes = seed.sizes ?? apparelSizes;
    const id = `p_${String(index + 1).padStart(3, "0")}`;
    const variants: ProductVariant[] = [];
    for (const [colour, hex] of seed.colours) {
      for (const size of sizes) {
        variants.push({
          id: `v_${String(index + 1).padStart(3, "0")}_${slugify(colour)}_${slugify(size)}`,
          productId: id,
          colour,
          hex,
          size,
          sku: `AUR-${String(index + 1).padStart(4, "0")}-${slugify(colour).slice(0, 3).toUpperCase()}-${slugify(size).toUpperCase()}`,
          price: seed.price,
          stock: (index * 7 + colour.length * 3 + size.length) % 17 + 2,
          lowStockThreshold: 3,
        });
      }
    }
    return {
      id,
      name: seed.name,
      slug: `${slugify(seed.name)}-${index + 1}`,
      description: `${seed.name} by ${brand.name}. Cut from considered ${seed.material.toLowerCase()} with an attention to detail that elevates the everyday. Designed in a relaxed silhouette that moves with you — a piece to return to season after season.`,
      brandId: brand.id,
      categoryId: category.id,
      price: seed.price,
      comparePrice: seed.compare ?? null,
      images: [
        img(photoIds[seed.photo]),
        img(photoIds[(seed.photo + 1) % photoIds.length]),
        img(photoIds[(seed.photo + 7) % photoIds.length]),
        img(photoIds[(seed.photo + 13) % photoIds.length]),
      ],
      colours: seed.colours.map(([name, hex]) => ({ name, hex })),
      sizes,
      material: seed.material,
      care: "Gentle machine wash at 30°C with similar colours. Do not bleach. Warm iron if needed. Line dry away from direct sunlight.",
      status: "published",
      featured: seed.flags?.includes("featured") ?? false,
      newArrival: seed.flags?.includes("newArrival") ?? false,
      trending: seed.flags?.includes("trending") ?? false,
      rating: seed.rating ?? Number((3.6 + ((index % 13) / 10)).toFixed(1)),
      reviewCount: 8 + ((index * 7) % 90),
      gender: seed.gender,
      style: seed.style,
      createdAt: daysAgo(index % 45),
      updatedAt: daysAgo(index % 12),
      variants,
      brand,
      category,
    };
  });
}

const reviewBodies = [
  "Beautiful quality and the fit is exactly as described. I've had so many compliments.",
  "Lovely material and arrived quickly. True to size — would happily order again.",
  "Great value for the price. The colour is even nicer in person than in the photos.",
  "Well made and looks premium. Slightly generous sizing, so size down if between sizes.",
  "One of my favourite purchases this year. The detailing is really thoughtful.",
];

function buildReviews(products: Product[]): Review[] {
  const names = ["Amara O.", "Kwesi B.", "Zoe M.", "Nana A.", "Elena R.", "Sofia K.", "Daniel T.", "Lerato P."];
  const reviews: Review[] = [];
  products.slice(0, 30).forEach((product, pi) => {
    const count = 2 + (pi % 3);
    for (let i = 0; i < count; i++) {
      reviews.push({
        id: `r_${pi}_${i}`,
        productId: product.id,
        userId: `sample_${i}`,
        userName: names[(pi + i) % names.length],
        orderId: `sample_order_${pi}`,
        rating: Math.min(5, Math.max(3, 3 + ((pi + i) % 3))),
        title: ["Excellent quality", "Love it", "Great fit", "Would recommend"][(pi + i) % 4],
        body: reviewBodies[(pi + i) % reviewBodies.length],
        images: [],
        status: "approved",
        verifiedPurchase: true,
        createdAt: daysAgo(3 + ((pi + i) % 60)),
      });
    }
  });
  return reviews;
}

export function createSeedData(): DemoStore {
  const categories: Category[] = categorySeeds.map((c, i) => ({
    id: `c_${String(i + 1).padStart(3, "0")}`,
    name: c.name,
    slug: slugify(c.name),
    description: c.description,
    image: c.image,
    parentId: c.parent ? `c_${String(categorySeeds.findIndex((x) => x.name === c.parent) + 1).padStart(3, "0")}` : null,
    order: c.order,
    active: true,
    gender: c.gender,
    createdAt: daysAgo(120 - i),
  }));

  const brands: Brand[] = brandNames.map((name, i) => ({
    id: `b_${String(i + 1).padStart(3, "0")}`,
    name,
    slug: slugify(name),
    description: `${name} — considered design, honest materials and a modern point of view.`,
    logo: "",
    active: true,
    createdAt: daysAgo(140 - i),
  }));

  const products = buildProducts(categories, brands);

  const users: DemoUser[] = [
    {
      id: "u_admin",
      email: "admin@aurelia.demo",
      name: "Store Administrator",
      phone: "+233 20 000 0000",
      roles: ["super_admin"] as Role[],
      emailVerified: true,
      createdAt: daysAgo(120),
      passwordHash: "demo$admin",
    },
    {
      id: "u_customer",
      email: "customer@aurelia.demo",
      name: "Demo Customer",
      phone: "+233 24 000 0000",
      roles: ["customer"] as Role[],
      emailVerified: true,
      createdAt: daysAgo(60),
      passwordHash: "demo$customer",
    },
  ];

  const coupons: Coupon[] = [
    {
      id: "coupon_welcome",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minOrder: 15000,
      usageLimit: 1000,
      usedCount: 124,
      startAt: daysAgo(90),
      endAt: new Date(now.getTime() + 90 * 86400000).toISOString(),
      active: true,
      firstOrderOnly: true,
      productIds: [],
      categoryIds: [],
    },
    {
      id: "coupon_summer",
      code: "SUMMER20",
      type: "percentage",
      value: 20,
      minOrder: 30000,
      usageLimit: 500,
      usedCount: 87,
      startAt: daysAgo(30),
      endAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
      active: true,
      firstOrderOnly: false,
      productIds: [],
      categoryIds: [],
    },
    {
      id: "coupon_save",
      code: "SAVE50",
      type: "fixed",
      value: 5000,
      minOrder: 40000,
      usageLimit: 200,
      usedCount: 33,
      startAt: daysAgo(15),
      endAt: new Date(now.getTime() + 45 * 86400000).toISOString(),
      active: true,
      firstOrderOnly: false,
      productIds: [],
      categoryIds: [],
    },
    {
      id: "coupon_freeship",
      code: "FREESHIP",
      type: "free_shipping",
      value: 0,
      minOrder: 0,
      usageLimit: 10000,
      usedCount: 219,
      startAt: daysAgo(200),
      endAt: new Date(now.getTime() + 200 * 86400000).toISOString(),
      active: true,
      firstOrderOnly: false,
      productIds: [],
      categoryIds: [],
    },
  ];

  const settings: StoreSettings = {
    storeName: "AURELIA",
    currency: "GHS",
    currencySymbol: "GH₵",
    freeShippingThreshold: 50000,
    standardShipping: 1500,
    expressShipping: 3500,
    taxRate: 0,
    announcement: "Complimentary delivery on orders over GH₵500 · New season collection now live",
    heroHeading: "A new language of style",
    heroSubheading: "Considered pieces, modern silhouettes and the quiet confidence of dressing well. Discover the season's edit.",
    heroImage: images.hero,
    heroImageMobile: images.heroMobile,
    heroCtaWomen: "Shop Women",
    heroCtaMen: "Shop Men",
    aboutText: "AURELIA is a modern fashion house built on a simple idea: great style should feel effortless. We create considered collections for real lives — elevated essentials, statement pieces and everything in between.",
    contactEmail: "hello@aurelia.example",
    contactPhone: "+233 20 000 0000",
    social: { instagram: "#", facebook: "#", tiktok: "#", x: "#" },
    paymentMethods: ["Paystack", "Visa", "Mastercard", "Mobile Money", "Stripe"],
    returnPolicy:
      "We accept returns within 14 days of delivery on unworn items with tags attached. Refunds are processed to the original payment method within 7 business days.",
    privacyPolicy:
      "We collect only the information needed to fulfil your order and improve your experience. We never sell your personal data. Data is stored securely with Appwrite.",
    terms:
      "By using this store you agree to our terms of service. All prices are shown in Ghana Cedis (GHS). Orders are subject to availability and stock confirmation.",
  };

  const shippingRules: ShippingRule[] = [
    { id: "ship_gh", country: "Ghana", region: "All", standardPrice: 1500, expressPrice: 3500, freeShippingThreshold: 50000, estimatedDays: "2–5 business days" },
    { id: "ship_wa", country: "West Africa", region: "All", standardPrice: 4500, expressPrice: 8500, freeShippingThreshold: 120000, estimatedDays: "5–9 business days" },
    { id: "ship_intl", country: "International", region: "All", standardPrice: 9500, expressPrice: 17500, freeShippingThreshold: 250000, estimatedDays: "7–14 business days" },
  ];

  const content: Record<string, unknown> = {
    editorial: {
      eyebrow: "The Edit",
      title: "Stories in fabric",
      body: "A study in texture, silhouette and the art of getting dressed. This season, we explore pieces that feel as good as they look.",
      image: images.editorial,
      cta: "Explore the collection",
      href: "/new-arrivals",
    },
    campaigns: [
      { title: "Summer Collection", subtitle: "Light layers, endless days", image: img(photoIds[39], 900), href: "/women/clothing", theme: "warm" },
      { title: "Workwear", subtitle: "Considered for the everyday", image: img(photoIds[22], 900), href: "/women/clothing", theme: "neutral" },
      { title: "Partywear", subtitle: "Made for the moment", image: img(photoIds[44], 900), href: "/women/dresses", theme: "dark" },
      { title: "Streetwear", subtitle: "Off-duty, on point", image: img(photoIds[27], 900), href: "/men/clothing", theme: "cool" },
    ],
  };

  return {
    users,
    sessions: {},
    categories,
    brands,
    products,
    reviews: buildReviews(products),
    orders: [],
    addresses: [],
    wishlists: {},
    coupons,
    newsletter: [],
    settings,
    content,
    audit: [],
    inventory: [],
    webhooks: [],
    shippingRules,
  };
}
