-- Run once in the Supabase SQL Editor, or with `supabase db push`.
create table public.invitations (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 slug uuid not null unique default gen_random_uuid(),
 event_type text not null check (event_type in ('mariage','bar-mitsva')),
 theme text not null check (theme in ('azure','olivier','rose','minuit')),
 title text not null check (length(trim(title)) between 2 and 160),
 hosts text not null default '' check(length(hosts)<=160),
 event_date date not null,
 event_time text not null check(event_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 venue text not null check(length(trim(venue)) between 2 and 160),
 address text not null default '' check(length(address)<=350),
 reception_venue text not null default '' check(length(reception_venue)<=160),
 reception_address text not null default '' check(length(reception_address)<=350),
 reception_time text not null default '' check(reception_time = '' or reception_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 deadline date check(deadline<=event_date),
 message text not null default '' check(length(message)<=2000),
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create index invitations_owner_idx on public.invitations(owner_id);
create table public.rsvps (
 id uuid primary key default gen_random_uuid(),
 invitation_id uuid not null references public.invitations(id) on delete cascade,
 guest_token uuid not null,
 name text not null check(length(trim(name)) between 2 and 160),
 attending boolean not null,
 guests integer not null check(guests between 0 and 20),
 message text not null default '' check(length(message)<=1000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(invitation_id,guest_token),
 check ((attending and guests>=1) or (not attending and guests=0))
);
create index rsvps_invitation_idx on public.rsvps(invitation_id);
create index rsvps_rate_idx on public.rsvps(invitation_id,updated_at);
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;
revoke all on public.invitations, public.rsvps from anon, authenticated;
grant select,insert,update,delete on public.invitations to authenticated;
grant select on public.rsvps to authenticated;
create policy "owners manage invitations" on public.invitations for all to authenticated
 using (owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "owners read responses" on public.rsvps for select to authenticated using (
 exists(select 1 from public.invitations i where i.id=invitation_id and i.owner_id=(select auth.uid()))
);
-- Public access is restricted to a single random share link. No table browsing.
create or replace function public.get_public_invitation(p_slug uuid) returns jsonb
 language sql stable security definer set search_path='' as $$
 select to_jsonb(i)-'owner_id' from public.invitations i where i.slug=p_slug and i.published;
$$;
create or replace function public.submit_rsvp(p_slug uuid,p_guest_token uuid,p_name text,p_attending boolean,p_guests integer,p_message text default '')
 returns void language plpgsql security definer set search_path='' as $$
declare invitation public.invitations; existing public.rsvps; total_count integer; recent_count integer;
begin
 select * into invitation from public.invitations where slug=p_slug for update;
 if not found or not invitation.published then raise exception 'Invitation unavailable'; end if;
 if invitation.deadline is not null and invitation.deadline < (now() at time zone 'Europe/Paris')::date then raise exception 'Invitation closed'; end if;
 if p_guest_token is null or p_name is null or p_attending is null or p_guests is null or length(trim(p_name)) not between 2 and 160 or length(coalesce(p_message,''))>1000 or p_guests not between 0 and 20 or (p_attending and p_guests<1) or (not p_attending and p_guests<>0) then raise exception 'Invalid response'; end if;
 select * into existing from public.rsvps where invitation_id=invitation.id and guest_token=p_guest_token;
 if existing.id is not null and existing.updated_at > now()-interval '10 seconds' then raise exception 'Please wait before updating'; end if;
 select count(*),count(*) filter(where updated_at>now()-interval '1 minute') into total_count,recent_count from public.rsvps where invitation_id=invitation.id;
 if recent_count>=50 or (existing.id is null and total_count>=5000) then raise exception 'Response limit reached'; end if;
 insert into public.rsvps(invitation_id,guest_token,name,attending,guests,message)
 values(invitation.id,p_guest_token,trim(p_name),p_attending,p_guests,trim(coalesce(p_message,'')))
 on conflict(invitation_id,guest_token) do update set name=excluded.name,attending=excluded.attending,guests=excluded.guests,message=excluded.message,updated_at=now();
end;
$$;
revoke all on function public.get_public_invitation(uuid) from public;
revoke all on function public.submit_rsvp(uuid,uuid,text,boolean,integer,text) from public;
grant execute on function public.get_public_invitation(uuid) to anon,authenticated;
grant execute on function public.submit_rsvp(uuid,uuid,text,boolean,integer,text) to anon,authenticated;
