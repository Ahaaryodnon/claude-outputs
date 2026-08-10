# FoodLens for Crohn's — Snap a photo, find your triggers

**Product design document** · v0.2 · August 2026

---

## 1. The idea in one paragraph

FoodLens helps people with Crohn's disease work out which foods actually trigger *their* symptoms. You photograph each meal — the app identifies the dish and breaks it into ingredients, including hidden ones (onion in the sauce, butter it was fried in). You log symptoms as they happen. Over weeks, the app correlates ingredients with symptoms — accounting for the 4–48 hour lag typical in IBD — and builds a personal trigger profile with evidence behind it. That evidence base is exportable for your gastroenterologist or dietitian, replacing the unreliable paper food diary they ask you to keep.

## 2. Why Crohn's needs a different design

Crohn's is not an allergy. There is no universal "unsafe ingredient" list — triggers are highly individual, evidence for most food-symptom links is personal rather than clinical, and what you tolerate changes between **remission and flare**. That drives four design principles:

1. **Correlation over classification.** The app's job is not to declare food safe/unsafe, but to gather evidence and surface patterns: "symptoms followed 7 of your last 9 meals containing onion."
2. **Symptoms are first-class data**, logged as easily as meals — a food log without a symptom log is useless for IBD.
3. **Two modes, one profile.** A *flare mode* switches guidance to conservative low-residue defaults (as commonly advised clinically) while still logging everything; remission mode is exploratory.
4. **Clinician-grade export.** The end consumer of this data is often a gastro or dietitian appointment. Structured, honest data beats recall.

## 3. Who it's for

| Persona | Situation | What FoodLens does for them |
|---|---|---|
| **Newly diagnosed** | Overwhelmed, told to "keep a food diary" | Frictionless photo logging; education on common (not universal) trigger categories |
| **Trigger hunter** (remission) | Suspects onion/dairy/fried food but isn't sure | Correlation engine + guided elimination-and-reintroduce experiments |
| **Managing a flare** | Needs to eat conservatively for a period | Flare mode: low-residue guidance, flags high-risk ingredients (insoluble fibre, skins, seeds, fried/fatty) |
| **Pre-appointment** | Gastro visit in 2 weeks | One-tap PDF/CSV export: meals, ingredients, symptoms, correlations, weight trend |
| **Carer/parent** | Tracking for a child or partner with Crohn's | Scan-on-behalf-of profiles |

## 4. Core loop

```
┌─────────┐   ┌──────────────┐   ┌──────────────────┐   ┌──────────┐
│  Snap    │ → │ AI identifies │ → │ Ingredients with  │ → │   Log     │
│  meal    │   │ the dish      │   │ trigger-risk tags │   │   meal    │
└─────────┘   └──────────────┘   └──────────────────┘   └────┬─────┘
                                                              │
┌──────────────────┐   ┌───────────────────────┐   ┌─────────▼─────────┐
│ Personal trigger  │ ← │ Correlation engine     │ ← │  Log symptoms      │
│ profile updates   │   │ (4–48h lag windows)    │   │  as they happen    │
└──────────────────┘   └───────────────────────┘   └───────────────────┘
```

- **Meal logging** is photo-first (plus barcode for packaged food and quick-repeat for regular meals — friction kills food diaries).
- **Symptom logging** is a 10-second interaction: tap symptom type, severity, done. Types: abdominal pain, urgency, stool frequency + Bristol scale, blood, bloating, nausea, fatigue, joint pain. Optional daily check-in captures baseline wellness even on good days — no-symptom days are what make correlations meaningful.
- **The correlation engine** scores ingredient↔symptom links across configurable lag windows and only surfaces a pattern once there's enough signal (see §7).

## 5. Key features

### MVP (v1)
- 📸 **Photo → dish → ingredients** with three-tier confidence (visible / likely / possible) — hidden ingredients like onion, garlic, butter, and cooking fats matter enormously for IBD
- 🏷 **Trigger-category tagging** — every ingredient is tagged against IBD-relevant categories: insoluble fibre, high-fat/fried, dairy/lactose, high-FODMAP, spicy, caffeine, alcohol, carbonated, artificial sweeteners (sorbitol/mannitol), nuts/seeds/skins, red & processed meat
- 🩺 **Symptom diary** — fast structured logging + daily check-in
- 🔗 **Correlation insights** — "symptoms followed N of M meals containing X within 24h", with a confidence label and the meals as evidence
- 🔥 **Flare mode** — one toggle switches to conservative low-residue guidance and marks the period so flare data doesn't pollute remission correlations
- 👤 **Personal trigger profile** — each suspected trigger holds a status: `testing` → `suspected` → `confirmed` (user-promoted, evidence-linked), plus known-safe list
- 📤 **Clinician export** — PDF/CSV: meal log, symptom log, correlation summary, flare periods

