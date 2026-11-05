-- Existing projects: run this migration after 001_initial.sql.
-- Safe to run again; no invitations or responses are removed.
begin;
alter table public.invitations drop constraint if exists invitations_theme_check;
alter table public.invitations add constraint invitations_theme_check
 check(theme in ('azure','olivier','rose','minuit','celebration'));
alter table public.invitations
 add column if not exists photo_url text not null default '' check(length(photo_url)<=2000 and (photo_url='' or photo_url ~ '^https://[^[:space:]]+$')),
 add column if not exists reception_photo_url text not null default '' check(length(reception_photo_url)<=2000 and (reception_photo_url='' or reception_photo_url ~ '^https://[^[:space:]]+$')),
 add column if not exists kiddouch_time text not null default '' check(kiddouch_time='' or kiddouch_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 add column if not exists entertainment_time text not null default '' check(entertainment_time='' or entertainment_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 add column if not exists dress_code text not null default '' check(length(dress_code)<=160);
commit;
