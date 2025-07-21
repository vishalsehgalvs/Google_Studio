'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FindSuppliersInputSchema = z.object({
  product: z.string().describe('The agricultural product to find (e.g., Muriate of Potash, Cotton Seeds).'),
});

const SupplierSchema = z.object({
    name: z.string(),
    type: z.enum(['local', 'online']),
    contact: z.string(),
});

const FindSuppliersOutputSchema = z.array(SupplierSchema);


// Mock database of suppliers
const mockSuppliers = {
    fertilizer: [
        { name: 'Nagpur Agro Center', type: 'local', contact: 'Kisan Mandi, Nagpur' },
        { name: 'AgriIndiaMart.com', type: 'online', contact: 'www.agriindiamart.com' },
        { name: 'FarmNeeds Online Store', type: 'online', contact: 'www.farmneeds.com' },
    ],
    seeds: [
        { name: 'Maharashtra Seeds Corp', type: 'local', contact: 'Main Market Rd, Pune' },
        { name: 'SeedBasket Online', type: 'online', contact: 'www.seedbasket.com' },
        { name: 'KrishiDukaan', type: 'local', contact: 'Near APMC Market, Delhi' },
    ],
    default: [
        { name: 'General Agri Supplies', type: 'local', contact: 'Anytown, India' },
        { name: 'IndiaMart Agriculture', type: 'online', contact: 'agri.indiamart.com' },
    ]
};

export const findSuppliersTool = ai.defineTool(
  {
    name: 'findSuppliers',
    description: 'Finds local and online suppliers for a given agricultural product.',
    inputSchema: FindSuppliersInputSchema,
    outputSchema: FindSuppliersOutputSchema,
  },
  async (input) => {
    console.log(`Finding suppliers for ${input.product}`);
    const productLower = input.product.toLowerCase();

    if (productLower.includes('fertilizer') || productLower.includes('potash')) {
        return mockSuppliers.fertilizer;
    }
    if (productLower.includes('seed')) {
        return mockSuppliers.seeds;
    }
    
    return mockSuppliers.default;
  }
);
