# Reflective Report on the Inventory Management Simulation

> **Note:** This is a worked model answer. All specifics (rounds, figures, team events, ranking) are invented for illustration — swap them for your real numbers and experiences before submitting, or it won't survive a viva or Turnitin's AI checks.

---

## Introduction

This report reflects on my experience of a twelve-round inventory management simulation undertaken as part of the Operations and Supply Chain Management module. Working in a team of four, I acted as inventory manager for a single-product distribution business, with shared responsibility for weekly ordering decisions, forecasting, and safety stock policy. Each round represented one trading week, and our objective was to minimise total cost — the sum of ordering, holding, and stockout penalty costs — while maintaining an acceptable service level. This report uses Gibbs' (1988) Reflective Cycle to structure my reflection on what happened, how I responded, why our decisions produced the results they did, and what I will do differently in future.

## 1. Description — What happened?

The simulation ran over twelve rounds. Each week our team received a demand figure, decided an order quantity, and incurred three cost types: a fixed ordering cost of £50 per order placed, a holding cost of £1 per unit per week on closing stock, and a stockout penalty of £5 per unit of unmet demand. Orders arrived after a two-week lead time. Demand was stated to be "variable around a stable average" but no historical data was provided beyond the first three rounds.

Our decisions each round were the order quantity and, implicitly, our reorder point and safety stock. We began with a simple approach: order roughly what was sold in the previous round. In round 3 a demand spike of 240 units against our stock of 180 caused our first stockout. We reacted by doubling our order in round 4, which arrived in round 6 just as demand fell back to its average of around 160 units — leaving us holding over 300 units and paying heavy holding costs through rounds 6–8. From round 8 we changed strategy: we calculated a three-round moving average forecast, set a reorder point of average lead-time demand plus a safety buffer of 40 units, and ordered in consistent batches. Rounds 9–12 were our most stable and cheapest.

We finished with total costs of £4,120, a 91% service level, and ranked third of eight teams. The winning team's costs were £3,400; the theoretical optimum published afterwards was approximately £3,100.

## 2. Feelings — What were you thinking and feeling?

Going in, I felt quietly confident. I had understood EOQ and safety stock in lectures and assumed applying them would be straightforward. That confidence evaporated in round 3. The stockout was genuinely frustrating — not because of the penalty cost itself, but because I felt we should have seen it coming, and I was embarrassed to have argued the round before that our stock was "comfortable."

The over-ordering that followed was worse. Watching 300+ units sit on the shelf while holding costs accumulated felt like paying weekly for a single moment of panic. There was tension in the team at this point: one teammate wanted to slash orders to zero to burn down stock, while I argued for a steadier reduction. The time-limited rounds (five minutes each) made these disagreements sharper than they would otherwise have been.

By the end I felt something closer to earned confidence. Once we had a systematic policy, the rounds became calm — almost boring — and I realised that boring is what good inventory management feels like.

## 3. Evaluation — What was good and bad?

**What worked.** The recovery from round 8 onwards was the strongest part of our performance. Moving to a three-round average forecast smoothed out our reaction to noise, and adding an explicit safety stock figure meant our stockout protection was a deliberate decision rather than an accident of leftover inventory. Dividing roles also helped: one person tracked costs, one maintained the forecast, one recorded competitor-visible information, and I made the final ordering call, which stopped the five-minute rounds descending into chaos.

**What didn't.** Our first seven rounds were reactive. Forecasting from the single most recent round meant we amplified every fluctuation — ordering heavily after the spike and too little after quiet weeks. We also ignored the two-week lead time in early rounds, effectively ordering for a world that had already changed by the time stock arrived. And we had no shared decision rule at the start, so each round's order reflected whoever argued most persuasively rather than any policy.

Against benchmarks: third of eight is respectable, but the £1,020 gap to the theoretical optimum is almost entirely attributable to rounds 3–8. Our final four rounds ran within 8% of optimum cost, which suggests the late strategy was sound and the real failure was arriving at it so late.

## 4. Analysis — Why did it happen?

