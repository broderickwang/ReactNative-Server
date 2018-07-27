var express = require('express');
var router = express.Router();
var fs = require('fs');
var PATH = './public/data/';

/* 读取数据 */
router.get('/read', function(req, res, next) {
    var type = req.param("type") || '';
    fs.readFile(PATH+type+'.json',function (err, data) {
        if(err){
            return res.send({
                status:0,
                info:"读取服务失败"
            })
        }
        var COUNT = 50;
        var obj = [];
        try {
            obj = JSON.parse(data.toString());
        }catch (e) {
            obj = [];
        }

        if (obj.length > COUNT){
            obj = obj.slice(0,COUNT);
        }
        res.send({
            status:1,
            data:obj
        })
    });

});

/**
 * 数据存储
 */
router.post('/write',function (req,res,next) {
    var type = req.param("type") || '';

    var url = req.param("url") ||'';
    var title = req.param("title") || '';
    var img = req.param("img")||'';

    if(!type || !url || !title || !img){
        return res.send({status:0,info:"提交字段不全"})
    }

    //1 read data
    var filePath = PATH+type+'.json';
    fs.readFile(filePath,function (err,data) {
        if(err){
            return res.send({status:0,info:"读取失败"})
        }

        var arr = JSON.parse(data.toString());
        var obj = {
            title : title,
            url : url,
            img : img,
            id : guidGenerator(),
            time : new Date()
        }
        arr.splice(0,0,obj);
        //2 write data to file
        var newData = JSON.stringify(arr);
        fs.writeFile(filePath,newData,function (err, data) {
            if(err){
                return res.send({status:0,info:"写入文件失败"})
            }
            return res.send({status:1,info:"保存成功",data:newData})
        });
    })
});

/**
 * 阅读模块写入接口
 */
//阅读模块写入接口 后台开发使用
router.post('/write_config', function(req, res, next){
    if(!req.session.user){
        return res.send({
            status: 0,
            info: '未鉴权认证'
        });
    }
    //TODO:后期进行提交数据的验证
    //防xss攻击 xss
    // npm install xss
    // require('xss')
    // var str = xss(name);
    var data = req.body.data;
    var obj = [];
    try {
        obj = JSON.parse(data);
    }catch (e){
        return res.send({status:0,info:"数据存储失败"})
    }
    var newData = JSON.stringify(obj);
    //写入
    fs.writeFile(PATH + 'config.json', newData, function(err){
        if(err){
            return res.send({
                status: 0,
                info: '写入数据失败'
            });
        }
        return res.send({
            status: 1,
            info: obj
        });
    });
});

//登录接口
router.post('/login',function (req, res, next) {
    // username password
    var username = req.body.username;
    var password = req.body.password;

    if (username==='admin' && password == '123456'){
        req.session.user = {username:username}
        return res.send({status:1,info:"登录成功"});
    }
    return res.send({status:0,info:"登录失败"});
})


function guidGenerator(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/{xy}/g,function (c) {
        var r  = Math.random() * 16 | 0,
            v = c == 'x'?r:(r & 0x3|0x8);
        return v.toString(16);
    }).toUpperCase();
}

module.exports = router;
