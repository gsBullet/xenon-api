const express = require('express');
const branchValidator = require('../middleware/request/validator/branch');
const branchController = require('../controllers/branch');
const auth = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  auth.isLoggedIn,
  auth.authorizeModerator,
  branchController.branches,
);

router.post(
  '/',
  auth.isLoggedIn,
  auth.authorizeModerator,
  branchValidator.createNewBranch,
  branchController.createBranch,
);

router.patch(
  '/:id',
  auth.isLoggedIn,
  auth.authorizeModerator,
  branchValidator.updateBranch,
  branchController.updateBranch,
);
router.delete(
  '/:id',
  auth.isLoggedIn,
  auth.authorizeModerator,
  branchController.deleteBranch,
);

module.exports = router;
