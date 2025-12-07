import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

// Helper function to process TEST payment
async function processTestPayment(orderId: number, userId: string, totalCredits: number) {
  try {
    // Update user balance and create ledger entry
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('credit_balance')
      .eq('id', userId)
      .single();

    const newBalance = (currentProfile?.credit_balance || 0) + totalCredits;

    await supabase
      .from('profiles')
      .update({ credit_balance: newBalance })
      .eq('id', userId);

    await supabase
      .from('credit_ledger')
      .insert({
        user_id: userId,
        change: totalCredits,
        type: 'purchase',
        reference_table: 'orders',
        reference_id: orderId,
        balance_after: newBalance,
      });

    console.log(`Credits added: ${totalCredits}, New balance: ${newBalance}`);
  } catch (error) {
    console.error('Error processing payment:', error);
  }
}

const router = Router();

// POST /api/v1/payments/create-order - Create a new order
router.post('/create-order', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { provider, items } = req.body;
  const userId = req.user!.id;

  try {
    // Validate provider
    if (!provider || !['TEST', '3thix'].includes(provider)) {
      res.status(400).json({ error: 'Valid provider (TEST or 3thix) is required' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'items array is required and must not be empty' });
      return;
    }

    // Calculate totals using placeholder pricing (demo purposes)
    let calculatedAmount = 0;
    let totalCredits = 0;
    const processedItems = [];

    for (const item of items) {
      const { packId, quantity } = item;

      if (!packId || !quantity || quantity <= 0) {
        res.status(400).json({ error: 'Each item must have packId and valid quantity' });
        return;
      }

      // Demo pricing - in production, fetch from credit_packs table
      const price_usd = 29.99; // Fixed demo price
      const credit_amount = 500; // Fixed demo credits

      const itemTotal = price_usd * quantity;
      calculatedAmount += itemTotal;
      totalCredits += credit_amount * quantity;

      processedItems.push({
        packId,
        quantity,
        unitPrice: price_usd,
        credits: credit_amount,
        total: itemTotal,
      });
    }

    // Generate mock order ID (in production, save to database)
    const orderId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    console.log(`Order created (DEMO): ${orderId}, Provider: ${provider}, Items: ${items.length}, Total: $${calculatedAmount}, Credits: ${totalCredits}`);

    // Simulate payment processing
    if (provider === 'TEST') {
      // TEST gateway: immediately mark as successful
      console.log(`TEST payment processed: Order ${orderId}, Credits granted: ${totalCredits}`);

      res.status(200).json({
        status: 'paid',
        orderId: orderId,
        creditsGranted: totalCredits,
        message: 'TEST payment completed successfully'
      });
    } else if (provider === '3thix') {
      // 3THIX gateway: redirect to mock payment page
      console.log(`3THIX payment initiated: Order ${orderId}, redirecting to payment widget`);

      res.status(200).json({
        status: 'redirect',
        orderId: orderId,
        paymentUrl: 'http://localhost:5173/order-success?redirect=true',
        message: '3THIX payment redirect initiated (demo)'
      });
    }

  } catch (error) {
    console.error('Error in create-order:', error);
    res.status(500).json({ error: 'Demo server error - order processing unavailable' });
  }
});

