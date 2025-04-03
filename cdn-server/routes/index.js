var express = require('express');
var router = express.Router();
let multer = require('multer')
let path = require('path')
let url = require('url')
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler')

let avatarDir = path.join(__dirname, '../avatars')
let urlAvatar = 'http://localhost:4000/avatars/'

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
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', upload.single('avatar'), function (req, res, next) {
  try {
    if (!req.file) {
      throw new Error("khong co file anh chai oi")
    } else {
      let urls = urlAvatar+"/"+req.file.filename;
      CreateSuccessRes(res, 200, urls)
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
