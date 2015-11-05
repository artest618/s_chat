/**
 * Created by tony on 15/9/19.
 */
var cluster = require('cluster');
var os  = require('os');

var numCPUs = os.cpus().length;

var workers = {};

    if(cluster.isMaster){
        //主进程分支
        cluster.on('death',function(worker){
            //工作进程结束时，重启工作进程
            delete workers[worker.pid];
            worker = cluster.fork();
            workers[worker.pid] = worker;
        });

        //初始开启与cpu 数量相同的工作进程
        for (var i = 0; i < numCPUs; i++){
            var worker = cluster.fork();
            workers[worker.pic] = worker;
        }

    } else {
        //工作进程分支
        var app = require('./myapp');
            app.listen(9003);
    }

    process.on('SIGTERM',function(){
        for(var pid in workers){
            process.kill(pid);
        }
        process.exit(0);
    })