import { Router } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/v1/orders - Get all orders for the authenticated user
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        payment_id,
        payment_gateway,
        created_at,
        updated_at,
        credit_packs (
          id,
          name,
          description,
          credit_amount,
          price_usd
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
      return;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error in GET /orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/my/orders - Get all orders for the authenticated user
router.get('/my/orders', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        payment_id,
        payment_gateway,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          unit_price,
          credit_packs (
            id,
            name,
            credit_amount,
            price_usd
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
      return;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error in GET /my/orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/my/orders/:id - Get a specific order by ID (user's own order only)
router.get('/my/orders/:id', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!id) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        payment_id,
        payment_gateway,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          unit_price,
          credit_packs (
            id,
            name,
            credit_amount,
            price_usd
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only access their own orders
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch order' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Error in GET /my/orders/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/orders/:id - Get a specific order by ID (user's own order only)
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (!id) {
      res.status(400).json({ error: 'Order ID is required' });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        credit_pack_id,
        status,
        total_amount,
        payment_id,
        payment_gateway,
        created_at,
        updated_at,
        credit_packs (
          id,
          name,
          description,
          credit_amount,
          price_usd
        )
      `)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only access their own orders
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch order' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Error in GET /orders/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get the active payment provider
async function getActivePaymentProvider() {
  const { data: paymentProvider, error } = await supabase
    .from('payment_providers')
    .select('*')
    .eq('is_enabled', true)
    .order('is_default_test', { ascending: false }) // Prioritize TEST provider
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching payment provider:', error);
    return null;
  }

  return paymentProvider;
}

// Helper function to process TEST payment
async function processTestPayment(orderId: number, userId: string, totalCredits: number) {
  // Update user balance
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('credit_balance')
    .eq('id', userId)
    .single();

  const newBalance = (currentProfile?.credit_balance || 0) + totalCredits;

  const { error: balanceError } = await supabase
    .from('profiles')
    .update({ credit_balance: newBalance })
    .eq('id', userId);

  if (balanceError) {
    console.error('Error updating credit balance:', balanceError);
    // Don't fail the order, just log it
  }

  // Insert credit ledger entry
  const { error: ledgerError } = await supabase
    .from('credit_ledger')
    .insert({
      user_id: userId,
      change: totalCredits,
      type: 'purchase',
      reference_table: 'orders',
      reference_id: orderId,
      balance_after: newBalance,
    });

  if (ledgerError) {
    console.error('Error creating credit ledger entry:', ledgerError);
    // Don't fail the order, just log it
  }

  return { newBalance, success: !balanceError && !ledgerError };
}

// POST /api/v1/orders/create - Create a new order from cart
router.post('/create', authenticateUser, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'items array is required and must not be empty' });
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      res.status(400).json({ error: 'totalAmount is required and must be greater than 0' });
      return;
    }

    // Calculate total credits and validate items
    let calculatedAmount = 0;
    let totalCredits = 0;
    const orderItems = [];

    for (const item of items) {
      const { credit_pack_id, quantity } = item;

      if (!credit_pack_id || !quantity || quantity <= 0) {
        res.status(400).json({ error: 'Each item must have credit_pack_id and valid quantity' });
        return;
      }

      // Validate credit pack exists and is active
      const { data: creditPack, error: packError } = await supabase
        .from('credit_packs')
        .select('id, name, credits_amount, price_fiat')
        .eq('id', credit_pack_id)
        .eq('is_active', true)
        .single();

      if (packError || !creditPack) {
        res.status(400).json({ error: `Invalid or inactive credit pack: ${credit_pack_id}` });
        return;
      }

      const itemTotal = creditPack.price_fiat * quantity;
      calculatedAmount += itemTotal;
      totalCredits += creditPack.credits_amount * quantity;

      orderItems.push({
        credit_pack_id: parseInt(credit_pack_id),
        quantity,
        unit_price: creditPack.price_fiat,
        total_price: itemTotal,
      });
    }

    // Validate totalAmount matches calculated amount
    if (Math.abs(calculatedAmount - totalAmount) > 0.01) {
      res.status(400).json({ error: 'totalAmount does not match calculated amount from items' });
      return;
    }

    // Get payment provider
    const paymentProvider = await getActivePaymentProvider();
    let paymentStatus = 'pending';
    let providerReference = null;

    if (paymentProvider?.provider === 'TEST') {
      paymentStatus = 'paid';
      providerReference = `test_${Date.now()}_${userId.slice(0, 8)}`;
    }

    // Create the order in a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending', // Use status for order overall status
        payment_status: paymentStatus,
        amount: calculatedAmount,
        total_credits: totalCredits,
        payment_provider: paymentProvider?.provider,
        provider_reference: providerReference,
      })
      .select('id, user_id, payment_status, amount, total_credits, payment_provider')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      res.status(500).json({ error: 'Failed to create order' });
      return;
    }

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderItems.map(item => ({
          order_id: order.id,
          ...item,
        }))
      );

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Clean up order if items insertion fails
      await supabase.from('orders').delete().eq('id', order.id);
      res.status(500).json({ error: 'Failed to create order items' });
      return;
    }

    // If TEST provider, immediately add credits and ledger entry
    if (paymentProvider?.provider === 'TEST') {
      await processTestPayment(order.id, userId, totalCredits);
    }

    // Return success response
    const response = {
      status: 'success',
      payment_provider: paymentProvider?.provider || 'unknown',
      orderId: order.id,
      message: paymentProvider?.provider === 'TEST'
        ? 'Test payment processed – credits added to account.'
        : 'Order created successfully. Redirecting to payment...',
      payment_session: paymentProvider?.provider !== 'TEST' ? {
        session_id: `session_${order.id}`,
        payment_url: `https://3thix.example.com/pay/${order.id}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        amount: calculatedAmount,
        currency: 'USD',
      } : null,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error in POST /orders/create:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
