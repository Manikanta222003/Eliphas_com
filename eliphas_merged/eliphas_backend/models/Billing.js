import mongoose from "mongoose";

const billingSchema = new mongoose.Schema({

  // ── Required up-front selectors ──────────────
  financialYear:    { type: String, required: true },   // e.g. "2024-25"
  companyLocation:  { type: String, required: true },   // selected before form opens

  // ── Client / Vehicle ─────────────────────────
  clientName:    { type: String, default: "" },
  companyName:   { type: String, default: "" },
  phoneNumber:   { type: String, default: "" },
  vehicleNumber: { type: String, default: "" },
  challanNumber: { type: String, default: "" },

  // ── Date / Time ───────────────────────────────
  date: { type: Date, default: Date.now },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString()
  },

  // ── Trip Details ──────────────────────────────
  loadType:     { type: String, default: "" },
  fromLocation: { type: String, default: "" },
  toLocation:   { type: String, default: "" },

  // ── Billing Basis (replaces billingType + billingBasis)
  // trip      → unit: days
  // contract  → unit: hours
  // per_ton   → unit: weight
  // machine   → unit: hours
  billingBasis: {
    type: String,
    enum: ["trip", "contract", "per_ton", "machine", ""],
    default: ""
  },

  // Unit value — interpreted according to billingBasis
  // trip=days, contract=hours, per_ton=weight(tons), machine=hours
  unitValue: { type: String, default: "" },

  // ── Fares ─────────────────────────────────────
  companyFare: { type: String, default: "" },
  clientFare:  { type: String, default: "" },

  // ── Diesel ────────────────────────────────────
  dieselQuantity:  { type: String, default: "" },   // litres used that day
  dieselPricePerLitre: { type: String, default: "" }, // price per litre

  // ── Meta ──────────────────────────────────────
  createdBy: { type: String, default: "" },
  role:      { type: String, default: "" }

}, { timestamps: true });

export default mongoose.model("Billing", billingSchema);
