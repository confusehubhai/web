const StatusUpdates = {
    BOT_TOKEN: '8089538079:AAHjAwNrYYfm10o4pRj4qO8Y-6MMrP5Zr2o',
    lastUpdateId: 0,
    
    init() {
        this.startStatusCheckInterval();
        console.log('Status Updates initialized');
        
        // Add webhook setup
        this.setWebhook();
        
        // Test initial connection
        this.checkForStatusUpdates();
    },

    startStatusCheckInterval() {
        console.log('Starting status check interval...');
        // Check for status updates every 5 seconds (reduced from 10)
        setInterval(() => {
            this.checkForStatusUpdates();
        }, 5000);
    },

    async checkForStatusUpdates() {
        try {
            console.log('Checking for status updates...');
            const url = `https://api.telegram.org/bot${this.BOT_TOKEN}/getUpdates?offset=${this.lastUpdateId + 1}`;
            console.log('Fetching updates from:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            console.log('Received updates:', data);
            
            if (!response.ok) {
                throw new Error('Failed to fetch updates');
            }
            
            if (!data.ok || !data.result.length) {
                console.log('No new updates');
                return;
            }
            
            for (const update of data.result) {
                console.log('Processing update:', update);
                
                if (update.callback_query) {
                    const { data: callbackData, message } = update.callback_query;
                    console.log('Received callback query:', callbackData);
                    
                    const [action, orderId] = callbackData.split('_');
                    console.log('Action:', action, 'OrderId:', orderId);
                    
                    let newStatus;
                    switch (action) {
                        case 'confirm':
                            newStatus = 'Confirmed';
                            break;
                        case 'ship':
                            newStatus = 'Shipped';
                            break;
                        case 'deliver':
                            newStatus = 'Delivered';
                            break;
                        case 'cancel':
                            newStatus = 'Cancelled';
                            break;
                    }
                    
                    if (newStatus) {
                        console.log(`Attempting to update order ${orderId} to ${newStatus}`);
                        const updated = StorageUtil.updateOrderStatus(orderId, newStatus);
                        console.log('Order update success:', updated);
                        
                        if (updated) {
                            console.log('Sending status update to Telegram...');
                            await TelegramBot.sendStatusUpdate(orderId, newStatus);
                            
                            console.log('Refreshing orders display...');
                            this.refreshOrdersDisplay();
                            
                            console.log('Answering callback query...');
                            await this.answerCallbackQuery(
                                update.callback_query.id,
                                `Order ${orderId} status updated to ${newStatus}`
                            );
                        }
                    }
                }
                
                this.lastUpdateId = update.update_id;
                console.log('Updated lastUpdateId to:', this.lastUpdateId);
            }
        } catch (error) {
            console.error('Error checking status updates:', error);
        }
    },

    async setWebhook() {
        try {
            // Replace with your actual GitHub Pages URL
            const webhookUrl = 'https://confusedvirus.shop';
            const url = `https://api.telegram.org/bot${this.BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors'
            });
            
            const result = await response.json();
            console.log('Webhook setup result:', result);
            
            if (result.ok) {
                console.log('Webhook successfully set');
            } else {
                console.error('Failed to set webhook:', result.description);
            }
        } catch (error) {
            console.error('Error setting webhook:', error);
        }
    },

    async answerCallbackQuery(callbackQueryId, text) {
        try {
            console.log('Answering callback query:', callbackQueryId, text);
            const url = `https://api.telegram.org/bot${this.BOT_TOKEN}/answerCallbackQuery`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    callback_query_id: callbackQueryId,
                    text: text,
                    show_alert: true
                })
            });

            const data = await response.json();
            console.log('Answer callback response:', data);

            if (!response.ok) {
                throw new Error('Failed to answer callback query');
            }
        } catch (error) {
            console.error('Error answering callback query:', error);
        }
    },

    refreshOrdersDisplay() {
        if (window.location.pathname.includes('orders.html')) {
            console.log('Refreshing orders display');
            OrdersManager.loadOrders();
        } else {
            console.log('Not on orders page, skipping refresh');
        }
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing StatusUpdates...');
    StatusUpdates.init();
}); 
