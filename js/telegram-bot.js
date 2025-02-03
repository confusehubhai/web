const TelegramBot = {
    BOT_TOKEN: '8089538079:AAHjAwNrYYfm10o4pRj4qO8Y-6MMrP5Zr2o', // Replace with your bot token
    CHAT_ID: '1299401914',     // Replace with your chat ID
    
    async sendOrderNotification(order) {
        console.log('Preparing to send order notification:', order);
        const message = this.formatOrderMessage(order);
        
        try {
            console.log('Sending notification to Telegram...');
            const url = `https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`;
            console.log('Request URL:', url);
            
            const body = {
                chat_id: this.CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Confirm', callback_data: `confirm_${order.orderId}` },
                            { text: '🚚 Ship', callback_data: `ship_${order.orderId}` }
                        ],
                        [
                            { text: '✓ Delivered', callback_data: `deliver_${order.orderId}` },
                            { text: '❌ Cancel', callback_data: `cancel_${order.orderId}` }
                        ]
                    ]
                }
            };
            
            console.log('Request body:', JSON.stringify(body, null, 2));
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            
            const responseData = await response.json();
            console.log('Telegram API response:', responseData);
            
            if (!response.ok) {
                throw new Error(`Failed to send Telegram notification: ${responseData.description}`);
            }
            
            console.log('Order notification sent successfully to Telegram');
        } catch (error) {
            console.error('Error sending Telegram notification:', error);
            alert('There was an error notifying the seller. Your order is still placed.');
        }
    },

    formatOrderMessage(order) {
        return `
🛍️ <b>New Order Received!</b>

Order ID: #${order.orderId}
Date: ${new Date(order.date).toLocaleString()}

👤 <b>Customer Details:</b>
Name: ${order.customer.name}
Email: ${order.customer.email}
Phone: ${order.customer.phone}
Address: ${order.customer.address}
${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}

🛒 <b>Order Items:</b>
${order.items.map(item => `
- ${item.name} × ${item.quantity}
  Price: ₹${item.price.toFixed(2)}`).join('\n')}

💰 <b>Payment Details:</b>
Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Payment'}
${order.utr ? `UTR: ${order.utr}` : ''}
Subtotal: ₹${order.subtotal.toFixed(2)}
Tax: ₹${order.tax.toFixed(2)}
Shipping: ₹${order.shipping.toFixed(2)}
${order.codFee ? `COD Fee: ₹${order.codFee.toFixed(2)}` : ''}
Total: ₹${order.total.toFixed(2)}
`;
    },

    async sendStatusUpdate(orderId, newStatus) {
        try {
            const order = StorageUtil.getOrderById(orderId);
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }

            const statusEmoji = {
                'Confirmed': '✅',
                'Shipped': '🚚',
                'Delivered': '📦',
                'Cancelled': '❌',
                'Pending': '⏳'
            };

            const message = `
✅ Order Status Updated

Order ID: #${orderId}
New Status: ${newStatus}

👤 Customer: ${order.customer.name}
📱 Phone: ${order.customer.phone}
📍 Address: ${order.customer.address}
${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}

💰 Order Total: ₹${order.total.toFixed(2)}
🕒 Updated: ${new Date().toLocaleString()}
`;

            const url = `https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(`Failed to send status update: ${responseData.description}`);
            }

            console.log('Status update sent to Telegram');
        } catch (error) {
            console.error('Error sending status update to Telegram:', error);
        }
    }
}; 