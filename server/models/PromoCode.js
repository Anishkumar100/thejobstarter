import mongoose from 'mongoose';

/*
 * PromoCode Schema — Discount/promo codes for subscription
 * Supports free months, percentage discounts, and fixed amount discounts.
 */
const promoSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true },
  type:        { type: String, enum: ['free_month', 'discount_percent', 'discount_fixed'], required: true },
  value:       { type: Number, required: true },  /* Percentage (for discount_percent) or INR amount (for discount_fixed) */
  maxUses:     { type: Number, default: null },    /* null = unlimited */
  usedCount:   { type: Number, default: 0 },
  expiresAt:   { type: Date, default: null },
  active:      { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('PromoCode', promoSchema);