// POST /api/v1/payments/3thix/create-invoice - Create 3THIX payment invoice
router.post('/3thix/create-invoice', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { orderId } = req.body;
    const userId = req.user!.id;

    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    // Get the order and verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        amount,
        total_credits,
        payment_provider,
        payment_status,
        order_items (
          id,
          quantity,
          unit_price,
          credit_packs (
            name
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('payment_status', 'pending')
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      res.status(404).json({ error: 'Order not found or already processed' });
      return;
    }

    if (order.payment_provider !== '3thix') {
      res.status(400).json({ error: 'Order is not configured for 3THIX payment' });
      return;
    }

    // Get 3THIX provider configuration
    const { data: provider, error: providerError } = await supabase
      .from('payment_providers')
      .select('*')
      .eq('provider', '3thix')
      .eq('is_enabled', true)
      .single();

    if (providerError || !provider) {
      console.error('Error fetching 3THIX provider:', providerError);
      res.status(500).json({ error: 'Payment provider not configured' });
      return;
    }

    // Determine API endpoint and key based on environment
    const apiUrl = provider.environment === 'production'
      ? provider.production_api_url
      : provider.sandbox_api_url;

    const apiKey = provider.environment === 'production'
      ? provider.production_api_key
      : provider.sandbox_api_key;

    if (!apiUrl || !apiKey) {
      console.error('3THIX API configuration missing');
      res.status(500).json({ error: 'Payment provider configuration incomplete' });
      return;
    }

    // Build 3THIX API payload
    const currency = order.amount?.toString().includes('.') ? 'USD' : 'USD'; // Assume USD for now
    const apiPayload = {
      rail: "CREDIT_CARD",
      currency,
      amount: order.amount.toString(),
      merchant_ref_id: `order-${orderId}`,
      cart: order.order_items?.map((item: any) => ({
        product_name: item.credit_packs?.name || 'Credit Pack',
        qty_unit: item.quantity,
        price_unit: item.unit_price.toString(),
      })) || []
    };

    console.log('3THIX invoice payload:', apiPayload);

    // Call 3THIX API to create invoice
    const response = await fetch(`${apiUrl}/order/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      console.error('3THIX API error:', response.status, await response.text());
      res.status(500).json({ error: 'Failed to create payment invoice' });
      return;
    }

    const invoiceData: any = await response.json();
    const invoiceId = invoiceData.invoiceId || invoiceData.id;

    if (!invoiceId) {
      console.error('Invalid 3THIX response:', invoiceData);
      res.status(500).json({ error: 'Invalid response from payment provider' });
      return;
    }

    // Update order with external reference
    const { error: updateError } = await supabase
      .from('orders')
      .update({ provider_reference: invoiceId })
      .eq('id', orderId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      // Continue anyway - invoice was created
    }

    // Return invoice data to frontend
    res.status(200).json({
      invoiceId,
      paymentUrl: `${provider.widget_origin}/?invoiceId=${invoiceId}&anonymous=true&primary_color=%232563eb`,
      merchantRefId: apiPayload.merchant_ref_id,
    });

  } catch (error) {
    console.error('Error in create-invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/payments/3thix/callback - Handle 3THIX payment callback
router.post('/3thix/callback', async (req, res): Promise<void> => {
  try {
    console.log('3THIX callback received:', req.body);

    const { invoiceId, status, merchant_ref_id } = req.body;

    if (!merchant_ref_id || !merchant_ref_id.startsWith('order-')) {
      console.error('Invalid callback data:', req.body);
      res.status(400).json({ error: 'Invalid callback data' });
      return;
    }

    const orderId = merchant_ref_id.replace('order-', '');

    // Find the order by merchant_ref_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, amount, total_credits, payment_status')
      .eq('id', orderId)
      .eq('payment_provider', '3thix')
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Handle payment status
    const paymentSuccess = status === 'paid' || status === 'completed' || status === 'success';
    const newPaymentStatus = paymentSuccess ? 'paid' : 'failed';

    // Update order payment status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_status: newPaymentStatus })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      res.status(500).json({ error: 'Failed to update order' });
      return;
    }

    if (paymentSuccess) {
      // Update user balance and create ledger entry
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', order.user_id)
        .single();

      const newBalance = (currentProfile?.credit_balance || 0) + order.total_credits;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ credit_balance: newBalance })
        .eq('id', order.user_id);

      if (balanceError) {
        console.error('Error updating credit balance:', balanceError);
      }

      // Insert credit ledger entry
      const { error: ledgerError } = await supabase
        .from('credit_ledger')
        .insert({
          user_id: order.user_id,
          change: order.total_credits,
          type: 'purchase',
          reference_table: 'orders',
          reference_id: order.id,
          balance_after: newBalance,
        });

      if (ledgerError) {
        console.error('Error creating credit ledger entry:', ledgerError);
      }

      console.log(`Payment successful for order ${orderId}, credits added: ${order.total_credits}`);

      // Redirect to success page
      const redirectUrl = `/orders/success?orderId=${orderId}`;
      res.redirect(redirectUrl);
    } else {
      console.log(`Payment failed for order ${orderId}`);

      // Redirect to failed page
      const redirectUrl = `/orders/failed?orderId=${orderId}`;
      res.redirect(redirectUrl);
    }

  } catch (error) {
    console.error('Error in 3THIX callback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/payments/3thix/callback - Handle 3THIX return URL (for browsers)
router.get('/3thix/callback', async (req, res): Promise<void> => {
  try {
    const { invoiceId, status, merchant_ref_id } = req.query;

    console.log('3THIX return URL:', req.query);

    // Same logic as POST callback but return HTML redirect
    if (!merchant_ref_id || typeof merchant_ref_id !== 'string' || !merchant_ref_id.startsWith('order-')) {
      res.status(400).send('<h1>Invalid callback data</h1>');
      return;
    }

    const orderId = merchant_ref_id.replace('order-', '');
    const success = status === 'paid' || status === 'completed' || status === 'success';
    const redirectUrl = success
      ? `/orders/success?orderId=${orderId}`
      : `/orders/failed?orderId=${orderId}`;

    // Return HTML that redirects the user
    res.send(`
      <html>
        <head>
          <title>Payment ${success ? 'Success' : 'Failed'}</title>
          <script>
            window.location.href = '${redirectUrl}';
          </script>
        </head>
        <body>
          <p>Processing payment...</p>
          <p>If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.</p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error in 3THIX return URL:', error);
    res.status(500).send('<h1>Internal server error</h1>');
  }
});

export default router;
