const REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'phone',
  'email',
  'address',
  'propertyType',
  'service'
];

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function sanitizeText(value, maxLength = 1000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function validateLead(body) {
  const missing = REQUIRED_FIELDS.filter((field) => !sanitizeText(body[field], 250));
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return 'Please enter a valid email address.';
  }

  if (String(body.phone).replace(/\D/g, '').length < 7) {
    return 'Please enter a valid phone number.';
  }

  return null;
}

function buildLead(body, req) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '';

  return {
    first_name: sanitizeText(body.firstName, 120),
    last_name: sanitizeText(body.lastName, 120),
    phone: sanitizeText(body.phone, 60),
    email: sanitizeText(body.email, 180).toLowerCase(),
    address: sanitizeText(body.address, 300),
    property_type: sanitizeText(body.propertyType, 80),
    roof_size: sanitizeText(body.roofSize, 80),
    service: sanitizeText(body.service, 100),
    message: sanitizeText(body.message, 3000),
    contact_time: sanitizeText(body.contactTime, 80),
    insurance: Boolean(body.insurance),
    page_url: sanitizeText(body.pageUrl, 500),
    referrer: sanitizeText(body.referrer, 500),
    utm: body.utm && typeof body.utm === 'object' ? body.utm : {},
    user_agent: sanitizeText(req.headers['user-agent'], 500),
    ip_address: ip
  };
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const err = new Error('Database is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.');
    err.status = 503;
    throw err;
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (options.method !== 'GET') headers.Prefer = 'return=representation';

  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = new Error(data?.message || data?.error || 'Database request failed.');
    err.status = response.status;
    throw err;
  }

  return data;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,POST,OPTIONS');
    return send(res, 204, {});
  }

  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const validationError = validateLead(body);
      if (validationError) return send(res, 400, { error: validationError });

      const rows = await supabaseRequest('leads', {
        method: 'POST',
        body: JSON.stringify(buildLead(body, req))
      });

      return send(res, 201, { ok: true, id: rows?.[0]?.id || null });
    }

    if (req.method === 'GET') {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
        return send(res, 401, { error: 'Admin token required.' });
      }

      const rows = await supabaseRequest('leads?select=*&order=created_at.desc&limit=100', { method: 'GET' });
      return send(res, 200, { leads: rows });
    }

    res.setHeader('Allow', 'GET,POST,OPTIONS');
    return send(res, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return send(res, error.status || 500, {
      error: error.message || 'Something went wrong.'
    });
  }
};
