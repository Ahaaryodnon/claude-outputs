# FoodLens — Snap a photo, know what's on your plate

**Product design document** · v0.1 · August 2026

---

## 1. The idea in one paragraph

FoodLens is a mobile app for people who need to know what's *in* their food, not just how many calories it has. You point your camera at a meal — home-cooked, restaurant, or packaged — and the app identifies the dish, breaks it down into its likely ingredients, and immediately flags anything that conflicts with your dietary profile: allergens, intolerances, religious or ethical restrictions, or medical diets. Every meal is logged so you can spot patterns over time ("I feel bloated on days I eat X").

## 2. Who it's for

| Persona | Need | What FoodLens does for them |
|---|---|---|
| **Allergy sufferer** (nut, shellfish, egg…) | Avoid trace ingredients, especially when eating out | Red-flag alerts with confidence levels; "ask the kitchen" prompts for high-risk items |
| **Intolerance manager** (lactose, gluten, FODMAP) | Identify hidden triggers and correlate with symptoms | Ingredient-level logging + symptom diary + correlation insights |
| **Medical diet** (coeliac, diabetic, renal, low-sodium) | Stay within clinically prescribed limits | Per-ingredient nutrient estimates, daily budget tracking |
| **Lifestyle diet** (vegan, halal, kosher, keto) | Verify compliance quickly | Instant compliant / non-compliant / uncertain verdicts |
| **Parent / carer** | Check food for someone else's restrictions | Multiple profiles per account ("scanning for: Emma") |

## 3. Core user flow

```
┌─────────┐    ┌──────────────┐    ┌─────────────────┐    ┌───────────────┐    ┌────────┐
│  Snap    │ →  │ AI identifies │ →  │ Ingredient list  │ →  │ Dietary check  │ →  │  Log    │
│  photo   │    │ the dish      │    │ with confidence  │    │ vs. profile    │    │  meal   │
└─────────┘    └──────────────┘    └─────────────────┘    └───────────────┘    └────────┘
                                          ↑ user can edit / confirm each ingredient
```

1. **Snap** — camera-first UI. Also supports: photo library, barcode scan (packaged food), and menu-photo mode (scan a restaurant menu item description).
2. **Identify** — a vision model names the dish ("chicken pad thai") and estimates portion size from visual cues.
3. **Decompose** — the model lists likely ingredients *including hidden ones* (fish sauce, peanut oil, egg in the noodles), each with a confidence score: `visible` / `likely` / `possible`.
4. **Check** — ingredients are matched against the user's dietary profile. Verdicts: ✅ safe · ⚠️ uncertain (ask/verify) · ⛔ conflict.
5. **Log** — one tap saves the meal with time, ingredients, nutrients, and any flags. Optional symptom entry later links back to logged meals.

### The honesty principle (safety-critical)

A photo **cannot prove absence** of an allergen. FoodLens is designed to never say "this is safe" for severe allergies — it says "no conflicts *detected*" and, for high-severity profile items, always shows a persistent "verify with the kitchen/label" banner. Uncertainty is a first-class UI state, not fine print.

## 4. Key features

### MVP (v1)
- 📸 **Photo → dish → ingredients** with three-tier confidence (visible / likely / possible)
- 🚨 **Allergen & diet conflict alerts** against a personal dietary profile
- ✏️ **Tap-to-edit ingredient list** — corrections feed back to improve the model
- 📊 **Meal log** — timeline of meals with flags and basic nutrition (kcal, macros)
- 🏷 **Barcode fallback** for packaged foods (Open Food Facts lookup — exact label data)
- 👤 **Dietary profile** — allergens (with severity), intolerances, diets, disliked ingredients

### v2
- 🩺 **Symptom diary + correlation insights** ("bloating correlates with meals containing onion")
- 👨‍👩‍👧 **Multi-profile scanning** (scan on behalf of a family member)
- 🍽 **Menu mode** — photograph a restaurant menu, get per-dish risk ratings before ordering
- 🌍 **Cuisine priors** — location + restaurant type improves hidden-ingredient inference
- 📤 **Export for clinicians** — PDF/CSV food diary for dietitians and allergy clinics

### v3
- ⌚ Wearable/CGM integration (glucose response vs. logged ingredients)
- 🗣 Voice logging ("I had a flat white and a banana")
- 🤝 Restaurant partnerships — verified ingredient data replacing inference

## 5. Screens

1. **Home / Today** — today's meals as cards, running nutrient budget, streak, prominent scan button.
2. **Camera** — full-screen viewfinder, mode switch (Meal · Barcode · Menu), flash/library controls.
3. **Analysing** — photo with scanning shimmer; shows dish guess as soon as available (~1s), ingredients stream in.
4. **Result** — dish name + portion estimate; verdict banner (safe / caution / conflict); ingredient list grouped by confidence tier, each row showing allergen tags; edit affordances; "Log meal" CTA.
5. **Ingredient detail** — why it was inferred, typical nutrition, which profile rule it triggers, "not in my dish" removal.
6. **Log / History** — calendar + timeline, filter by flag ("show all meals containing dairy"), symptom entries interleaved.
7. **Insights** (v2) — correlation cards, weekly nutrient trends.
8. **Profile** — dietary profile editor with severity per allergen (anaphylaxis → always warn, even for "possible" traces), diets, nutrient budgets, family profiles.

