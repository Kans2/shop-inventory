const router = require("express").Router();
const c = require("../controllers/productController");
const { protect } = require("../middleware/auth");

router.use(protect); // every product route needs a logged-in shop owner

router.get("/categories", c.getCategories); // keep above "/:id"
router.route("/").get(c.getProducts).post(c.createProduct);
router.route("/:id").get(c.getProduct).put(c.updateProduct).delete(c.deleteProduct);
router.post("/:id/stock", c.adjustStock);
router.get("/:id/movements", c.getMovements);

module.exports = router;
