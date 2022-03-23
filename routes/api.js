const router = require('express').Router({
    caseSensitive: false,
});

const galeriController = require('../controllers/galeri.controller');
const setoranController = require('../controllers/setoran-wajib.controller');
const userController = require('../controllers/user.controller');
const apiController = require('../controllers/ApiTestController');
const { uploadSingle, uploadMultiple, uploadSingleFix } = require('../middlewares/multer');
const { ApplyController } = require('../controllers/controller-util');

//setoran wajib
// router.post('/setoranwajib', apiController.addSetoranWajib);
// router.get('/setoranwajib', apiController.ViewSetoranWajib);
// router.get('/setoranwajib/:id', apiController.ViewSetoranWajibByUser);
// router.put('/setoranwajib', apiController.updateOneSetoranWajib);

//setoran pokok
// router.post('/setoranpokok', apiController.addSetoranPokok);
// router.get('/setoranpokok', apiController.ViewSetoranPokok);
// router.get('/setoranpokok/:id', apiController.ViewSetoranPokokByUser);
// router.put('/setoranpokok', apiController.updateOneSetoranPokok);
// router.delete('/setoranpokok/:id', apiController.deleteSetoraPokok);

//formulir
router.post('/formulir', uploadSingle, apiController.AddformDaftar)
router.get('/formulir', apiController.ViewFormDaftar);
router.put('/formulir', uploadSingle, apiController.updateOneFormDaftar);
router.delete('/formulir/:id', apiController.deleteFormDaftar);

//profile
router.get('/member', apiController.ViewDataProfile);
router.get('/member/:id', apiController.ViewDataProfileById);
router.post('/member', uploadSingle, apiController.updateDataProfile);
router.put('/member', uploadSingle, apiController.updateOneDataProfile);
router.delete('/member/:id', apiController.deleteDataProfile);

//saran
router.post('/saran', apiController.addSaran)
router.delete('/saran/:id', apiController.deleteSaran);


module.exports = ApplyController(router)(
    userController,
    galeriController,
    setoranController
);