The interactive mockup in [`index.html`](./index.html) shows screens 1, 3, 4, and 8.

## 6. System architecture

```
┌─────────────── Mobile app (React Native / Expo) ───────────────┐
│  Camera · local image compression · offline queue · SQLite cache │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (image upload + JSON)
┌────────────────────────────▼────────────────────────────────────┐
│                    Backend (Supabase + Edge Functions)           │
│  Auth · Postgres (profiles, meals, corrections) · Storage (photos)│
│  Edge Function: /analyze — orchestrates the AI pipeline          │
└──────┬──────────────────────────────┬───────────────────────────┘
       │                              │
┌──────▼───────────────┐   ┌──────────▼──────────────────────────┐
│  Vision + reasoning   │   │  Nutrition & product data            │
│  Claude API (vision)  │   │  USDA FoodData Central (nutrients)   │
│  structured output    │   │  Open Food Facts (barcodes/labels)   │
└──────────────────────┘   └─────────────────────────────────────┘
```

### AI pipeline (`/analyze` edge function)

1. **Pre-process** — resize/compress client-side (~1280px, ~200KB) for latency and cost.
2. **Single vision call** to Claude with the image + the user's dietary profile as context, requesting structured JSON:
   ```json
   {
     "dish": {"name": "Chicken pad thai", "cuisine": "Thai", "confidence": 0.91},
     "portion": {"estimate_g": 420, "basis": "standard restaurant plate"},
     "ingredients": [
       {"name": "rice noodles", "tier": "visible", "allergens": ["gluten? (check)"], "est_g": 150},
       {"name": "peanuts", "tier": "visible", "allergens": ["peanut"], "est_g": 15},
       {"name": "fish sauce", "tier": "likely", "allergens": ["fish"], "est_g": 10},
       {"name": "egg", "tier": "likely", "allergens": ["egg"], "est_g": 40},
       {"name": "shrimp paste", "tier": "possible", "allergens": ["shellfish"], "est_g": 5}
     ],
     "profile_conflicts": [
       {"ingredient": "peanuts", "rule": "peanut allergy (severe)", "verdict": "conflict"},
       {"ingredient": "fish sauce", "rule": "pescatarian-ok", "verdict": "safe"}
     ]
   }
   ```
   Passing the profile *into* the prompt matters: a model told "user has a severe peanut allergy; this looks like Thai food" will actively reason about peanut oil and cross-contamination rather than only listing what it sees.
3. **Nutrient enrichment** — map ingredients to FoodData Central entries server-side; multiply by estimated grams for kcal/macros. Estimates are labelled as estimates (±30% is normal for photo-based portioning).
4. **Verdict computation** — deterministic server-side rule engine (not the LLM) applies profile rules to the ingredient list. Severity `anaphylaxis` triggers a conflict on *any* tier including `possible`; milder rules can ignore `possible`. Safety logic stays auditable code, with the LLM as an input.
5. **Correction loop** — user edits (add/remove/confirm ingredients) are stored and used as few-shot examples for that user's frequent dishes, and aggregated (opt-in, anonymised) for model evaluation.

### Data model (Postgres)

```
users(id, email, created_at)
profiles(id, user_id, name, is_default)                    -- family support
profile_rules(id, profile_id, kind, value, severity)       -- kind: allergen|intolerance|diet|dislike|nutrient_budget
meals(id, user_id, profile_id, photo_url, dish_name, portion_g, eaten_at, verdict)
meal_ingredients(id, meal_id, name, tier, est_g, kcal, protein_g, carbs_g, fat_g,
                 allergens text[], user_action)            -- user_action: confirmed|added|removed|null
symptoms(id, user_id, kind, severity, noted_at)            -- v2
corrections(id, user_id, dish_name, ingredient, action, created_at)
```

## 7. Non-functional requirements

- **Latency**: dish name < 2s, full breakdown < 6s on 4G. Stream the response so the UI fills progressively.
- **Offline**: photos queue locally and analyse when connectivity returns; the log is readable offline.
- **Privacy**: photos are health-adjacent data. Encrypted at rest, user-deletable, never used for training without explicit opt-in. GDPR export/delete built in from day one.
- **Cost**: one vision call per scan; at ~1,500 tokens/scan this is low single-digit cents. Cache identical barcode lookups.
- **Accessibility**: verdicts communicated by icon + text + colour (never colour alone); VoiceOver labels on every ingredient row; large-text friendly.

## 8. What FoodLens is *not*

- Not a medical device and not marketed as one — prominent disclaimer at onboarding, and the "verify for severe allergies" banner is non-dismissable by design.
- Not a calorie-obsessed diet app — nutrition numbers are secondary to ingredient awareness; no shame mechanics.

## 9. MVP build estimate

| Phase | Scope | Effort |
|---|---|---|
| 1 | Expo app shell, auth, dietary profile, camera capture | ~2 weeks |
| 2 | `/analyze` pipeline + result screen + rule engine | ~3 weeks |
| 3 | Meal log, barcode mode, edit/correction loop | ~2 weeks |
| 4 | Polish, accessibility pass, TestFlight beta | ~1 week |

**Total: ~8 weeks to a testable MVP** with one developer plus design support.
