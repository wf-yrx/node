var express = require('express');
var request = require('request');
var md5 = require('md5');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
const path = require('path')
const privateKey = '@(hongdianbao#@!)@';
var formidable = require('formidable');
var app = express();
var fs = require('fs');
var multer = require('multer');
var os = require('os');

const remoteUrl = 'http://iapi.hongdianbao.com';
// const remoteUrl = 'http://iapi.hongdianbao.xyz';
const platform = 'h5';
const version = 1000;

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'))
})

router.use('/node_modules', express.static('node_modules'))
router.use('/uploads', express.static('uploads'))


var FileStore = require('session-file-store')(session);
router.use(
    session({
        secret: '12345',
        name: 'hongdianbao', //这里的name值得是cookie的name，默认cookie的name是：connect.sid
        cookie: {
            maxAge: 604800000
        }, //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
        resave: false,
        saveUninitialized: true,
        store: new FileStore(path),
    })
);
router.use(bodyParser.json());
router.all("*", function (req, res, next) {
    var path = req.path;
    // console.log('看看path',path)
    var url = remoteUrl + path;
    var query = {}
    query = Object.assign(query, req.body, req.query);
    var params = sign(query, req);
    console.log('看看params', params)

    if (path == "/common/upload/avatar") {
        // 处理上传图片
        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.uploadDir = os.tmpdir();
        form.keepExtensions = true;
        var imgPath = "";
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log('错误', err)
            } else {
                imgPath = files.avatar.path
            }

        });
        var avatarPath = remoteUrl + '/common/upload/avatar'
        setTimeout(() => {
            // var formData = {
            //     // params,
            //     debug: "tianshui",
            //     token: params.token,
            //     my_file: fs.createReadStream(imgPath),
            // }

            params.my_file = fs.createReadStream(imgPath)
            var formData = params
            request.post({
                url: avatarPath,
                json: true,
                formData: formData
            }, function (error, response, body) {
                if (error) {
                    var obj = {
                        code: 505,
                        msg: '上传图片出错',
                        err: error,
                    }
                    var str = JSON.stringify(obj)
                    res.send(str)
                }
                if (!error) {
                    res.send(body)
                }
            })

        }, 500)

    } else {
        var formData = params
        request.post({
            // url   : "http://iapi.bzcp188.com/main/news/lists?debug=tianshui&page=1&page_size=2",
            url,
            json: true,
            formData: formData
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                if (body.data && body.data.token) {

                    req.session.token = body.data.token;
                    if (req.path == "/user/phone/get_password" || req.path == "/user/phone/change_phone") {
                        req.session.token = "";
                    }
                    delete body.data.token;
                }
                res.send(body);
            } else {

                console.log("看看是什么错", error)

                if (!error) {
                    var obj = {
                        code: 508,
                        msg: '后台未知错误',
                        err: error,
                    }
                } else {
                    var obj = {
                        code: 507,
                        msg: '传过来的路径有问题',
                        err: error,
                    }
                }



                var str = JSON.stringify(obj)

                res.send(str)

            }

        });

    }

    // next();
});


function sign(query, req) {
    var time = Math.ceil(Date.now() / 1000);
    var random = Math.ceil(Math.random() * 1000000);
    // var token = util.getCookie("token")  || "";
    // console.log(req.cookies);
    // var token = req.cookies.get("token") || "";
    var token = req.session.token || "";
    // console.log("333",req.session);
    query['t'] = time;
    query['r'] = random;
    query['v'] = version;
    query['p'] = platform;
    query['token'] = token;
    // console.log("333", req.session);
    var keys = Object.keys(query);
    keys.sort();

    var str = '';
    for (var i in keys) {
        var key = keys[i];
        var value = query[key];
        str += key + privateKey + value;
    }
    var sign = md5(str);
    query['sign'] = sign;
    return query;
}


module.exports = router;