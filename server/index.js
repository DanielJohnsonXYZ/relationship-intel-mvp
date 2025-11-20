require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DEMO_MODE = !process.env.ANTHROPIC_API_KEY; // Default to Demo Mode if no key

console.log(`Starting server in ${DEMO_MODE ? 'DEMO MODE' : 'REAL MODE'}`);

// AI Service Wrapper
async function analyzeText(text) {
    if (DEMO_MODE) {
        // Mock Analysis
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
        const isRisk = text.toLowerCase().includes('delay') || text.toLowerCase().includes('frustrated');
        const isOpp = text.toLowerCase().includes('scale') || text.toLowerCase().includes('expand');

        return {
            type: isRisk ? 'risk' : (isOpp ? 'opportunity' : 'checkin'),
            summary: isRisk ? 'Detected frustration regarding timelines.' : (isOpp ? 'Client signaled expansion interest.' : 'Routine communication.'),
            confidence: 0.85,
            action_item: isRisk ? 'Draft reassurance email.' : (isOpp ? 'Send proposal.' : 'No action needed.')
        };
    } else {
        // Real Claude Analysis
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [{ role: "user", content: `Analyze this client message for relationship health. Return JSON with keys: type (risk/opportunity/healthy), summary, confidence (0-1), action_item.\n\nMessage: "${text}"` }]
        });
        // Note: In a real app, we'd parse the JSON strictly. For MVP, we assume Claude behaves.
        try {
            const jsonMatch = msg.content[0].text.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
        } catch (e) {
            return { type: 'healthy', summary: 'Analysis failed', confidence: 0, action_item: 'Check logs' };
        }
    }
}

// Routes
app.get('/api/clients', (req, res) => {
    const clients = db.prepare('SELECT * FROM clients').all();
    res.json(clients);
});

app.get('/api/clients/:id', (req, res) => {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
});

app.get('/api/clients/:id/messages', (req, res) => {
    const messages = db.prepare('SELECT * FROM messages WHERE client_id = ? ORDER BY timestamp DESC').all(req.params.id);
    res.json(messages);
});

app.get('/api/insights', (req, res) => {
    const insights = db.prepare('SELECT insights.*, clients.name as client_name FROM insights JOIN clients ON insights.client_id = clients.id ORDER BY timestamp DESC LIMIT 10').all();
    res.json(insights);
});

app.post('/api/analyze', async (req, res) => {
    const { text, client_id, platform } = req.body;

    // 1. Save Message
    db.prepare('INSERT INTO messages (client_id, platform, content, timestamp) VALUES (?, ?, ?, ?)').run(client_id, platform, text, new Date().toISOString());

    // 2. Analyze
    const analysis = await analyzeText(text);

    // 3. Save Insight
    db.prepare('INSERT INTO insights (client_id, type, summary, confidence, action_item, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(client_id, analysis.type, analysis.summary, analysis.confidence, analysis.action_item, new Date().toISOString());

    // 4. Update Client Status
    db.prepare('UPDATE clients SET status = ? WHERE id = ?').run(analysis.type, client_id);

    res.json(analysis);
});

// OAuth Placeholders
app.get('/auth/google', (req, res) => {
    if (DEMO_MODE) return res.redirect('http://localhost:5173?connected=gmail');
    // Real OAuth flow would go here
    res.redirect('http://localhost:5173?connected=gmail');
});

app.get('/auth/slack', (req, res) => {
    if (DEMO_MODE) return res.redirect('http://localhost:5173?connected=slack');
    res.redirect('http://localhost:5173?connected=slack');
});

// Export for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
