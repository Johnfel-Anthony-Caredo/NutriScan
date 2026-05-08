/**
 * Normalized product types for Open Food Facts search and barcode results.
 *
 * Used by manual search, barcode scan, and scan result screens.
 */

/** A product result from Open Food Facts search */
export interface SearchProduct {
  /** Unique identifier (barcode) */
  id: string;
  /** Product name */
  productName: string;
  /** Brand name */
  brand?: string;
  /** Barcode number */
  barcode: string;
  /** Front image URL */
  imageUrl?: string;
  /** Nutri-Score grade (a to e) */
  nutriscoreGrade?: string;
  /** Quantity text (e.g. "500g", "1L") */
  quantity?: string;
  /** Per-100g nutrients keyed by our internal names */
  nutrients: Record<string, number>;
  /** Ingredients text */
  ingredients?: string;
  /** Serving size text */
  servingSize?: string;
}