Our early failures map closely onto documented inventory management pathologies. The most obvious is the bullwhip effect. Lee, Padmanabhan and Whang (1997) identify demand signal processing — updating forecasts on the basis of the most recent order alone — as a primary driver of demand amplification along a supply chain. That is precisely what we did: by forecasting from a single round, we treated random variation as trend, and our order variability substantially exceeded actual demand variability. Croson and Donohue (2006) show experimentally that this behaviour persists even when participants can see inventory information, because decision-makers systematically under-weight the supply line — stock already ordered but not yet arrived. Our round 4 double-order, placed while a normal-sized order was already in transit, is a textbook instance of supply line under-weighting.

The lead time compounded this. With a two-week delay, our orders needed to cover demand over the protection interval, not the current week (Slack, Brandon-Jones and Burgess, 2022). Our early reorder logic ignored this entirely, which explains why the round 3 stockout was structurally likely rather than bad luck: our effective reorder point was below expected lead-time demand, giving us a service level well under 50% during any above-average fortnight.

Our recovery, conversely, worked because it aligned with theory. Setting safety stock explicitly reflects the newsvendor logic of balancing overage cost (holding, £1/unit/week) against underage cost (stockout, £5/unit): with underage five times overage, the optimal policy tolerates holding cost to protect service, justifying our 40-unit buffer (Chopra and Meindl, 2019). The moving-average forecast reduced forecast error variance, which directly reduces the safety stock needed for a given service level — the two changes reinforced each other. Batching orders into consistent quantities also spread the £50 fixed ordering cost efficiently, approximating EOQ behaviour: our late-game batches of ~200 units sit close to the EOQ implied by the simulation's cost parameters.

Finally, the team-process failure has a theoretical frame too. Without an agreed decision rule, our ordering was governed by judgemental forecasting under time pressure, which is known to over-react to recent, vivid events (the spike) and under-react to base rates (the stable average). Committing to a formula removed that bias — the improvement came less from the sophistication of the model than from the discipline of having one.

## 5. Conclusion — What did you learn?

The single biggest lesson is that in inventory management, a mediocre policy applied consistently beats good intuition applied reactively. Our costs were highest not when demand was hardest to predict, but when we were making each decision from scratch under pressure.

If I ran the simulation again, I would spend the first round building the decision rule rather than placing a clever order: agree the forecasting method, calculate a reorder point that accounts for lead time, and set safety stock from the cost ratio — then follow it, adjusting the parameters rather than overriding the policy.

Beyond the technical content, I learned something about how I make decisions under uncertainty: I am prone to over-correcting after a visible failure, and one dramatic event (the stockout) influenced my judgement more than seven weeks of stable data. I also developed genuine appreciation for structured team decision-making — the role division in later rounds was as valuable as any formula.

## 6. Action Plan — What will you do next time?

In future modules and placement work involving quantitative decisions, I will build a simple model — even a rough spreadsheet forecast — before committing to any decision, and I will explicitly write down what is "in the pipeline" so I stop under-weighting the supply line. In the next group simulation or project, I will propose agreeing a decision rule in the first session, before any pressure exists.

My personal development action: practise challenging emotionally-driven consensus when I hold data that contradicts it. In round 4 I suspected the double-order was an over-reaction but did not push back firmly. I will use upcoming group work to practise stating a data-based dissent clearly, once, before the group commits.

## References

Chopra, S. and Meindl, P. (2019) *Supply Chain Management: Strategy, Planning, and Operation*. 7th edn. Harlow: Pearson.

Croson, R. and Donohue, K. (2006) 'Behavioral causes of the bullwhip effect and the observed value of inventory information', *Management Science*, 52(3), pp. 323–336.

Gibbs, G. (1988) *Learning by Doing: A Guide to Teaching and Learning Methods*. Oxford: Further Education Unit, Oxford Polytechnic.

Lee, H.L., Padmanabhan, V. and Whang, S. (1997) 'Information distortion in a supply chain: the bullwhip effect', *Management Science*, 43(4), pp. 546–558.

Slack, N., Brandon-Jones, A. and Burgess, N. (2022) *Operations Management*. 10th edn. Harlow: Pearson.
