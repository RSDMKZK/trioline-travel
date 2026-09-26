export default function handler(req, res) {
  res.status(200).json({
    status: 'operational',
    service: 'TRIOLINE TRAVELS Global Operations & Flight Concierge',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
