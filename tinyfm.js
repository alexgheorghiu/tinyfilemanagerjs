/**
 * Tiny File Manager
 */

/**
cd 
ls
mkdir
rename
upload 
delete  
*/

// import os from 'node:os';

let currentPath = null;


var http = require('http');
var url = require('url');
var fs = require('fs');
const os = require('node:os'); 

const getDirectories = source => 
    fs.readdirSync(source, {withFileTypes: true})
    .filter(direntry => direntry.isDirectory)
    .map(direntry => direntry.name)

http.createServer(function (req, res) {
    console.log('URL is:' + req.url)
    let q = url.parse(req.url, true);    
    console.log('Path is:' + q.pathname)

    if (q.pathname == '/info') {        
        info(req, res);
    }
    else if(q.pathname == '/ls'){
        ls(req, res);
    }
    //res.writeHead(200, { 'Content-Type': 'text/html' });
    //var q = url.parse(req.url, true).query;
    //res.write(q);
    //var txt = q.year + " " + q.month;
    // res.end(txt);
    //res.end();
}).listen(8080);

function info(req, res){
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Info</h1>')
    let info = {};
    info['os'] = os.platform();
    info['no. CPUs '] = os.cpus().length
    info['altele'] = 'ce?'

    // res.write(typeof info);
    res.write('<ul>');
    for(const key in info){
        res.write('<li>' + key + ':' + info[key] + '</li>');    
    }
    res.write('</ul>');

    res.end();
}

function ls(req, res){
    let q = url.parse(req.url, true).query;    
    let path = '.';
    if('path' in q){
        path = q.path;
    }

    currentPath = path;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<h1>${path}</h1>`)
    let dirs  = getDirectories(path);
    for(const dir in dirs){
        res.write('<div>' + dirs[dir] + '</div>');
    }
    res.end();
}