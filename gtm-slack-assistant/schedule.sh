#!/bin/bash
# GTM Assistant Cron Scheduler
# Run this once to install the cron jobs for morning + evening messages.
#
# Morning: 8:30 AM Mon-Fri
# Evening: 4:30 PM Mon-Fri
#
# Uses Composio CLI to run the agent.

export PATH="$HOME/.composio:$PATH"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Remove any existing GTM assistant cron jobs
crontab -l 2>/dev/null | grep -v "gtm-assistant" > /tmp/gtm_crontab

# Add morning nudge (8:30 AM Mon-Fri)
echo "30 8 * * 1-5 export PATH=\"\$HOME/.composio:\$PATH\" && composio run -f \"$SCRIPT_DIR/gtm-assistant.ts\" -- morning >> \"$SCRIPT_DIR/gtm-assistant.log\" 2>&1" >> /tmp/gtm_crontab

# Add evening wrap-up (4:30 PM Mon-Fri)
echo "30 16 * * 1-5 export PATH=\"\$HOME/.composio:\$PATH\" && composio run -f \"$SCRIPT_DIR/gtm-assistant.ts\" -- evening >> \"$SCRIPT_DIR/gtm-assistant.log\" 2>&1" >> /tmp/gtm_crontab

crontab /tmp/gtm_crontab
echo "✓ Cron jobs installed:"
crontab -l | grep gtm-assistant
