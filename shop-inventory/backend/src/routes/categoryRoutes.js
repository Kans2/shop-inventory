const router = require("express").Router();
const c = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").get(c.getCategories).post(c.createCategory);
router.route("/:id").put(c.updateCategory).delete(c.deleteCategory);

module.exports = router;
