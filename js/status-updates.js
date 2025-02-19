const StatusUpdates = {
    BOT_TOKEN: '8089538079:AAHjAwNrYYfm10o4pRj4qO8Y-6MMrP5Zr2o',
    lastUpdateId: 0,
    pollingInterval: 5000, // 5 seconds
    
    async init() {
        // Add more comprehensive initialization
        if (!this.BOT_TOKEN) {
            console.error('❌ Bot token is missing!');
            return;
        }

        try {
            // Remove any existing webhook first
            await this.deleteWebhook();
            
            // Start continuous polling
            this.startPolling();
            console.log('✅ Status Updates initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Status Updates:', error);
        }
    },

    async startPolling() {
        console.log('🔄 Starting continuous polling...');
        // Start continuous polling without any interruptions
        setInterval(() => {
            this.checkForStatusUpdates();
        }, this.pollingInterval);
    },

    async checkForStatusUpdates() {
        try {
            console.log('🔍 Checking for status updates...');
            const url = `https://api.telegram.org/bot${this.BOT_TOKEN}/getUpdates?offset=${this.lastUpdateId + 1}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📬 Received updates:', JSON.stringify(data, null, 2));
            
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

                            // Save the last known status in local storage
                            localStorage.setItem(`order_${orderId}`, newStatus);
                        }
                    }
                }
                
                this.lastUpdateId = update.update_id;
                console.log('Updated lastUpdateId to:', this.lastUpdateId);
            }
        } catch (error) {
            console.error('🚨 Status update error:', error.message);
        }
    },

    async deleteWebhook() {
        try {
            console.log('🗑️ Removing existing webhook...');
            const deleteWebhookUrl = `https://api.telegram.org/bot${this.BOT_TOKEN}/deleteWebhook`;
            const response = await fetch(deleteWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.ok) {
                console.log('✅ Webhook successfully removed');
            } else {
                throw new Error(result.description || 'Unknown error');
            }
        } catch (error) {
            console.error('❌ Failed to delete webhook:', error);
            throw error; // Re-throw to handle in init
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
    console.log('🚀 Initializing StatusUpdates...');
    StatusUpdates.init();

    // Load last known statuses from local storage
    const orders = Object.keys(localStorage).filter(key => key.startsWith('order_'));
    orders.forEach(orderKey => {
        const orderId = orderKey.split('_')[1];
        const status = localStorage.getItem(orderKey);
        console.log(`Order ${orderId} last known status: ${status}`);
        // Update the UI accordingly if needed
    });
}); 
