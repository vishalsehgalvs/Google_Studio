'use server';

/**
 * @fileOverview Finds suppliers for agricultural products.
 *
 * - orderSupplies - A function that finds suppliers for a given product.
 * - OrderSuppliesInput - The input type for the orderSupplies function.
 * - OrderSuppliesOutput - The return type for the orderSupplies function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findSuppliersTool } from '../tools/ecommerce';

const OrderSuppliesInputSchema = z.object({
    product: z.string().describe('The agricultural product to find suppliers for (e.g., seeds, fertilizer).'),
});
export type OrderSuppliesInput = z.infer<typeof OrderSuppliesInputSchema>;

const SupplierSchema = z.object({
    name: z.string().describe('The name of the supplier.'),
    type: z.enum(['local', 'online']).describe('The type of the supplier.'),
    contact: z.string().describe('Contact information (e.g., phone number, website).'),
});

const OrderSuppliesOutputSchema = z.object({
    suppliers: z.array(SupplierSchema).describe('A list of potential suppliers for the product.'),
});
export type OrderSuppliesOutput = z.infer<typeof OrderSuppliesOutputSchema>;

export async function orderSupplies(input: OrderSuppliesInput): Promise<OrderSuppliesOutput> {
  return orderSuppliesFlow(input);
}

const orderSuppliesFlow = ai.defineFlow(
  {
    name: 'orderSuppliesFlow',
    inputSchema: OrderSuppliesInputSchema,
    outputSchema: OrderSuppliesOutputSchema,
  },
  async (input) => {
    // In a more complex scenario, an LLM could decide which tool to call.
    // Here, we directly call the tool since the user's intent is clear.
    const suppliers = await findSuppliersTool(input);

    return {
        suppliers,
    };
  }
);
