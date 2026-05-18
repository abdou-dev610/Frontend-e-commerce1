import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  fullName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
