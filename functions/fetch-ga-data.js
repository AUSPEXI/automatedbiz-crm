const { GoogleAuth } = require('google-auth-library');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

exports.handler = async () => {
  try {
    const auth = new GoogleAuth({
      credentials: JSON.parse(process.env.GA_SERVICE_ACCOUNT),
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    const client = new BetaAnalyticsDataClient({ auth });
    const [response] = await client.runRealtimeReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
      dimensions: [{ name: 'eventName' }],
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.rows.map(row => ({
        event: row.dimensionValues[0].value,
        users: row.metricValues[0].value,
        events: row.metricValues[1].value,
      }))),
    };
  } catch (error) {
    console.error('Error fetching GA data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch Google Analytics data' }),
    };
  }
};