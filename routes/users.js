var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler')
let { check_authentication, check_authorization } = require('../utils/check_auth')
let constants = require('../utils/constants')
let { validate, validationCreateUser } = require('../utils/validator')
let multer = require('multer')
let path = require('path')
let url = require('url')
let axios = require('axios')
let FormData = require('form-data')
let fs = require('fs')


let avatarDir = path.join(__dirname, '../avatars')
let cdnURL = 'http://localhost:4000/upload'
/* GET users listing. */
router.get('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let users = await userController.GetAllUser();
    CreateSuccessRes(res, 200, users);
  } catch (error) {
    next(error)
  }
});
router.get('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let user = await userController.GetUserById(req.params.id)
    CreateSuccessRes(res, 200, user);
  } catch (error) {
    CreateErrorRes(res, 404, error);
  }
});
router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), validationCreateUser, validate, async function (req, res, next) {
  try {
    let body = req.body
    let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
    CreateSuccessRes(res, 200, newUser);
  } catch (error) {
    next(error);
  }
})
router.put('/:id', async function (req, res, next) {
  try {
    let updateUser = await userController.UpdateUser(req.params.id, req.body);
    CreateSuccessRes(res, 200, updateUser);
  } catch (error) {
    next(error);
  }
})
//storage
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => cb(null,
    (new Date(Date.now())).getTime() + "-" + file.originalname
  )
})
//upload
let upload = multer({
  storage: storage,
  fileFilters: (req, file, cb) => {
    if (!file.mimetype.match(/image/)) {
      cb(new Error('tao chi nhan anh? thoi'))
    } else {
      cb(null, true)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})


router.post('/change_avatar',check_authentication, upload.single('avatar'), async function (req, res, next) {
  try {
    if (!req.file) {
      throw new Error("khong co file anh chai oi")
    } else {
      let formData = new FormData();
      let pathFile = path.join(avatarDir, req.file.filename);
      formData.append('avatar', fs.createReadStream(pathFile))
      let result = await axios.post(cdnURL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      fs.unlinkSync(pathFile)
      req.user.avatarUrl = result.data.data;
      await req.user.save()
      CreateSuccessRes(res, 200, result.data.data)
    }

  } catch (error) {
    next(error)
  }
})
router.get('/avatars/:filename', function (req, res, next) {
  let filename = req.params.filename;
  let pathfile = path.join(avatarDir, filename)
  res.status(200).sendFile(pathfile)
})




module.exports = router;
