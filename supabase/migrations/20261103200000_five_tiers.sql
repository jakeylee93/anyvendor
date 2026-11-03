-- Five plan tiers (Jake, 3 Nov 2026): Listing £25, Website Plus £50, Marketing Plus £100,
-- Social Media Plus £150, AI Plus £350 a month, all inclusive of VAT. The old 'seo' tier
-- becomes 'marketing'; 'listing' and 'ai' are new. No subscriptions exist yet, so the rename is safe.
-- HELD: apply only with Jake's approval, after tenancy_hardening.

alter type public.plan_code rename value 'seo' to 'marketing';
alter type public.plan_code add value if not exists 'listing' before 'website';
alter type public.plan_code add value if not exists 'ai' after 'social';

-- Compared as text so the new enum values can be referenced inside the same transaction.
create or replace function public.plan_rank(p public.plan_code) returns int
language sql immutable as $$
  select case p::text when 'listing' then 1 when 'website' then 2 when 'marketing' then 3 when 'social' then 4 when 'ai' then 5 else 0 end
$$;

create or replace function public.has_module(p_business uuid, p_module text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select case p_module
    when 'listing' then public.plan_rank(public.active_plan(p_business)) >= 1
    when 'website' then public.plan_rank(public.active_plan(p_business)) >= 2
    when 'requests' then public.plan_rank(public.active_plan(p_business)) >= 2
    when 'seo' then public.plan_rank(public.active_plan(p_business)) >= 3
    when 'social' then public.plan_rank(public.active_plan(p_business)) >= 4
    when 'agent' then public.plan_rank(public.active_plan(p_business)) >= 5
    else false end
$$;
