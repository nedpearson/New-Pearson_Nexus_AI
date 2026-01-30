# Data Model (minimal, scalable)

## Core
- User(id, email, name, view_mode)
- Organization(id, name, plan_id, created_at)
- Membership(user_id, org_id, role)

## Subscription
- Plan(id, key, name)
- Feature(id, key)
- PlanFeature(plan_id, feature_id)
- PlanLimits(plan_id, limits_json)
- AddOn(id, key, name)
- AddOnFeature(addon_id, feature_id)
- OrganizationSubscription(org_id, plan_id, addons_json, status)
- UsageCounter(org_id, counters_json)

## Documents (proof)
- Document(id, org_id, title, type, date, tags[], category, subcategory, summary, status)
- DocumentLink(id, org_id, document_id, target_type, target_id, label)

## Financial
- Bill(id, org_id, name, payee, amount, due_date, frequency, status, payment_url)
- Transaction(id, org_id, date, description, amount, category)
- AssetLiability(id, org_id, kind, name, value, last_updated)

## Legal
- LegalCase(id, org_id, type, status, notes, key_dates_json)
- CaseTask(id, case_id, title, due_date, status)
- CaseEvent(id, case_id, start_at, title, notes)

## Ops
- Task(id, org_id, title, due_date, status, priority)
- CalendarEvent(id, org_id, start_at, title, notes, links_json)

## Recommendations
- Recommendation(id, org_id, type, title, explanation, status, impact_json)

## Funding + Packets (later)
- Opportunity(id, org_id, title, program_type, deadline, status, submission_links_json, rationale, citations_json, assumptions_json, risk_flags_json)
- Template(id, org_id, type, schema_json, version)
- Packet(id, org_id, template_id, status, fields_json, evidence_json, version, exports_json)
