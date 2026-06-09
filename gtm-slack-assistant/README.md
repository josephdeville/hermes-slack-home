# GTM Slack Assistant

Daily role-aware Slack nudges for AE, CSM, BDR, and SE teams.

## Setup (5 steps)

### 1. Connect Slack
```bash
composio link slack
```
This opens a browser for OAuth. Authorize with your **Slack workspace admin account** so the bot can DM all users.

### 2. Add your team
Edit `gtm-assistant.ts` — find the `TEAM` array and add each person:
```ts
{ slackUserId: "U0123456789", name: "Alice", role: "AE", timezone: "America/New_York" },
```
**How to find Slack User IDs:** In Slack, click a user's name → View Profile → ⋮ More → Copy Member ID.

### 3. Test it
```bash
composio run -f gtm-assistant.ts -- test YOUR_SLACK_USER_ID
```

### 4. Schedule it
```bash
chmod +x schedule.sh && ./schedule.sh
```
This installs cron jobs: morning nudge at **8:30 AM** and evening wrap-up at **4:30 PM**, Mon–Fri.

### 5. Verify cron
```bash
crontab -l | grep gtm
```

## Customization

| Want to change | Where |
|---|---|
| Message content / bullets | `MORNING_BULLETS` in `gtm-assistant.ts` |
| Role themes | `MORNING_THEMES` |
| Send times | `schedule.sh` (cron syntax) |
| Add a new role | Add to `Role` type + all three maps |
| Pull team from Salesforce | Replace `TEAM` array with a Composio `SALESFORCE_*` call |

## Roles

| Role | Focus Area |
|---|---|
| **AE** | Deal progression, forecasting, pipeline hygiene |
| **CSM** | Health checks, renewals, expansion |
| **BDR** | Prospecting, qualification, meeting setting |
| **SE** | Demo prep, technical discovery, documentation |
