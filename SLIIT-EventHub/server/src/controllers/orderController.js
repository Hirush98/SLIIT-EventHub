const MerchOrder = require('../models/MerchOrder');
const Merch = require('../models/MerchModel');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailUtils');

const serializeOrder = (order) => ({
  rawId: order._id.toString(),
  id: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  paymentMethod: order.paymentMethod,
  paymentSlipName: order.paymentSlipName,
    paymentSlipPath: order.paymentSlipPath,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    stockDeducted: order.stockDeducted,
    total: order.total,
  items: order.items,
  placedAt: order.createdAt
});

const buildItemsHtml = (items) => items.map((item) => `
  <tr>
    <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
    <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
    <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">Rs. ${Number(item.price).toLocaleString()}</td>
    <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">Rs. ${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
  </tr>
`).join('');

const sendOrderEmail = async (order) => {
  const placedAtText = new Date(order.createdAt).toLocaleString();
  const collectionNotice = 'Complete your Payment and Collect the Merchandise At Our Outlet';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #1f2937;">
      <div style="background: #1f2937; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">SLIIT EventHub</h1>
        <p style="color: #cbd5e1; margin: 6px 0 0; font-size: 13px;">Merchandise Order Bill</p>
      </div>
      <div style="padding: 28px 24px; background: #f8fafc;">
        <h2 style="margin-top: 0; color: #0f172a;">Hello ${order.customerName},</h2>
        <p style="line-height: 1.7; color: #475569;">
          Your merchandise order has been placed successfully. Here is your bill and order summary.
        </p>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 24px 0;">
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Customer Name</p>
            <strong>${order.customerName}</strong>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Email Address</p>
            <strong>${order.customerEmail}</strong>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Order ID</p>
            <strong>ORD-${order._id.toString().slice(-8).toUpperCase()}</strong>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Order Date & Time</p>
            <strong>${placedAtText}</strong>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <thead style="background: #e2e8f0;">
            <tr>
              <th style="padding: 12px; text-align: left;">Merchandise</th>
              <th style="padding: 12px; text-align: left;">Qty</th>
              <th style="padding: 12px; text-align: left;">Price</th>
              <th style="padding: 12px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${buildItemsHtml(order.items)}
          </tbody>
        </table>

        <div style="margin-top: 18px; padding: 16px 18px; border-radius: 14px; background: #dbeafe; display: flex; justify-content: space-between; gap: 16px;">
          <span style="font-weight: 700;">Full Amount</span>
          <strong>Rs. ${Number(order.total).toLocaleString()}</strong>
        </div>

        <p style="margin: 18px 0 0; padding: 16px 18px; border-radius: 14px; background: #fef3c7; color: #78350f; font-weight: 700;">
          ${order.paymentMethod === 'collection'
            ? collectionNotice
            : 'Payment confirmed. Collect the merch at the outlet.'}
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: order.customerEmail,
    subject: `SLIIT EventHub Order Bill - ORD-${order._id.toString().slice(-8).toUpperCase()}`,
    html
  });
};

const createOrderNotification = async ({ userId, orderId, type }) => {
  const title = type === 'payment_confirmed' ? 'Payment Confirmed' : 'Order Completed';
  const message = type === 'payment_confirmed'
    ? 'Your merchandise payment has been confirmed by the admin.'
    : 'Your merchandise order has been completed and is ready for collection.';

  await Notification.create({
    user: userId,
    order: orderId,
    type,
    title,
    message
  });
};

const placeOrder = async (req, res, next) => {
  try {
    const { total, paymentMethod, paymentSlipName = '' } = req.body;
    const parsedItems = typeof req.body.items === 'string'
      ? JSON.parse(req.body.items)
      : req.body.items;

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required.'
      });
    }

    if (!['bank', 'collection'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.'
      });
    }

    if (paymentMethod === 'bank' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Bank transfer slip is required.'
      });
    }

    const normalizedItems = parsedItems.map((item) => ({
      id: String(item.id),
      name: item.name,
      category: item.category || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1
    }));

    const calculatedTotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) + (normalizedItems.length > 0 ? 200 : 0);

    const order = await MerchOrder.create({
      user: req.user._id,
      customerName: `${req.user.firstName} ${req.user.lastName}`.trim(),
      customerEmail: req.user.email,
      paymentMethod,
      paymentSlipName: paymentMethod === 'bank' ? (req.file?.originalname || paymentSlipName) : '',
      paymentSlipPath: paymentMethod === 'bank' && req.file ? `/uploads/${req.file.filename}` : '',
      paymentStatus: paymentMethod === 'bank' ? 'pending_confirmation' : 'not_required',
      orderStatus: 'pending_collection',
      total: Number(total) || calculatedTotal,
      items: normalizedItems
    });

    if (paymentMethod === 'collection') {
      try {
        await sendOrderEmail(order);
      } catch (emailError) {
        return res.status(500).json({
          success: false,
          message: emailError.message || 'Order was created, but sending the bill email failed.'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: serializeOrder(order)
    });
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await MerchOrder.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders.map(serializeOrder)
    });
  } catch (err) {
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await MerchOrder.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders.map(serializeOrder)
    });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { action } = req.body;
    const order = await MerchOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (action === 'confirm_payment' && order.paymentMethod === 'bank') {
      order.paymentStatus = 'confirmed';
    } else if (action === 'complete_order') {
      if (order.orderStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Order is already completed.'
        });
      }

      if (!order.stockDeducted) {
        for (const item of order.items) {
          const merch = await Merch.findById(item.id);

          if (!merch) {
            return res.status(404).json({
              success: false,
              message: `Merchandise item not found for ${item.name}.`
            });
          }

          if (Number(merch.stock) < Number(item.quantity)) {
            return res.status(400).json({
              success: false,
              message: `Not enough stock available for ${item.name}.`
            });
          }
        }

        for (const item of order.items) {
          await Merch.findByIdAndUpdate(item.id, {
            $inc: { stock: -Number(item.quantity) }
          });
        }

        order.stockDeducted = true;
      }

      order.orderStatus = 'completed';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid order action.'
      });
    }

    await order.save();

    if (action === 'confirm_payment' && order.paymentMethod === 'bank') {
      await createOrderNotification({
        userId: order.user,
        orderId: order._id,
        type: 'payment_confirmed'
      });

      try {
        await sendOrderEmail(order);
      } catch (emailError) {
        return res.status(500).json({
          success: false,
          message: emailError.message || 'Payment was confirmed, but sending the bill email failed.'
        });
      }
    }

    if (action === 'complete_order') {
      await createOrderNotification({
        userId: order.user,
        orderId: order._id,
        type: 'order_completed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
      order: serializeOrder(order)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getOrders, getMyOrders, updateOrderStatus };
