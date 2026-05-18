import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(100),
  image: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Au moins un article requis'),
  totalAmount: z.number().positive('Montant total invalide'),
  paymentMethod: z.enum(['wave', 'orange_money', 'free_money', 'whatsapp', 'card']),
  customerName: z.string().min(2, 'Nom requis').max(100),
  customerEmail: z.string().email('Email invalide').optional(),
  customerPhone: z.string().min(8, 'Téléphone requis').max(20),
  deliveryAddress: z.string().max(300).optional(),
});
