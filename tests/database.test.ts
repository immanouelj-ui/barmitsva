import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("database enforces owner isolation, published links, RSVP validation and deletion", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to authenticated;`,
    );
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/001_initial.sql", import.meta.url),
        "utf8",
      ),
    );
    const owner = crypto.randomUUID(),
      other = crypto.randomUUID(),
      id = crypto.randomUUID(),
      slug = crypto.randomUUID(),
      token = crypto.randomUUID();
    await db.query("insert into auth.users values ($1),($2)", [owner, other]);
    await db.query(
      `insert into public.invitations(id,owner_id,slug,event_type,theme,title,event_date,event_time,venue) values($1,$2,$3,'bar-mitsva','azure','David','2099-09-19','10:00','Synagogue')`,
      [id, owner, slug],
    );
    const upgrade = await readFile(
      new URL(
        "../supabase/migrations/002_celebration_model.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(upgrade);
    await db.exec(upgrade); // Existing projects can safely rerun this upgrade.
    assert.equal(
      (await db.query("select * from public.invitations")).rows.length,
      1,
    );
    await db.query(
      "update public.invitations set theme='celebration',photo_url='https://example.com/photo.jpg',kiddouch_time='12:30' where id=$1",
      [id],
    );
    await assert.rejects(
      db.query("update public.invitations set theme='unknown' where id=$1", [
        id,
      ]),
    );
    await assert.rejects(
      db.query(
        "update public.invitations set photo_url='javascript:alert(1)' where id=$1",
        [id],
      ),
    );
    await db.exec("set role anon");
    assert.equal(
      (
        await db.query<{ data: unknown }>(
          "select public.get_public_invitation($1) as data",
          [slug],
        )
      ).rows[0].data,
      null,
    );
    await assert.rejects(db.query("select * from public.invitations"));
    await assert.rejects(
      db.query("select public.submit_rsvp($1,$2,$3,true,2,$4)", [
        slug,
        token,
        "Famille Cohen",
        "Bonjour",
      ]),
    );
    await db.exec("reset role");
    await db.query("update public.invitations set published=true where id=$1", [
      id,
    ]);
    await db.exec("set role anon");
    const pub = (
      await db.query<{ data: Record<string, unknown> }>(
        "select public.get_public_invitation($1) as data",
        [slug],
      )
    ).rows[0].data;
    assert.equal(pub.title, "David");
    assert.equal(pub.owner_id, undefined);
    assert.equal(pub.theme, "celebration");
    assert.equal(pub.photo_url, "https://example.com/photo.jpg");
    assert.equal(pub.kiddouch_time, "12:30");
    await db.query("select public.submit_rsvp($1,$2,$3,true,2,$4)", [
      slug,
      token,
      "Famille Cohen",
      "Bonjour",
    ]);
    await assert.rejects(db.query("select * from public.rsvps"));
    await assert.rejects(
      db.query("select public.submit_rsvp($1,$2,$3,true,2,$4)", [
        slug,
        token,
        "Famille Cohen",
        "Trop vite",
      ]),
    );
    await assert.rejects(
      db.query("select public.submit_rsvp($1,$2,$3,false,2,$4)", [
        slug,
        crypto.randomUUID(),
        "Famille Cohen",
        "Invalide",
      ]),
    );
    await db.exec("reset role");
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      other,
    ]);
    assert.equal(
      (await db.query("select * from public.invitations")).rows.length,
      0,
    );
    assert.equal((await db.query("select * from public.rsvps")).rows.length, 0);
    await assert.rejects(
      db.query(
        `insert into public.invitations(owner_id,event_type,theme,title,event_date,event_time,venue) values($1,'mariage','rose','Test','2099-01-01','10:00','Paris')`,
        [owner],
      ),
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      owner,
    ]);
    assert.equal(
      (await db.query("select * from public.invitations")).rows.length,
      1,
    );
    assert.equal((await db.query("select * from public.rsvps")).rows.length, 1);
    await db.exec("reset role");
    await db.query(
      "update public.rsvps set updated_at=now()-interval '30 seconds' where invitation_id=$1",
      [id],
    );
    await db.exec("set role anon");
    await db.query("select public.submit_rsvp($1,$2,$3,false,0,$4)", [
      slug,
      token,
      "Famille Cohen",
      "Finalement absent",
    ]);
    await db.exec("reset role");
    const rows = await db.query<{ attending: boolean; guests: number }>(
      "select * from public.rsvps",
    );
    assert.equal(rows.rows.length, 1);
    assert.equal(rows.rows[0].guests, 0);
    await db.query(
      "update public.invitations set deadline='2000-01-01' where id=$1",
      [id],
    );
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select public.submit_rsvp($1,$2,$3,true,2,$4)", [
        slug,
        crypto.randomUUID(),
        "Famille Test",
        "Clôturé",
      ]),
    );
    await db.exec("reset role");
    await db.query("delete from public.invitations where id=$1", [id]);
    assert.equal((await db.query("select * from public.rsvps")).rows.length, 0);
  } finally {
    await db.close();
  }
});
