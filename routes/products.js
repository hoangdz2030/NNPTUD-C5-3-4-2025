var express = require('express');
const slugify = require('slugify');
var router = express.Router();
let productModel = require('../schemas/product');
let CategoryModel = require('../schemas/category');

function buildQuery(obj) {
  let result = {};
  if (obj.name) {
    result.name = new RegExp(obj.name, 'i');
  }
  result.price = {};
  if (obj.price) {
    result.price.$gte = obj.price.$gte || 0;
    result.price.$lte = obj.price.$lte || 10000;
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}

/* GET all products */
router.get('/', async function(req, res, next) {
  let products = await productModel.find(buildQuery(req.query)).populate("category");
  res.status(200).send({
    success: true,
    data: products
  });
});

/* GET product by ID */
router.get('/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id).populate("category");
    if (!product) throw new Error("Product not found");
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Không có ID phù hợp"
    });
  }
});

/* GET products by category slug or specific product slug */
router.get('/slug/:categorySlug/:productSlug?', async function(req, res, next) {
  try {
    const { categorySlug, productSlug } = req.params;

    // Tìm category theo slug
    const category = await CategoryModel.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category không tồn tại"
      });
    }

    if (productSlug) {
      // Tìm sản phẩm cụ thể
      const product = await productModel.findOne({
        slug: productSlug,
        category: category._id,
        isDeleted: false
      }).populate("category");
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "Product không tồn tại"
        });
      }
      res.status(200).send({
        success: true,
        data: product
      });
    } else {
      // Lấy tất cả sản phẩm trong category
      const products = await productModel.find({
        category: category._id,
        isDeleted: false
      }).populate("category");
      res.status(200).send({
        success: true,
        data: products
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
});

/* POST new product */
router.post('/', async function(req, res, next) {
  try {
    let cate = await CategoryModel.findOne({ name: req.body.category });
    if (!cate) {
      return res.status(404).send({
        success: false,
        message: "Category không đúng"
      });
    }

    const slug = slugify(req.body.name, { lower: true, strict: true });
    let newProduct = new productModel({
      name: req.body.name,
      slug: slug,
      price: req.body.price,
      quantity: req.body.quantity,
      category: cate._id
    });
    await newProduct.save();
    res.status(200).send({
      success: true,
      data: newProduct
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

/* PUT update product */
router.put('/:id', async function(req, res, next) {
  try {
    let updateObj = {};
    const body = req.body;
    if (body.name) {
      updateObj.name = body.name;
      updateObj.slug = slugify(body.name, { lower: true, strict: true });
    }
    if (body.price) updateObj.price = body.price;
    if (body.quantity) updateObj.quantity = body.quantity;
    if (body.category) {
      let cate = await CategoryModel.findOne({ name: body.category });
      if (!cate) {
        return res.status(404).send({
          success: false,
          message: "Category không tồn tại"
        });
      }
      updateObj.category = cate._id;
    }

    let updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true }
    ).populate("category");

    if (!updatedProduct) {
      return res.status(404).send({
        success: false,
        message: "Product không tồn tại"
      });
    }

    res.status(200).send({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

/* DELETE product (soft delete) */
router.delete('/:id', async function(req, res, next) {
  try {
    let deletedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedProduct) {
      return res.status(404).send({
        success: false,
        message: "ID không tồn tại"
      });
    }
    res.status(200).send({
      success: true,
      data: deletedProduct
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;