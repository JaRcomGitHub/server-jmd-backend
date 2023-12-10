const express = require("express");
const asyncHandler = require("express-async-handler");
const { servicesSidebarController } = require("../controllers");
const { newsController } = require("../controllers");
const { userAndPetsController } = require("../controllers");
const { authMiddleware } = require("../middlewares/auth");
const { uploadMiddleware, urlToAvatar } = require("../middlewares/upload");

const router = express.Router();

router.get(
  "/servicesSidebar",
  asyncHandler(servicesSidebarController.servicesSidebar)
);
router.get("/news", asyncHandler(newsController.news));
router.get(
  "/userAndPets",
  authMiddleware,
  asyncHandler(userAndPetsController.userAndPets)
);
router.post(
  "/uploadAvatar",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  urlToAvatar
);
router.get("/ppk", asyncHandler(ppk));
router.get("/ppk/:ppkSN", asyncHandler(ppkSN));
router.get("/msgs", asyncHandler(msgs));

module.exports = router;

// const devices = require("../devices-data.json");
const { devices } = require("../ws-client");

async function ppk(req, res) {
  const ppkAll = [];
  // console.log(devices);
  for (var ppk in devices) {
    ppkAll.push(ppk);
    // console.log(ppk);
  }

  return res.status(200).json(ppkAll);
}

async function ppkSN(req, res) {
  const { ppkSN } = req.params;
  // console.log(ppkSN);

  for (var ppk in devices) {
    if (ppkSN == ppk) {
      const sensors = [];
      // console.log(devices[ppk]);
      for (var sensor in devices[ppk]) {
        const { ver, id, msgs } = devices[ppk][sensor];
        const sen = { sn: sensor, ver, id, msgs };
        sensors.push(sen);
        // console.log(sen);
      }

      return res.status(200).json(sensors);
    }
  }
  return res.status(200).json("Not found!");
}

async function msgs(req, res) {
  return res.status(200).json(devices);
}