### v2
- 🧪 **Guided reintroduction experiments** — pick a suspected trigger, the app plans a test window, prompts symptom checks at the right lags, and reports the result
- 💊 **Medication & context tracking** — log meds, stress, sleep, menstrual cycle as confounders the correlation engine can control for
- ⚖️ **Weight & hydration trends** — relevant markers during flares
- 🍽 **Menu mode** — photograph a restaurant menu, get per-dish risk against *your* trigger profile before ordering
- 👨‍👩‍👧 **Multi-profile** for carers

### v3
- 📈 Validated score integration (e.g. Harvey–Bradshaw style self-assessment trend)
- 🤝 Dietitian portal — share a live read-only view with your clinical team
- ⌚ Wearable signals (sleep, HRV) as additional confounders

## 6. Screens

1. **Today** — meals as cards with trigger tags, symptom entries interleaved on the same timeline, daily check-in prompt, flare-mode banner when active.
2. **Camera** — full-screen viewfinder; modes: Meal · Barcode · Repeat (recent meals).
3. **Analysing** — progressive reveal: dish name ~1s, ingredients stream in.
4. **Result** — dish + portion; risk summary against *your* profile ("contains 2 suspected triggers, 1 testing"); ingredients grouped by confidence tier, each with trigger-category chips; tap-to-edit; "Log meal".
5. **Log symptom** — grid of symptom types, severity slider, Bristol picker where relevant; under 10 seconds end-to-end.
6. **Insights** — correlation cards ranked by strength, each expandable to the underlying meals; "not enough data yet" states that tell you what to log next.
7. **Profile** — trigger list with status (confirmed/suspected/testing/safe), flare-mode toggle, export button, household profiles.

The interactive mockup in [`index.html`](./index.html) shows screens 1, 3, 4, 6 and 7.

## 7. Correlation engine (the core IP)

Deterministic and explainable — no black-box scoring, because users will make dietary decisions from this and clinicians will read it.

- **Windows:** for each symptom event, look back across lag windows (0–4h, 4–24h, 24–48h) at ingredients consumed.
- **Scoring:** for each ingredient (and each trigger *category*, since categories aggregate signal faster than single ingredients), compare symptom rate after exposure vs. after non-exposure days. A simple 2×2 association (exposed/not × symptoms/not) with a minimum-exposure threshold (e.g. ≥5 exposures) before anything is surfaced.
- **Confounders:** flare periods are excluded from remission correlations by default; v2 adds meds/stress/sleep as logged covariates shown alongside (not silently modelled).
- **Honest presentation:** every insight card shows the raw numbers ("7 of 9 exposures → symptoms within 24h; baseline 2 of 8 days") and a plain-language caveat. Status promotion to "confirmed" is always a user action, ideally after a guided reintroduction test.
- **What we never do:** diagnose, predict flares, or recommend eliminating whole food groups. Broad elimination without supervision risks malnutrition in Crohn's — the app repeatedly signposts dietitian involvement.

## 8. System architecture

```
┌─────────────── Mobile app (React Native / Expo) ───────────────┐
│ Camera · image compression · offline queue · SQLite cache       │
│ Symptom quick-log (works fully offline)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                Backend (Supabase + Edge Functions)               │
│ Auth · Postgres · Storage (photos) · /analyze · /correlate       │
│ /export (PDF/CSV generation)                                     │
└──────┬──────────────────────────────┬───────────────────────────┘
┌──────▼───────────────┐   ┌──────────▼──────────────────────────┐
│ Vision + reasoning    │   │ Nutrition & product data             │
│ Claude API (vision,   │   │ USDA FoodData Central · Open Food    │
│ structured output)    │   │ Facts · FODMAP/fibre reference table │
└──────────────────────┘   └─────────────────────────────────────┘
```

### AI pipeline (`/analyze`)

The vision call receives the image **plus the user's trigger profile and mode** (remission/flare), and returns structured JSON:

