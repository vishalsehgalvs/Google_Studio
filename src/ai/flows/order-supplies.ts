'use server';

/**
 * @fileOverview Finds suppliers for agricultural products.
 *
 * - orderSupplies - A function that finds suppliers for a given product.
 * - OrderSuppliesInput - The input type for the orderSupplies function.
 * - OrderSuppliesOutput - The return type for the orderSupplies function.
 */

// ...existing code...
export type OrderSuppliesInput = {
  product: string;
};

export type OrderSuppliesOutput = {
  suppliers: { name: string; type: 'local' | 'online'; contact: string }[];
};

export async function orderSupplies(input: OrderSuppliesInput): Promise<OrderSuppliesOutput> {
  const res = await fetch('/api/order-supplies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  return res.json();
}
