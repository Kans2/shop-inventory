const router = require("express").Router();
const c = require("../controllers/movementController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getMovements);

module.exports = router;
