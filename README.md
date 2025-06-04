:)
To add more viewers:

Simply add their Telegram chat IDs to the VIEWERS array in CHAT_IDS
Each viewer will receive order notifications and status updates but won't have buttons to modify orders
Only the main admin (ADMIN chat ID) will receive interactive buttons to update order statuses
To get a viewer's chat ID:

Ask them to start a chat with your bot
Open this URL in a browser: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
Look for the chat.id value in the response
Add that ID to the VIEWERS a