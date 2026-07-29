import mongoose from 'mongoose';

/*
 * PaymentTransaction Schema — Audit trail for all payment events
 * Logs subscription creations, renewals, cancellations, promo applications,
 * and admin activations/deactivations.
 */
const transactionSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:         { type: String, enum: [
    'subscription_created', 'subscription_renewed', 'subscription_canceled',
    'promo_applied', 'admin_activated', 'admin_deactivated'
  ], required: true },
  amount:       { type: Number, default: 0 },
  currency:     { type: String, default: 'INR' },
  cashfreeOrderId:        { type: String, default: '' },
  cashfreePaymentId:      { type: String, default: '' },
  cashfreeSubscriptionId: { type: String, default: '' },
  status:       { type: String, enum: ['success', 'failed', 'pending', 'refunded'], default: 'pending' },
  metadata:     { type: mongoose.Schema.Types.Mixed, default: {} },
  promoCode:    { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null }
}, { timestamps: true });

export default mongoose.model('PaymentTransaction', transactionSchema);
