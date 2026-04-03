// Backend server for Razorpay integration
// Run: node server.js

const express = require('express');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Visitor tracking setup
const VISITORS_FILE = path.join(__dirname, 'visitors.json');

// Function to load visitors data
function loadVisitors() {
    try {
        if (fs.existsSync(VISITORS_FILE)) {
            return JSON.parse(fs.readFileSync(VISITORS_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading visitors file:', error);
    }
    return { total: 0, visits: [] };
}

// Function to save visitors data
function saveVisitors(data) {
    try {
        fs.writeFileSync(VISITORS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving visitors file:', error);
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Visitor tracking middleware
app.use((req, res, next) => {
    // Skip tracking for API calls
    if (!req.path.startsWith('/api/')) {
        const visitors = loadVisitors();
        const timestamp = new Date().toISOString();
        const ip = req.ip || req.connection.remoteAddress;
        
        visitors.total++;
        visitors.visits.push({
            id: visitors.total,
            page: req.path,
            ip: ip,
            timestamp: timestamp,
            userAgent: req.get('user-agent'),
            referer: req.get('referer') || 'direct'
        });
        
        // Keep only last 10000 visits to avoid huge file
        if (visitors.visits.length > 10000) {
            visitors.visits = visitors.visits.slice(-10000);
        }
        
        saveVisitors(visitors);
    }
    next();
});

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order API
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, currency, receipt, customer } = req.body;

        // Validate input
        if (!amount || !currency) {
            return res.status(400).json({ message: 'Amount and currency are required' });
        }

        // Create order on Razorpay
        const order = await razorpay.orders.create({
            amount: Math.round(amount), // Amount in smallest unit (paise for INR)
            currency: currency,
            receipt: receipt,
            notes: {
                customer_name: customer?.name,
                customer_email: customer?.email,
                customer_phone: customer?.phone
            }
        });

        // Send order details to frontend (without secret key)
        res.json({
            order_id: order.id,
            key_id: process.env.RAZORPAY_KEY_ID,
            amount: amount,
            currency: currency
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            message: 'Failed to create order',
            error: error.message 
        });
    }
});

// Verify Payment API
app.post('/api/verify-payment', (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Generate signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // Verify signature
        if (expectedSignature === razorpay_signature) {
            res.json({ 
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            res.status(400).json({ 
                success: false,
                message: 'Payment verification failed'
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            message: 'Verification failed',
            error: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend server is running' });
});

// Visitor stats API
app.get('/api/visitor-stats', (req, res) => {
    try {
        const visitors = loadVisitors();
        const uniqueIps = [...new Set(visitors.visits.map(v => v.ip))];
        
        // Count visitors per page
        const pageStats = {};
        visitors.visits.forEach(visit => {
            pageStats[visit.page] = (pageStats[visit.page] || 0) + 1;
        });
        
        // Last 20 visits
        const recentVisits = visitors.visits.slice(-20).reverse();
        
        res.json({
            totalVisits: visitors.total,
            uniqueVisitors: uniqueIps.length,
            pageBreakdown: pageStats,
            recentVisits: recentVisits,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Make sure .env file has RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
});