```json
{
  "dish": {"name": "Chicken pad thai", "cuisine": "Thai", "confidence": 0.91},
  "portion": {"estimate_g": 420},
  "ingredients": [
    {"name": "rice noodles", "tier": "visible", "categories": [], "est_g": 150},
    {"name": "crushed peanuts", "tier": "visible", "categories": ["nuts_seeds", "insoluble_fibre"], "est_g": 15},
    {"name": "chilli flakes", "tier": "visible", "categories": ["spicy"], "est_g": 2},
    {"name": "cooking oil (wok-fried)", "tier": "likely", "categories": ["high_fat_fried"], "est_g": 20},
    {"name": "garlic", "tier": "likely", "categories": ["high_fodmap"], "est_g": 5},
    {"name": "shallots", "tier": "likely", "categories": ["high_fodmap"], "est_g": 10},
    {"name": "fish sauce", "tier": "likely", "categories": [], "est_g": 10}
  ],
  "profile_matches": [
    {"ingredient": "garlic", "trigger": "onion/garlic (FODMAP)", "status": "suspected"},
    {"ingredient": "cooking oil (wok-fried)", "trigger": "fried/high-fat", "status": "confirmed"}
  ]
}
```

Prompting the model with the profile matters: told "user's confirmed trigger is fried food; suspected: onion/garlic", it actively reasons about cooking methods and hidden aromatics instead of only listing visible items. Trigger-category tagging is then **verified against a curated reference table** (FODMAP content, fibre type, lactose) server-side — the LLM proposes, the reference table disposes, and the correlation/verdict logic is deterministic code throughout.

### Data model (Postgres)

```
users(id, email, created_at)
profiles(id, user_id, name, mode)                           -- mode: remission|flare
triggers(id, profile_id, name, category, status, promoted_at) -- status: testing|suspected|confirmed|safe
flare_periods(id, profile_id, started_at, ended_at)
meals(id, profile_id, photo_url, dish_name, portion_g, eaten_at, mode_at_log)
meal_ingredients(id, meal_id, name, tier, est_g, categories text[], user_action)
symptoms(id, profile_id, kind, severity, bristol, noted_at, note)
checkins(id, profile_id, date, wellness, symptom_free bool)
correlations(id, profile_id, subject, subject_type, window_h,   -- materialised nightly
             exposures, symptomatic, baseline_days, baseline_symptomatic, updated_at)
experiments(id, profile_id, trigger_id, plan, started_at, outcome)  -- v2
```

## 9. Non-functional requirements

- **Latency:** dish name < 2s, full breakdown < 6s; symptom logging is instant and offline-capable.
- **Friction budget:** logging a repeat meal ≤ 3 taps; a symptom ≤ 3 taps. Diary apps die from friction — this is the top product risk.
- **Privacy:** this is health data in the fullest sense (symptoms including blood, bowel habits). Encrypted at rest, region-pinned storage, full GDPR export/delete, photos deletable while keeping the ingredient record, and no third-party analytics on health events.
- **Accessibility:** colour never the sole signal; large-text friendly; one-handed symptom logging (people log from the bathroom — design for it, don't be squeamish about it).
- **Cost:** one vision call per scan (~low single-digit cents); correlations computed in nightly batch, not per-request.

## 10. Boundaries and safety

- **Not a medical device**; no diagnosis, no flare prediction, no treatment advice. Clear onboarding disclaimer plus contextual signposting (e.g. blood logged repeatedly → "worth discussing with your IBD team soon" prompt, never urgency claims).
- **Anti-restriction guardrail:** if the profile accumulates many confirmed/suspected exclusions, the app surfaces a dietitian-referral nudge rather than celebrating restriction.
- **Evidence honesty:** correlation ≠ causation is stated on every insight card, with the guided reintroduction experiment (v2) offered as the way to firm it up.

## 11. MVP build estimate

| Phase | Scope | Effort |
|---|---|---|
| 1 | Expo shell, auth, trigger profile, camera, symptom quick-log | ~2 weeks |
| 2 | `/analyze` pipeline, reference-table verification, result screen | ~3 weeks |
| 3 | Timeline, flare mode, correlation engine + insights, export | ~3 weeks |
| 4 | Polish, accessibility, TestFlight beta with an IBD community group | ~1 week |

**Total: ~9 weeks to a testable MVP.** Beta with real Crohn's patients early — the friction budget and symptom-logging UX can only be validated by people who live with this.
