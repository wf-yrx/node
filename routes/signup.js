var express = require('express');
var router = express.Router();
var request = require('request');
var formidable = require('formidable');
var path = require('path');
var app = express();
var fs = require('fs');
var multer = require('multer');
var os = require('os');

 const remoteUrl = 'https://iapi.caidian310.com';
// const remoteUrl = 'http://iapi.bzcp188.com';
// const remoteUrl = 'http://iapi.caidian310.cn';

router.use('/node_modules', express.static('node_modules'))
router.use('/uploads', express.static('uploads'))

router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})
app.use('/node_modules', express.static('node_modules'))
app.use('/uploads', express.static('uploads'))

// 处理上传图片接口
router.post("/common/upload/avatar", function (req, res, next) {
  var token = ''
  fs.readdir('./sessions', function (err, fileData) {
    fileData.sort(function (val1, val2) {
      var stat1 = fs.statSync('./sessions/' + val1);
      var stat2 = fs.statSync('./sessions/' + val2);
      return stat2.mtime - stat1.mtime;
    });
    var tokenPath = './sessions' + "/" + fileData[0]
    var data = fs.readFileSync(tokenPath, 'utf8', function (err, da) {
      if (err) throw err;
    });
    var data1 = fs.statSync(tokenPath);
    token = JSON.parse(data).token
    if (!token) {
      token = ""
    }
  })
  // 处理上传图片
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  form.uploadDir = os.tmpdir();
  form.keepExtensions = true;
  var imgPath = "";
  form.parse(req, function (err, fields, files) {
    if (err) throw err;
    imgPath = files.avatar.path
  });

  // 发送请求
  setTimeout(() => {
    var formData = {
      debug: "tianshui",
      token: token,
      my_file: fs.createReadStream(imgPath),
    }
    var avatarPath = remoteUrl + '/common/upload/avatar'
    request.post({
      url: avatarPath,
      json: true,
      formData: formData
    }, function (error, response, body) {
      if (error) throw error;
      if (!error) {
        res.send(body)
      }
    })

  }, 500)
})

// /* GET home page. */
router.post('/', function (req, res, next) {
  //   res.render('index', { title: 'nihao' });
});

module.exports = router;