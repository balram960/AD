export const CATEGORIES = [
  'Tops', 'Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Skirts',
  'Dresses', 'Jackets', 'Sweaters', 'Shoes', 'Bags', 'Accessories', 'Other',
];

export const STYLES = [
  'Casual', 'Formal', 'Business', 'Sporty', 'Bohemian',
  'Elegant', 'Streetwear', 'Vintage', 'Minimalist', 'Preppy',
];

export const SEASONS = ['Summer', 'Winter', 'Spring', 'Autumn', 'All-Season', 'Monsoon'];

export const OCCASIONS = [
  'Casual', 'Work', 'College', 'Party', 'Wedding', 'Formal',
  'Interview', 'Date', 'Travel', 'Sports', 'Beach', 'Festival',
];

export const COLORS = [
  'Black', 'White', 'Grey', 'Beige', 'Brown', 'Navy', 'Blue',
  'Light Blue', 'Green', 'Olive', 'Red', 'Burgundy', 'Pink', 'Rose',
  'Orange', 'Yellow', 'Purple', 'Lavender', 'Cream', 'Gold', 'Silver',
  'Multicolor', 'Print', 'Other',
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'UK 16', 'US 0', 'US 2', 'US 4', 'US 6', 'US 8', 'US 10', 'One Size'];

export const COLOR_HARMONY: Record<string, string[]> = {
  Black: ['White', 'Cream', 'Beige', 'Grey', 'Red', 'Gold', 'Silver'],
  White: ['Black', 'Navy', 'Grey', 'Blue', 'Beige', 'Pastel colors'],
  Grey: ['White', 'Black', 'Navy', 'Pink', 'Burgundy'],
  Beige: ['Brown', 'Olive', 'Navy', 'White', 'Cream'],
  Brown: ['Beige', 'Cream', 'Olive', 'Gold', 'Navy'],
  Navy: ['White', 'Beige', 'Grey', 'Light Blue', 'Gold'],
  Blue: ['White', 'Grey', 'Beige', 'Brown', 'Orange'],
  'Light Blue': ['Navy', 'White', 'Grey', 'Brown'],
  Green: ['Beige', 'Brown', 'White', 'Burgundy', 'Olive'],
  Olive: ['Beige', 'Brown', 'Orange', 'White', 'Cream'],
  Red: ['Black', 'White', 'Navy', 'Grey'],
  Burgundy: ['Grey', 'Beige', 'Black', 'White', 'Olive'],
  Pink: ['Grey', 'White', 'Black', 'Navy', 'Beige'],
  Rose: ['White', 'Grey', 'Black', 'Beige'],
  Orange: ['Navy', 'Brown', 'Black', 'White'],
  Yellow: ['Navy', 'Blue', 'White', 'Grey', 'Black'],
  Purple: ['Grey', 'White', 'Black', 'Lavender'],
  Lavender: ['White', 'Grey', 'Navy', 'Purple'],
  Cream: ['Brown', 'Beige', 'Navy', 'Olive', 'Black'],
  Gold: ['Black', 'Navy', 'Burgundy', 'White'],
  Silver: ['Black', 'White', 'Grey', 'Navy'],
};

export const CATEGORY_ROLES = {
  top: ['Tops', 'Shirts', 'T-Shirts', 'Sweaters'],
  bottom: ['Pants', 'Jeans', 'Skirts'],
  dress: ['Dresses'],
  outer: ['Jackets'],
  footwear: ['Shoes'],
  bag: ['Bags'],
  accessory: ['Accessories'],
};

export function getCategoryRole(category: string): string {
  for (const [role, cats] of Object.entries(CATEGORY_ROLES)) {
    if (cats.includes(category)) return role;
  }
  return 'other';
}
