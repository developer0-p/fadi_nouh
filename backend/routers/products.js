const { Product } = require('../models/product')
const express = require('express')
const { Category } = require('../models/category')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if (isValid) {
            uploadError = null
        }

        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-').split('.')[0]
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    },
})

const uploadOptions = multer({ storage: storage })

//routes
router.get('/', async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    console.log(filter)
    const productList = await Product.find(filter).populate('category')
    //.select('name image -_id')

    // .select('name image -_id')

    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')

    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product)
})

router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) {
        return res.status(400).send('Invalid category!!')
    }
    const file = req.file
    if (!file) {
        return res.status(400).send('Invalid image!!')
    }
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    console.log(`${basePath}${fileName}`)
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        // images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })
    product = await product.save()
    if (!product) {
        return res.send(500).send('Product cannot be created')
    }
    res.send(product)
})

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if (!category) {
        return res.status(400).send('Invalid category!!')
    }
    const product = await Product.findById(req.params.id)
    if (!product) {
        return res.status(400).send('Invalid product!!')
    }

    const file = req.file
    let imagepath
    if (file) {
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        imagepath = `${basePath}${fileName}`
    } else {
        imagepath = product.image
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            // images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    )

    if (!updatedProduct) {
        return res.send(500).send('Product cannot be updated! ')
    }
    res.send(updatedProduct)
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res
                    .status(200)
                    .json({ success: true, message: 'product deleted!!' })
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'product not found... cannot be deleted',
                })
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
})

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments()

    if (!productCount) {
        res.status(500).json({ success: false, error: err })
    }
    res.send({ productCount: productCount })
})

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const productFeatured = await Product.find({ isFeatured: true }).limit(
        count
    )

    if (!productFeatured) {
        res.status(500).json({ success: false, error: err })
    }
    res.send(productFeatured)
})

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
        }
        const files = req.files
        let imagesPath = []
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        if (files) {
            files.map((file) => {
                imagesPath.push(`${basePath}${file.filename}`)
            })
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPath,
            },
            { new: true }
        )

        if (!updatedProduct) {
            return res.send(500).send('Product cannot be updated! ')
        }
        res.send(updatedProduct)
    }
)
module.exports = router
