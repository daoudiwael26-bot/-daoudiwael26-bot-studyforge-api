export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    // Vercel parse automatiquement le body JSON
    const { messages, system, max_tokens } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages requis et doit être un tableau non vide' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Clé API non configurée sur le serveur' });
    }

    const body = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: max_tokens || 1500,
      messages
    };
    if (system) body.system = system;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Erreur API Anthropic' });
    }
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erreur serveur interne' });
  }
}
