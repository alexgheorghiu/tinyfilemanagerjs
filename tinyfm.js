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

const start_path = __dirname;
let currentPath = null;


var http = require('http');
var url = require('url');
var fs = require('fs');
const os = require('node:os'); 

const getDirectories = source => 
    fs.readdirSync(source, {withFileTypes: true})
    .filter(direntry => direntry.isDirectory())
    .map(direntry => direntry.name)
    .sort((a,b) => -a.localeCompare(b));

const getFiles = source => 
fs.readdirSync(source, {withFileTypes: true})
.filter(direntry => direntry.isFile())
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

    //display current path
    res.write(`<div>Current path: ${currentPath}</div>`)
    res.write(`<hr/>`)

    //display directories    
    let dirs  = getDirectories(path);
    dirs.unshift('..');
    for(const dir in dirs){
        let fullFolderPath = encodeURIComponent(currentPath + '/' + dirs[dir]);
        res.write('<div class="folder">[' 
            + `<a href="/ls?path=${fullFolderPath}">`
            + dirs[dir] 
            + '</a>'
            + ']</div>');
    }

    //display files
    let files  = getFiles(path);
    for(const file in files){
        res.write('<div>' + files[file] + '</div>');
    }

    //display stats
    res.write('<hr/>');
    res.write(`<div>${start_path}</div>`);

    res.end();
}