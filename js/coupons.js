const CouponManager = {
    // Available coupons with their discount rules
    coupons: {
        'WELCOME10': {
            type:'fixed',
            discount: 10, // 10% off
            minAmount: 100, // Minimum cart value
            maxDiscount: 10, // Maximum discount amount
            description: '10rs off on orders above ₹100'
        },
        /*'SAVE20': {
            discount: 0.20, // 20% off
            minAmount: 500,
            maxDiscount: 2000,
            description: '20% off on orders above ₹500'
        },
        'SPECIAL50': {
            discount: 0.50, // 50% off
            minAmount: 1000,
            maxDiscount: 5000,
            description: '50% off on orders above ₹1000'
        },
        'SUMMER25': {
            discount: 0.25, // 25% off
            minAmount: 750,
            maxDiscount: 3000,
            description: '25% off on orders above ₹750'
        },
        'FIRST75': {
            discount: 0.15, // 15% off
            minAmount: 300,
            maxDiscount: 1500,
            description: '15% off on orders above ₹300'
        },
        'MEGA100': {
            discount: 0.30, // 30% off
            minAmount: 2000,
            maxDiscount: 6000,
            description: '30% off on orders above ₹2000'
        },
        'FLAT50': {
            type: 'fixed',
            discount: 50, // ₹50 off
            minAmount: 200,
            maxDiscount: 50,
            description: 'Flat ₹50 off on orders above ₹200'
        },
        'FLAT100': {
            type: 'fixed',
            discount: 100, // ₹100 off
            minAmount: 500,
            maxDiscount: 100,
            description: 'Flat ₹100 off on orders above ₹500'
        },
        'FLAT250': {
            type: 'fixed',
            discount: 250, // ₹250 off
            minAmount: 1000,
            maxDiscount: 250,
            description: 'Flat ₹250 off on orders above ₹1000'
        }*/
    },

    // Store the currently applied coupon
    currentCoupon: null,

    // Validate and apply coupon
    applyCoupon(code, subtotal) {
        code = code.toUpperCase();
        const coupon = this.coupons[code];

        if (!coupon) {
            return {
                success: false,
                message: 'Invalid coupon code'
            };
        }

        if (subtotal < coupon.minAmount) {
            return {
                success: false,
                message: `Minimum order amount of ₹${coupon.minAmount} required`
            };
        }

        let discountAmount;
        if (coupon.type === 'fixed') {
            discountAmount = coupon.discount;
        } else {
            discountAmount = Math.min(
                subtotal * coupon.discount,
                coupon.maxDiscount
            );
        }

        const couponData = {
            code: code,
            type: coupon.type || 'percentage',
            discount: coupon.discount,
            minAmount: coupon.minAmount,
            maxDiscount: coupon.maxDiscount,
            discountAmount: discountAmount,
            description: coupon.description,
            success: true,
            message: 'Coupon applied successfully!'
        };

        StorageUtil.setAppliedCoupon(couponData);
        return couponData;
    },

    // Remove applied coupon
    removeCoupon() {
        StorageUtil.removeAppliedCoupon();
    },

    // Get current coupon details
    getCurrentCoupon() {
        return StorageUtil.getAppliedCoupon();
    }
};