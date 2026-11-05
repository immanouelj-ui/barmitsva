import test from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage } from "../lib/auth-messages";
test("email failures identify the required Supabase configuration", () => {
  assert.match(
    authErrorMessage({ code: "email_address_not_authorized" }),
    /SMTP/,
  );
  assert.match(
    authErrorMessage({ code: "over_email_send_rate_limit" }),
    /limite/i,
  );
  assert.match(
    authErrorMessage({ code: "email_not_confirmed" }),
    /pas encore confirmé/,
  );
  assert.match(authErrorMessage({ code: "signup_disabled" }), /désactivée/);
  assert.match(authErrorMessage({ status: 429 }), /Trop de tentatives/);
});
test("unknown provider messages and secrets are never reflected to the client", () => {
  assert.doesNotMatch(
    authErrorMessage({ message: "secret-provider-debug-value" }),
    /secret-provider/,
  );
  assert.match(authErrorMessage({ message: "Invalid API key" }), /clé API/);
});
