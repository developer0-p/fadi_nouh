const { Order } = require('../models/order')
const express = require('express')
const { OrderItem } = require('../models/order-item')
const router = express.Router()

//routes
router.get('/', async (req, res) => {
    const orderList = await Order.find()
        .populate('user orderItems', 'name quantity product')
        .sort({ dateOrdered: -1 })

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList)
})
router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name ')
        // .populate('orderItems', 'quantity product -_id')
        .populate({
            path: 'orderItems',
            populate: { path: 'product', populate: 'category' },
        })

    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order)
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } },
    ])

    if (!totalSales) {
        return res.status(400).send('order sales cannot be generated :(')
    }
    res.send({ totalsales: totalSales.pop().totalsales })
})

router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments()

    if (!orderCount) {
        res.status(500).json({ success: false, error: err })
    }
    res.send({ orderCount: orderCount })
})
router.get('/get/userorders/:userid', async (req, res) => {
    const userOrderList = await Order.find({
        user: req.params.userid,
    })
        .populate('user', 'name email isAdmin')
        .sort({ dateOrdered: -1 })

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList)
})
router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            })
            newOrderItem = await newOrderItem.save()

            return newOrderItem.id
        })
    )
    const orderItemsIdsResolved = await orderItemsIds

    const totalPrices = Promise.all(
        orderItemsIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate(
                'product',
                'price'
            )
            const totalPrice = orderItem.product.price * orderItem.quantity
            return totalPrice
        })
    )

    const totalPrice = (await totalPrices).reduce((a, b) => a + b, 0)

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save()

    if (!order) {
        return res.status(404).send('order cannot be created :(')
    }
    res.send(order)
})

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    )
    if (!order) {
        return res.status(404).send('Order cannot be updated :(')
    }
    res.status(200).send(order)
})
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(async (order) => {
            if (order) {
                await order.orderItems.map(async (itemId) => {
                    await OrderItem.findByIdAndRemove(itemId)
                    console.log('deleted item: ' + itemId)
                })
                return res
                    .status(200)
                    .json({ success: true, message: 'order deleted!!' })
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'order not found... cannot be deleted',
                })
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
})
module.exports = router
