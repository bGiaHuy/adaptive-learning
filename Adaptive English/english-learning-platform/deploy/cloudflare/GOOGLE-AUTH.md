# Google sign-in

The integration uses Google's official `google-auth-library`, the authorization-code flow, PKCE S256, independent state and nonce, one-use state records with a ten-minute expiry, and the existing hashed session system. It requests only `openid email profile`. No Google access or refresh tokens are persisted. Private keys and client secrets never go to the browser.

The production database migration adds only `GoogleAccount` and `GoogleOAuthState`; it does not change passwords, roles, existing user records, submissions, or assignments. The Google subject is the durable identity key. Matching email alone does not grant access to an existing account. Existing users sign in with their current password, open student or teacher Settings, and choose **Liên kết Google** using the same email. The linking POST requires the canonical Origin and the original authenticated session at callback. New users can choose student or teacher from registration; an admin role cannot be requested through Google signup. Existing roles are retained.

## Current activation

Activated 2026-11-10 in Worker version `7b84648b-b99a-4632-8011-71363795a21a`, instance `english-google-20261110-v1`. Server secrets were streamed from the protected user-provided Web JSON with no credential copy or secret output. The public status is enabled. Desktop/mobile live browser checks reach Google's account page. Real consent and final application login are awaiting verification.

The app requests only `openid email profile`. Google exempts these basic identity scopes and Sign in with Google from the Testing test-user allowlist; see [Manage App Audience](https://support.google.com/cloud/answer/15549945?hl=en). The user allowed skipping unnecessary tester registration. No tester or publishing-mode changes were performed. Review the allowlist requirement again if scopes expand.

## Configure or rotate

A Google OAuth **Web application** client owned/configured for this application is required. CLI authentication for Gmail, Drive, or a Google Cloud SDK is not a website OAuth client. A credential found in another application was not silently repurposed.

Google Cloud Console → Google Auth Platform → Clients:

The dedicated project `adaptive-english-auth-20261110` (Adaptive English, project number `147216151895`) was created and verified ACTIVE through the authenticated gcloud CLI on 2026-11-10 Asia/Saigon. Open [its Google Auth Platform](https://console.cloud.google.com/auth/overview?project=adaptive-english-auth-20261110) to configure branding/audience, then [create its Web client](https://console.cloud.google.com/auth/clients?project=adaptive-english-auth-20261110). Creating the project does not create an OAuth client or enable sign-in. Google's `gcloud iam oauth-clients` commands serve Workforce Identity Federation, not standard Google sign-in; see [Google's distinction](https://docs.cloud.google.com/iam/docs/workforce-manage-oauth-app).

- Authorized redirect URI: `https://adaptive-english.adaptive-learning-c3.workers.dev/api/auth/google/callback`
- Configure the consent screen for this app and its intended audience. For a testing consent screen, add the intended testers; publish the app as appropriate for public access.
- Save the downloaded Web client JSON locally. Keep it out of Git and chat.

From `english-learning-platform/`:

```powershell
node scripts/activate-google-auth.cjs 'C:/path/to/protected-google-web-client.json'
# Use a fresh instance key so the container starts with the newly configured runtime secrets.
wrangler deploy --config deploy/cloudflare/wrangler.jsonc --containers-rollout none --var APP_INSTANCE_KEY:english-google-enabled-v2
```

Use activate-google-auth.cjs for protected Web JSON: it streams credentials directly to Wrangler without writing a second credential file. The legacy configure-google-auth.cjs helper writes a local intermediate file and is not needed for this workflow. `/api/auth/google/status` returns only availability and the current user's linked status. Google buttons appear on login/registration and Settings when credentials are configured.

For a clean deployment preparation, run `node scripts/cloudflare-prepare.cjs`, then `node scripts/cloudflare-google-overlay.cjs`, and install `google-auth-library@10` in `.artifacts/cloudflare-build/app`. The overlay copies only the new auth files and inserts the new UI into the saved live release, preserving the release's existing registration behavior. Generate the source manifest again when preparing a new release; the old migration manifest describes the pre-Google source.

## Validation limits

Security tests use an isolated empty SQLite database and a mocked Google token exchange; no real Google account or production user is logged in during automated testing. They cover state/PKCE/nonce, forged/expired/replayed callbacks, verification failure, new-user profiles, email takeover prevention, role preservation, same-session and same-email linking, cross-origin linking, and cancelled consent. A real Google consent/callback round trip remains necessary after the Web client is configured. No production user records are created by these tests.
