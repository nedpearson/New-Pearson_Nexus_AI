# System Overview (architecture boundaries)

Pearson Nexus AI is structured around a small number of stable domains:

1) **Identity & Tenancy**
- users, organizations, roles
- subscription: plan + add-ons
- feature gating + limits

2) **Proof Layer**
- documents
- document links to any domain object
- “View Proof” is mandatory on outputs

3) **Domains**
- Financial: bills, transactions, assets/liabilities, net worth
- Legal: cases, case tasks/events, evidence links
- Operations: tasks, calendar events
- Recommendations: cards with explanations + proof

4) **Growth Modules (gated)**
- Templates & Packets
- Funding Navigator
- Advisory workflows

5) **Admin Console**
- business metrics, marketing, policy updates, plan management

## Key invariant
**No domain feature is allowed to generate advice or a recommendation without proof links + a “why” explanation.**
