<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep certificate file selection and validation in shared modules so registration and existing cook profiles use the same attachment rules.
- The Android app is a Capacitor wrapper (com.sabordehogar.app) that loads the published site URL configured in `server.url` of capacitor.config.json; do not bundle static web assets into the APK. If the published URL changes, update that one line and rebuild the APK. The signing keystore (sabor-de-hogar.keystore, alias sabordehogar) must stay unchanged for Play Store updates; a copy lives in Files.

- Use Cloud-owned cook profiles and participant-scoped service requests/messages; expose only safe cook summaries through the public catalog RPC, because local demo profiles cannot receive real requests.
- Mutate service status and compute quotes in database RPCs; allow one client review only after cook completion and client confirmation, so clients cannot forge service prices or star ratings.
- Keep certificate files private in an owner-scoped table and reuse shared selection/validation; public cook summaries may reveal attachment status only, never the document contents.
