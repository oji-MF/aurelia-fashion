/**
 * Seeds Appwrite with AURELIA demo data: categories, brands, 40+ products with
 * variants, coupons, store settings and homepage content. Safe to re-run.
 */
import { Client, Databases, ID, Query } from "node-appwrite";
import { loadEnv } from "./env.mjs";

loadEnv();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "aurelia";
if (!projectId || !apiKey) {
  console.error("Missing Appwrite credentials. Copy .env.example to .env.local first.");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const db = new Databases(client);
const C = {
  products: process.env.APPWRITE_COLLECTION_PRODUCTS || "products",
  variants: process.env.APPWRITE_COLLECTION_VARIANTS || "product_variants",
  categories: process.env.APPWRITE_COLLECTION_CATEGORIES || "categories",
  brands: process.env.APPWRITE_COLLECTION_BRANDS || "brands",
  coupons: process.env.APPWRITE_COLLECTION_COUPONS || "coupons",
  settings: process.env.APPWRITE_COLLECTION_SETTINGS || "store_settings",
  content: process.env.APPWRITE_COLLECTION_CONTENT || "homepage_content",
  reviews: process.env.APPWRITE_COLLECTION_REVIEWS || "reviews",
};

const img = (id, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const photos = [
  "photo-1483985988355-763728e1935b", "photo-1490481651871-ab68de25d43d", "photo-1445205170230-053b83016050",
  "photo-1469334031218-e382a71b716b", "photo-1487222477894-8943e31ef7b2", "photo-1503342217505-b0a15ec3261c",
  "photo-1515886657613-9f3515b0c78f", "photo-1525507119028-ed4c629a60a3", "photo-1539109136881-3be0616acf4b",
  "photo-1542291026-7eec264c27ff", "photo-1549298916-b41d501d3772", "photo-1560769629-975ec94e6a86",
  "photo-1600185365483-26d7a4cc7519", "photo-1523275335684-37898b6baf30", "photo-1584917865442-de89df76afd3",
  "photo-1553062407-98eeb64c6a62", "photo-1547949003-9792a18a2601", "photo-1591047139829-d91aecb6caea",
  "photo-1551028719-00167b16eac5", "photo-1591369822096-ffd140ec948f", "photo-1515372039744-b8f02a3ae446",
  "photo-1572804013309-59a88b7e92f1", "photo-1566174053879-31528523f8ae", "photo-1509631179647-0177331693ae",
  "photo-1485231183945-fffde7ccf795", "photo-1475180098004-ca77a66827be", "photo-1516257984-b1b4d707412e",
  "photo-1617137968427-85924c800a22", "photo-1620799140408-edc6dcb6d633", "photo-1521572163474-6864f9cf17ab",
  "photo-1503341504253-dff4815485f1", "photo-1596755094514-f87e34085b2c", "photo-1542272604-787c3835535d",
  "photo-1541099649105-f69ad21f3246", "photo-1551232864-3f0890e580d9", "photo-1558769132-cb1aea458c5e",
  "photo-1489987707025-afc232f7ea0f", "photo-1434389677669-e08b4cac3105", "photo-1524250502761-1ac6f2e30d43",
  "photo-1534528741775-53994a69daeb", "photo-1496747611176-843222e1e57c", "photo-1581044777550-4cfa60707c03",
  "photo-1485968579580-b6d095142e6e", "photo-1550614000-4895a10e1bfd", "photo-1539008835657-9e8e9680c956",
  "photo-1583496661160-fb5886a13d27", "photo-1539533018447-63fcce2678e3", "photo-1544022613-e87ca75a784a",
  "photo-1529139574466-a303027c1d8b", "photo-1517836357463-d25dfeac3438", "photo-1596462502278-27bfdc403348",
];

const categories = [
  ["Women", "women", null, 0, "Considered collections for the modern woman."],
  ["Men", "men", null, 26, "Elevated staples and statement pieces for men."],
  ["Clothing", "unisex", "women", 35, "Everyday clothing, reimagined."],
  ["Dresses", "women", "women", 19, "Occasion and everyday dresses."],
  ["Tops", "women", "women", 28, "Blouses, shirts and knitwear."],
  ["Jeans", "unisex", "women", 32, "Denim in every fit and wash."],
  ["Shoes", "unisex", null, 10, "Footwear that carries you through the season."],
  ["Bags", "unisex", null, 14, "Bags designed to be lived in."],
  ["Accessories", "unisex", null, 13, "The finishing touches."],
  ["Sportswear", "unisex", null, 49, "Performance-led pieces for movement."],
  ["Beauty", "women", null, 50, "Beauty essentials and ritual."],
  ["Shirts", "men", "men", 30, "Shirts for every occasion."],
  ["Outerwear", "unisex", null, 46, "Layers for changing weather."],
  ["Knitwear", "unisex", null, 18, "Soft knits, considered construction."],
];
const categoryPhotos = {
  dresses: ["photo-1595777457583-95e059d581b8", "photo-1572804013309-59a88b7e92f1", "photo-1566174053879-31528523f8ae", "photo-1539008835657-9e8e9680c956"],
  tops: ["photo-1596755094514-f87e34085b2c", "photo-1503341504253-dff4815485f1", "photo-1620799140408-edc6dcb6d633", "photo-1521572163474-6864f9cf17ab"],
  jeans: ["photo-1542272604-787c3835535d", "photo-1541099649105-f69ad21f3246"],
  shoes: ["photo-1549298916-b41d501d3772", "photo-1542291026-7eec264c27ff", "photo-1560769629-975ec94e6a86", "photo-1600185365483-26d7a4cc7519"],
  bags: ["photo-1584917865442-de89df76afd3", "photo-1553062407-98eeb64c6a62", "photo-1547949003-9792a18a2601"],
  accessories: ["photo-1523275335684-37898b6baf30", "photo-1511499767150-a48a237f0083", "photo-1591047139829-d91aecb6caea"],
  outerwear: ["photo-1591047139829-d91aecb6caea", "photo-1539533018447-63fcce2678e3", "photo-1544022613-e87ca75a784a"],
  knitwear: ["photo-1576566588028-4147f3842f27", "photo-1434389677669-e08b4cac3105", "photo-1620799140408-edc6dcb6d633"],
  shirts: ["photo-1598033129183-c4f50c736f10", "photo-1503341504253-dff4815485f1", "photo-1620799140408-edc6dcb6d633"],
  sportswear: ["photo-1517836357463-d25dfeac3438", "photo-1571019613454-1cb2f99b2d8b"],
  beauty: ["photo-1596462502278-27bfdc403348", "photo-1522335789203-aabd1fc54bc9"],
  clothing: ["photo-1483985988355-763728e1935b", "photo-1490481651871-ab68de25d43d", "photo-1489987707025-afc232f7ea0f", "photo-1539109136881-3be0616acf4b"],
};
const brands = ["AURELIA", "NOIR ATELIER", "MAISON V", "STUDIO 84", "LUNE", "FORM & FIELD", "NORTHERN", "VERA", "KAIRO", "ÉLAN"];
const apparel = ["XS", "S", "M", "L", "XL"];
const shoes = ["36", "37", "38", "39", "40", "41", "42", "43"];
const one = ["One Size"];

// name, brand, category, gender, price, compare, photo, colours, sizes, material, style, flags
const products = [
  ["Sculpted Midi Dress", 0, "dresses", "women", 18900, 24500, 18, [["Black","#161616"],["Sand","#c9b49a"]], apparel, "Viscose blend", "Occasion", "featured,trending"],
  ["Fluid Satin Slip Dress", 2, "dresses", "women", 22500, 0, 20, [["Champagne","#d8c7a8"],["Emerald","#1f4d3a"]], apparel, "Satin", "Occasion", "new"],
  ["Pleated Midi Skirt", 4, "clothing", "women", 14200, 18000, 23, [["Navy","#1d2637"],["Cream","#ece4d6"]], apparel, "Polyester", "Workwear", ""],
  ["Tailored Blazer", 1, "clothing", "women", 31900, 0, 17, [["Charcoal","#33343a"],["Camel","#a9825b"]], apparel, "Wool blend", "Workwear", "featured"],
  ["Cropped Trench Coat", 0, "outerwear", "women", 34800, 0, 46, [["Stone","#b8ab98"],["Black","#161616"]], apparel, "Cotton", "Streetwear", "new,trending"],
  ["Ribbed Knit Cardigan", 5, "knitwear", "women", 16500, 0, 18, [["Oat","#d6c8b4"],["Rust","#a65338"]], apparel, "Merino wool", "Everyday", ""],
  ["Silk Blouse", 2, "tops", "women", 19800, 25000, 22, [["Ivory","#f2ece1"],["Sky","#9db9c9"]], apparel, "Silk", "Workwear", ""],
  ["Relaxed Cotton Shirt", 5, "tops", "women", 12900, 0, 29, [["White","#f7f6f3"],["Blue","#7e9ab1"]], apparel, "Cotton", "Everyday", "featured"],
  ["Wide-Leg Trousers", 1, "clothing", "women", 21400, 0, 35, [["Black","#161616"],["Taupe","#9b8b79"]], apparel, "Crepe", "Workwear", ""],
  ["High-Rise Straight Jeans", 6, "jeans", "women", 16900, 21000, 33, [["Indigo","#2f4270"],["Washed Black","#2a2a2c"]], ["24","25","26","27","28","29","30","31"], "Organic denim", "Everyday", "trending"],
  ["Denim Mini Skirt", 6, "jeans", "women", 11800, 0, 34, [["Light Wash","#8ba5c0"]], ["24","25","26","27","28","29"], "Denim", "Streetwear", ""],
  ["Linen Wrap Top", 4, "tops", "women", 11500, 0, 24, [["White","#f7f6f3"],["Olive","#6b6f4e"]], apparel, "Linen", "Summer", ""],
  ["Sequin Party Dress", 9, "dresses", "women", 38900, 48000, 44, [["Gold","#c9a227"],["Black","#161616"]], apparel, "Sequined mesh", "Partywear", "featured"],
  ["Belted Shirt Dress", 0, "dresses", "women", 24500, 0, 21, [["Navy","#1d2637"],["White","#f7f6f3"]], apparel, "Cotton", "Workwear", "new"],
  ["Cashmere Crew Knit", 5, "knitwear", "women", 28500, 0, 18, [["Camel","#a9825b"],["Grey","#8b8b8f"]], apparel, "Cashmere", "Everyday", "featured"],
  ["Pleated Maxi Dress", 2, "dresses", "women", 26500, 32000, 43, [["Terracotta","#b15c3a"],["Navy","#1d2637"]], apparel, "Chiffon", "Occasion", ""],
  ["Sports Luxe Leggings", 7, "sportswear", "women", 9800, 0, 49, [["Black","#161616"],["Stone","#b8ab98"]], ["XS","S","M","L"], "Recycled polyamide", "Sportswear", ""],
  ["Cropped Training Jacket", 7, "sportswear", "women", 14500, 0, 49, [["Black","#161616"]], apparel, "Technical shell", "Sportswear", ""],
  ["Slim Fit Oxford Shirt", 0, "shirts", "men", 15500, 0, 30, [["White","#f7f6f3"],["Sky","#9db9c9"],["Navy","#1d2637"]], apparel, "Cotton oxford", "Workwear", "featured,trending"],
  ["Relaxed Linen Shirt", 5, "shirts", "men", 17900, 22000, 31, [["Ecru","#e8dfcf"],["Sage","#88907a"]], apparel, "Linen", "Summer", "new"],
  ["Printed Resort Shirt", 8, "shirts", "men", 16500, 0, 30, [["Navy Print","#1d2637"],["Sand Print","#c9b49a"]], apparel, "Viscose", "Summer", ""],
  ["Tailored Wool Suit Jacket", 1, "clothing", "men", 42500, 0, 26, [["Charcoal","#33343a"],["Navy","#1d2637"]], apparel, "Wool", "Workwear", "featured"],
  ["Slim Fit Chinos", 0, "clothing", "men", 17200, 0, 35, [["Stone","#b8ab98"],["Navy","#1d2637"],["Black","#161616"]], apparel, "Cotton twill", "Everyday", "trending"],
  ["Straight Leg Denim Jeans", 6, "jeans", "men", 18500, 23000, 33, [["Mid Blue","#4a6b96"],["Black","#26262a"]], ["30","31","32","33","34","36","38"], "Denim", "Everyday", ""],
  ["Heavyweight Hoodie", 7, "sportswear", "men", 19500, 0, 28, [["Black","#161616"],["Grey","#8b8b8f"],["Sand","#c9b49a"]], apparel, "Cotton fleece", "Streetwear", "trending"],
  ["Merino Half-Zip Knit", 5, "knitwear", "men", 24000, 0, 18, [["Charcoal","#33343a"],["Camel","#a9825b"]], apparel, "Merino wool", "Everyday", ""],
  ["Quilted Field Jacket", 6, "outerwear", "men", 35800, 0, 46, [["Olive","#5b6146"],["Black","#161616"]], apparel, "Cotton", "Streetwear", "new"],
  ["Training Tee", 7, "sportswear", "men", 7200, 0, 28, [["Black","#161616"],["White","#f7f6f3"]], apparel, "Performance mesh", "Sportswear", ""],
  ["Relaxed Graphic Tee", 8, "clothing", "men", 8500, 11000, 28, [["White","#f7f6f3"],["Black","#161616"]], apparel, "Cotton jersey", "Streetwear", ""],
  ["Leather Ankle Boots", 1, "shoes", "women", 34500, 42000, 9, [["Black","#161616"],["Cognac","#8a542f"]], shoes, "Leather", "Everyday", "featured"],
  ["Minimal White Sneakers", 3, "shoes", "unisex", 22900, 0, 11, [["White","#f7f6f3"],["Cream","#ece4d6"]], shoes, "Leather upper", "Everyday", "featured,trending"],
  ["Retro Runner Sneakers", 7, "shoes", "unisex", 26500, 0, 13, [["Grey","#8b8b8f"],["Green","#455e4a"]], shoes, "Mesh & suede", "Sportswear", "new"],
  ["Pointed Toe Heels", 2, "shoes", "women", 27800, 0, 10, [["Black","#161616"],["Nude","#d6b49b"]], shoes, "Leather", "Occasion", ""],
  ["Leather Loafers", 1, "shoes", "men", 29500, 0, 11, [["Black","#161616"],["Brown","#5b3a26"]], shoes, "Leather", "Workwear", ""],
  ["Canvas High-Tops", 3, "shoes", "unisex", 16800, 21000, 13, [["Black","#161616"],["Ecru","#e8dfcf"]], shoes, "Canvas", "Streetwear", ""],
  ["Structured Leather Tote", 1, "bags", "women", 38500, 0, 14, [["Black","#161616"],["Tan","#a46d3f"]], one, "Leather", "Workwear", "featured"],
  ["Quilted Shoulder Bag", 2, "bags", "women", 31500, 39000, 15, [["Black","#161616"],["Cream","#ece4d6"]], one, "Leather", "Occasion", "trending"],
  ["Mini Crossbody Bag", 4, "bags", "women", 18900, 0, 16, [["Sand","#c9b49a"],["Black","#161616"]], one, "Leather", "Everyday", "new"],
  ["Canvas Weekender", 6, "bags", "unisex", 24500, 0, 14, [["Olive","#5b6146"],["Navy","#1d2637"]], one, "Canvas", "Everyday", ""],
  ["Minimalist Watch", 3, "accessories", "unisex", 27500, 34000, 13, [["Silver","#c9ccd1"],["Gold","#c9a227"]], one, "Stainless steel", "Everyday", "featured"],
  ["Leather Belt", 1, "accessories", "unisex", 9800, 0, 15, [["Black","#161616"],["Brown","#5b3a26"]], ["S","M","L","XL"], "Leather", "Everyday", ""],
  ["Silk Scarf", 2, "accessories", "women", 12500, 0, 23, [["Print","#b15c3a"],["Navy","#1d2637"]], one, "Silk", "Occasion", ""],
  ["Metal Frame Sunglasses", 8, "accessories", "unisex", 14500, 0, 13, [["Gold","#c9a227"],["Black","#161616"]], one, "Metal", "Summer", "new"],
  ["Cashmere Beanie", 5, "accessories", "unisex", 8900, 0, 18, [["Grey","#8b8b8f"],["Camel","#a9825b"]], one, "Cashmere", "Everyday", ""],
  ["Hydrating Serum", 9, "beauty", "women", 8900, 11500, 50, [["30ml","#e8dfcf"]], one, "Vegan formula", "Beauty", "new"],
  ["Matte Lip Colour", 9, "beauty", "women", 6200, 0, 50, [["Rose","#b4666a"],["Berry","#7a3446"]], one, "Cruelty-free", "Beauty", ""],
  ["Eau de Parfum", 2, "beauty", "unisex", 32000, 0, 50, [["50ml","#d8c7a8"]], one, "Fragrance", "Beauty", "featured"],
  ["Bias Cut Satin Dress", 2, "dresses", "women", 24900, 31000, 42, [["Champagne","#d8c7a8"],["Black","#161616"]], apparel, "Silk satin", "Occasion", "new,featured"],
  ["Longline Waistcoat", 1, "clothing", "women", 19800, 0, 17, [["Charcoal","#33343a"],["Sand","#c9b49a"]], apparel, "Wool blend", "Workwear", "trending"],
  ["Puff Sleeve Blouse", 4, "tops", "women", 13800, 0, 22, [["White","#f7f6f3"],["Blush","#d9a8a0"]], apparel, "Cotton", "Everyday", ""],
  ["Fine Rib Vest", 5, "knitwear", "women", 11800, 0, 18, [["Cream","#ece4d6"],["Black","#161616"]], apparel, "Ribbed cotton", "Everyday", ""],
  ["Pleated Wide Leg Trousers", 0, "clothing", "women", 23200, 0, 35, [["Navy","#1d2637"],["Stone","#b8ab98"]], apparel, "Crepe", "Workwear", "new"],
  ["Utility Cargo Trousers", 6, "clothing", "women", 17800, 0, 34, [["Khaki","#7c7a5c"],["Black","#161616"]], apparel, "Cotton twill", "Streetwear", ""],
  ["Washed Denim Jacket", 6, "outerwear", "women", 26500, 32000, 33, [["Light Wash","#8ba5c0"],["Dark Wash","#3d4d6b"]], apparel, "Denim", "Everyday", "trending"],
  ["Knit Midi Skirt", 5, "clothing", "women", 15600, 0, 23, [["Camel","#a9825b"],["Charcoal","#33343a"]], apparel, "Ribbed knit", "Everyday", ""],
  ["Off Shoulder Top", 9, "tops", "women", 12500, 0, 24, [["Black","#161616"],["White","#f7f6f3"]], apparel, "Jersey", "Partywear", ""],
  ["Floor Length Evening Gown", 9, "dresses", "women", 46500, 0, 43, [["Midnight","#1c2340"],["Burgundy","#6b2434"]], apparel, "Chiffon", "Occasion", "featured"],
  ["Tailored Shorts", 0, "clothing", "women", 13200, 0, 35, [["Sand","#c9b49a"],["Navy","#1d2637"]], apparel, "Linen blend", "Summer", ""],
  ["Cropped Denim Shirt", 6, "tops", "women", 14900, 0, 29, [["Mid Blue","#4a6b96"]], apparel, "Denim", "Streetwear", ""],
  ["Textured Knit Polo", 5, "knitwear", "men", 18500, 0, 30, [["Charcoal","#33343a"],["Ecru","#e8dfcf"]], apparel, "Textured cotton", "Summer", "new"],
  ["Relaxed Cotton Overshirt", 5, "outerwear", "men", 22500, 28000, 46, [["Olive","#5b6146"],["Navy","#1d2637"]], apparel, "Cotton twill", "Everyday", ""],
  ["Pleated Wool Trousers", 1, "clothing", "men", 24500, 0, 35, [["Charcoal","#33343a"]], apparel, "Wool", "Workwear", ""],
  ["Printed Casual Shirt", 8, "shirts", "men", 14500, 18000, 31, [["Floral","#9d6f78"],["Blue","#7e9ab1"]], apparel, "Viscose", "Summer", ""],
  ["Zip Through Track Jacket", 7, "sportswear", "men", 21000, 0, 49, [["Black","#161616"],["Grey","#8b8b8f"]], apparel, "Performance knit", "Sportswear", "new"],
  ["Suede Bomber Jacket", 1, "outerwear", "men", 39500, 0, 17, [["Cognac","#8a542f"],["Olive","#5b6146"]], apparel, "Suede", "Streetwear", "featured"],
  ["Cable Knit Sweater", 5, "knitwear", "men", 26500, 0, 18, [["Cream","#ece4d6"],["Navy","#1d2637"]], apparel, "Wool blend", "Everyday", ""],
  ["Suede Ankle Boots", 1, "shoes", "women", 32500, 0, 9, [["Tan","#a46d3f"],["Black","#161616"]], shoes, "Suede", "Everyday", "new"],
  ["Strappy Sandals", 2, "shoes", "women", 19500, 24500, 10, [["Nude","#d6b49b"],["Black","#161616"]], shoes, "Leather", "Summer", ""],
  ["Retro Court Sneakers", 3, "shoes", "unisex", 21500, 0, 11, [["White","#f7f6f3"],["Green","#455e4a"]], shoes, "Leather", "Everyday", "trending"],
  ["Chelsea Boots", 1, "shoes", "men", 35500, 42000, 9, [["Black","#161616"],["Brown","#5b3a26"]], shoes, "Leather", "Workwear", "featured"],
  ["Bucket Bag", 4, "bags", "women", 22500, 0, 16, [["Sand","#c9b49a"],["Black","#161616"]], one, "Leather", "Everyday", "new"],
  ["Structured Clutch", 2, "bags", "women", 17500, 0, 15, [["Black","#161616"],["Gold","#c9a227"]], one, "Leather", "Occasion", ""],
  ["Leather Backpack", 6, "bags", "unisex", 29500, 0, 14, [["Black","#161616"],["Tan","#a46d3f"]], one, "Leather", "Everyday", ""],
  ["Layered Gold Necklace", 3, "accessories", "women", 11500, 14500, 13, [["Gold","#c9a227"]], one, "Gold plated", "Everyday", "trending"],
  ["Leather Card Holder", 1, "accessories", "unisex", 8900, 0, 15, [["Black","#161616"],["Tan","#a46d3f"]], one, "Leather", "Everyday", ""],
  ["Woven Straw Hat", 4, "accessories", "women", 10500, 0, 39, [["Natural","#c9b49a"]], one, "Straw", "Summer", ""],
  ["Gradient Sunglasses", 8, "accessories", "unisex", 13500, 0, 13, [["Tortoise","#6b4a2f"],["Black","#161616"]], one, "Acetate", "Summer", "new"],
  ["Hydrating Face Cream", 9, "beauty", "women", 12500, 0, 50, [["50ml","#e8dfcf"]], one, "Vegan formula", "Beauty", ""],
  ["Everyday Body Lotion", 9, "beauty", "unisex", 7900, 0, 50, [["250ml","#e8dfcf"]], one, "Cruelty-free", "Beauty", ""],
];

async function upsert(collection, documentId, payload) {
  try {
    await db.getDocument(databaseId, collection, documentId);
    await db.updateDocument(databaseId, collection, documentId, payload);
    return "updated";
  } catch {
    await db.createDocument(databaseId, collection, documentId, payload);
    return "created";
  }
}

(async () => {
  console.log(`Seeding Appwrite — ${endpoint} / ${databaseId}`);
  const categoryIds = {};
  for (const [name, gender, parent, photo, description] of categories) {
    const id = `c_${slug(name).replace(/-/g, "_").slice(0, 30)}`;
    categoryIds[slug(name)] = id;
    await upsert(C.categories, id, { name, slug: slug(name), description, image: img(photos[photo], 800), parentId: parent ? categoryIds[parent] : null, order: categories.findIndex((c) => c[0] === name) + 1, active: true, gender });
  }
  console.log(`✓ ${categories.length} categories`);

  const brandIds = {};
  for (const name of brands) {
    const id = `b_${slug(name).replace(/-/g, "_").slice(0, 30)}`;
    brandIds[name] = id;
    await upsert(C.brands, id, { name, slug: slug(name), description: `${name} — considered design, honest materials and a modern point of view.`, logo: "", active: true });
  }
  console.log(`✓ ${brands.length} brands`);

  let count = 0;
  for (let i = 0; i < products.length; i++) {
    const [name, brand, category, gender, price, compare, photo, colours, sizes, material, style, flags] = products[i];
    const id = `p_${String(i + 1).padStart(3, "0")}`;
    const variants = colours.flatMap(([colour, hex]) => sizes.map((size, si) => ({
      id: `v_${String(i + 1).padStart(3, "0")}_${slug(colour).replace(/-/g, "_")}_${slug(size).replace(/-/g, "_")}`,
      productId: id, colour, hex, size,
      sku: `AUR-${String(i + 1).padStart(4, "0")}-${colour.slice(0, 3).toUpperCase()}-${size.toUpperCase()}`,
      price, stock: ((i * 7 + colour.length * 3 + si * 5) % 17) + 2, lowStockThreshold: 3,
    })));
    const pool = categoryPhotos[category] || categoryPhotos.clothing;
    const productImages = [0, 1, 2, 3].map((n) => img(pool[n % pool.length], 1000));
    const flagList = flags ? flags.split(",") : [];
    const payload = {
      name, slug: `${slug(name)}-${i + 1}`, description: `${name} by ${brands[brand]}. Cut from considered ${material.toLowerCase()} with an attention to detail that elevates the everyday. Designed in a relaxed silhouette that moves with you.`,
      brandId: brandIds[brands[brand]], categoryId: categoryIds[category], price, comparePrice: compare || null,
      images: JSON.stringify(productImages),
      colours: JSON.stringify(colours.map(([name, hex]) => ({ name, hex }))), sizes: JSON.stringify(sizes),
      variants: JSON.stringify(variants), material, care: "Gentle machine wash at 30°C with similar colours. Do not bleach. Warm iron if needed.",
      status: "published", featured: flagList.includes("featured"), newArrival: flagList.includes("new"),
      trending: flagList.includes("trending"), rating: Number((3.6 + (i % 13) / 10).toFixed(1)), reviewCount: 8 + ((i * 7) % 90),
      gender, style, searchTerms: `${name} ${brands[brand]} ${category} ${style}`.toLowerCase(),
    };
    await upsert(C.products, id, payload);
    for (const v of variants.slice(0, 30)) {
      const vId = v.id.replace(/[^a-zA-Z0-9_-]/g, "_");
      await upsert(C.variants, vId, v).catch(() => undefined);
    }
    count++;
  }
  console.log(`✓ ${count} products with variants`);

  const reviewBodies = [
    "Beautiful quality and the fit is exactly as described. I've had so many compliments.",
    "Lovely material and arrived quickly. True to size — would happily order again.",
    "Great value for the price. The colour is even nicer in person than in the photos.",
    "Well made and looks premium. Slightly generous sizing, so size down if between sizes.",
  ];
  const reviewers = ["Amara O.", "Kwesi B.", "Zoe M.", "Nana A.", "Elena R.", "Sofia K."];
  let reviewCount = 0;
  for (let i = 0; i < Math.min(products.length, 30); i++) {
    for (let r = 0; r < 2; r++) {
      const id = `r_${String(i + 1).padStart(3, "0")}_${r}`;
      await upsert(C.reviews, id, {
        productId: `p_${String(i + 1).padStart(3, "0")}`, userId: `sample_${r}`,
        userName: reviewers[(i + r) % reviewers.length], orderId: `sample_order_${i}`,
        rating: Math.min(5, 3 + ((i + r) % 3)), title: ["Excellent quality", "Love it", "Great fit"][(i + r) % 3],
        body: reviewBodies[(i + r) % reviewBodies.length], images: "[]", status: "approved", verifiedPurchase: true,
      });
      reviewCount++;
    }
  }
  console.log(`✓ ${reviewCount} reviews`);

  const coupons = [
    ["WELCOME10", "percentage", 10, 15000, 1000],
    ["SUMMER20", "percentage", 20, 30000, 500],
    ["SAVE50", "fixed", 5000, 40000, 200],
    ["FREESHIP", "free_shipping", 0, 0, 10000],
  ];
  for (const [code, type, value, minOrder, usageLimit] of coupons) {
    await upsert(C.coupons, `coupon_${slug(code)}`, { code, type, value, minOrder, usageLimit, usedCount: 0, startAt: new Date(Date.now() - 90 * 86400000).toISOString(), endAt: new Date(Date.now() + 90 * 86400000).toISOString(), active: true, firstOrderOnly: code === "WELCOME10", productIds: "[]", categoryIds: "[]" });
  }
  console.log(`✓ ${coupons.length} coupons`);

  await upsert(C.settings, "main", { key: "main", value: JSON.stringify({
    storeName: "AURELIA", currency: "GHS", currencySymbol: "GH₵", freeShippingThreshold: 50000,
    standardShipping: 1500, expressShipping: 3500, taxRate: 0,
    announcement: "Complimentary delivery on orders over GH₵500 · New season collection now live",
    heroHeading: "A new language of style",
    heroSubheading: "Considered pieces, modern silhouettes and the quiet confidence of dressing well.",
    heroImage: img("photo-1539109136881-3be0616acf4b", 1800), heroImageMobile: img(photos[3], 900),
    aboutText: "AURELIA is a modern fashion house built on a simple idea: great style should feel effortless.",
    contactEmail: "hello@aurelia.example", contactPhone: "+233 20 000 0000",
    social: { instagram: "#", facebook: "#", tiktok: "#", x: "#" },
    paymentMethods: ["Paystack", "Visa", "Mastercard", "Mobile Money", "Stripe"],
    returnPolicy: "Returns accepted within 14 days of delivery on unworn items with tags attached.",
    privacyPolicy: "We collect only the information needed to fulfil your order. We never sell your data.",
    terms: "All prices are shown in Ghana Cedis (GHS). Orders are subject to stock confirmation.",
  }) });

  await upsert(C.content, "home", { key: "home", value: JSON.stringify({
    editorial: { eyebrow: "The Edit", title: "Stories in fabric", body: "A study in texture, silhouette and the art of getting dressed.", image: img(photos[48], 1400), cta: "Explore the collection", href: "/new-arrivals" },
    campaigns: [
      { title: "Summer Collection", subtitle: "Light layers, endless days", image: img(photos[39], 900), href: "/women/clothing", theme: "warm" },
      { title: "Workwear", subtitle: "Considered for the everyday", image: img(photos[22], 900), href: "/women/clothing", theme: "neutral" },
      { title: "Partywear", subtitle: "Made for the moment", image: img(photos[44], 900), href: "/women/dresses", theme: "dark" },
      { title: "Streetwear", subtitle: "Off-duty, on point", image: img(photos[27], 900), href: "/men/clothing", theme: "cool" },
    ],
  }) });
  console.log("✓ Store settings and homepage content");
  console.log("\nSeed complete.");
})().catch((error) => { console.error("Seed failed:", error); process.exit(1); });
