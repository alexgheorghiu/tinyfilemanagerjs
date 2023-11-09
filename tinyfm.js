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

/*
TODO: limit navigation only to the initial folder (no escape through ..)
*/

// import os from 'node:os';

// const start_path = __dirname;
const start_path = '/home/alex/temp';
// let currentPath = null;


var http = require('http');
var url = require('url');
var fs = require('fs');
const os = require('node:os'); 
const path = require('path');

const mime_map = {
    'css' : 'text/css',
    'jpg' : 'image/jpg',        
    'png' : 'image/png'
 }

const getDirectories = source => 
    fs.readdirSync(source, {withFileTypes: true})
    .filter(direntry => direntry.isDirectory())
    .map(direntry => direntry.name)
    .sort((a,b) => -a.localeCompare(b));

const getFiles = source => 
    fs.readdirSync(source, {withFileTypes: true})
    .filter(direntry => direntry.isFile())
    .map(direntry => direntry.name)

const getParent = (filename, onlyName = false)=>{
    if(onlyName){
        return path.dirname(filename).split(path.sep).pop()
    }
    else {
        return path.resolve(filename, '..')
    }
}


http.createServer(function (req, res) {
    console.log('URL is:' + req.url)
    let q = url.parse(req.url, true);    
    console.log('Path is:' + q.pathname)

    const extension = path.extname(q.pathname).substring(1);

    if (q.pathname == '/info') {        
        info(req, res);
    }
    else if(q.pathname == '/ls'){
        ls(req, res);
    }
    else if(extension in mime_map){
        download_file(req, res);
    }
    else {
        welcome(req, res);
    }
    //res.writeHead(200, { 'Content-Type': 'text/html' });
    //var q = url.parse(req.url, true).query;
    //res.write(q);
    //var txt = q.year + " " + q.month;
    // res.end(txt);
    //res.end();
}).listen(8080);


function welcome(req, res){
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Welcome</h1>')
    res.write('This is a tiny web interface into a folder');

    res.end();
}


/**
 * 
 * @param {*} req 
 * @param {*} resp 
 * based on https://whyboobo.com/tutorials/download-files-in-js-from-nodejs/
 */
function download_file(req, resp){
    let q = url.parse(req.url, true);    
    const fileName = path.basename(q.pathname);
    const extension = path.extname(fileName).substring(1);

    try{
        // const fileName = 'app.css';
        const fileURL = `./${fileName}`;
        const stream = fs.createReadStream(fileURL);
        resp.setHeader('Content-Disposition', `attachment; filename='${fileName}'`);
        resp.setHeader('Content-Type', mime_map[extension]);
        
        stream.pipe(resp);
    } catch(e){
        console.error(e);
        resp.status(500).end();
    }    
}


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
    let rel_path = '';
    let q = url.parse(req.url, true).query;        
    if('path' in q){
        rel_path = q.path;
    }

    //OS's real path
    let final_path = start_path + /*path.sep +*/ rel_path;

    //check path to be inside the start_path
    if(!final_path.startsWith(start_path)){
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.write('Outside allowed folder');
        res.end();
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<h1>${final_path}</h1>`)
    res.write(`<link rel="stylesheet" type="text/css" href="/app.css">`);

    //display current path
    res.write(`<div>Current path: ${final_path}</div>`)
    res.write(`<hr/>`)

    //display directories    
    let dirs  = getDirectories(final_path);
    dirs.unshift('..');
    for(const dir in dirs){  
        let new_rel_path;
        if(dirs[dir] == '..'){
            let  parentPath = getParent(final_path);
            new_rel_path = parentPath.substring(start_path.length);
        }
        else{
            new_rel_path = rel_path + '/' + dirs[dir]
        }
        
        let new_rel_path_enc = encodeURIComponent(new_rel_path);
        let link =  '/ls' + (new_rel_path_enc == '' ? '' : `?path=${new_rel_path_enc}`) 
        res.write('<div class="folder_line">');
        res.write('<img src="./folder.png">');
        res.write('<span class="folder">'             
            + `<a href="${link}">`
            + dirs[dir] 
            + '</a>'
            + '</span>');
        res.write('</div>');
    }

    //display files
    let files  = getFiles(final_path);
    for(const file in files){
        res.write('<div class="file_line">');
        res.write('<img src="./file.png">');
        res.write('<span class="file">' + files[file] + '</span');
        res.write('</div>');
    }

    //display stats
    res.write('<hr/>');
    res.write(`<div>${start_path}</div>`);

    res.end();
}