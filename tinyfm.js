/**
 * Tiny File Manager
 */

/**
cd [v]
ls [v]   
mkdir [v]
rename
upload 
delete [v]
*/

/*
TODO: 
*/

// import os from 'node:os';

// const start_path = __dirname;
const PORT = 8080;
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
    .sort((a,b) => a.localeCompare(b));

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

//@see https://stackoverflow.com/questions/10348906/how-to-know-if-a-request-is-http-or-https-in-node-js
const isHTTPs = (req) => 'encrypted' in req.connection

function error(req, res, mesg){
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.write(`${mesg}`);
    res.end();
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
    else if(q.pathname == '/mkdir'){
        mkdir(req, res);
    }
    else if(q.pathname == '/rm'){
        rm(req, res);
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
}).listen(PORT);


function welcome(req, res){
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Welcome</h1>')
    res.write('This is a tiny web interface into a folder');
    res.write('<ul>');
    res.write(`<li><a href="/ls">File Manager</a></li>`);
    res.write(`<li><a href="/info">Info</a></li>`);
    res.write('</ul>');
    

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

    const { version } = require('node:process');

    let info = {};
    info['os'] = os.platform();
    info['no. CPUs '] = os.cpus().length
    info['node version'] = version

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

    //new folder
    res.write(
        `<form action='./mkdir'>
                <input name="parentFolder" type="hidden" value="${rel_path}"/>
                New Folder <input name="newFolder" type="text"/>
                <input type="submit" value="Create"/>
        </form>`
    );
    res.write(`<hr/>`)

    //display directories    
    let dirs  = []
    try {
        dirs = getDirectories(final_path);
    } catch(e){
        console.error(e)
    }

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
        let visit_link =  '/ls' + (new_rel_path_enc == '' ? '' : `?path=${new_rel_path_enc}`) 
        let delete_link =  `/rm?parentFolder=${rel_path}&forDeleteFile=${encodeURIComponent(dirs[dir])}`;
        
        res.write('<div class="folder_line">');
        res.write('<img src="./folder.png">');
        res.write('<span class="folder">'             
            + `<a href="${visit_link}">` + dirs[dir] + '</a>'
            + '</span>');
        res.write('<span class="delete">'             
            + `<a href="${delete_link}"> [delete]</a>`
            + '</span>');
        res.write('</div>');
    }

    //display files
    let files  = [];
    try {
        files = getFiles(final_path);
    } catch (error) {
        console.error(error)
    }
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

function mkdir(req, res){
    let rel_parent_folder = '';
    let new_folder = '';
    let p  = url.parse(req.url, true);
    let q = p.query;        
    if('parentFolder' in q){
        rel_parent_folder = q.parentFolder;
    }
    else{
        error(req, res, 'Parent folder not specified')
    }

    if('newFolder' in q){
        new_folder = q.newFolder;
    }
    else{
        error(req, res, 'New folder not specified')
    }

    let finalPath = start_path + rel_parent_folder + path.sep + new_folder;
    

    let redirectURL = (isHTTPs(req) ? 'https' : 'http')
        + '://'
        + req.headers.host 
        + `/ls?path=${rel_parent_folder}`;

    try{    
        fs.mkdirSync(finalPath);
    } catch(e){
        console.error(e);
    }

    res.writeHead(301, {
        Location: `${redirectURL}`
    }).end();
}

function rm(req, res){
    let rel_parent_folder = '';
    let forDeleteFile = '';
    let p  = url.parse(req.url, true);
    let q = p.query;        
    if('parentFolder' in q){
        rel_parent_folder = q.parentFolder;
    }
    else{
        error(req, res, 'Parent folder not specified')
    }

    if('forDeleteFile' in q){
        forDeleteFile = q.forDeleteFile;
    }
    else{
        error(req, res, 'For delete file not specified')
    }

    let finalPath = start_path + rel_parent_folder + path.sep + forDeleteFile;
    

    let redirectURL = (isHTTPs(req) ? 'https' : 'http')
        + '://'
        + req.headers.host 
        + `/ls?path=${rel_parent_folder}`;

    try{    
        if(fs.lstatSync(finalPath).isDirectory()){
            fs.rmdirSync(finalPath, { recursive: true, force: true });
        }
        else if(fs.lstatSync(finalPath).isFile()){
            fs.unlinkSync(finalPath);
        }
        else{
            error(req, reep, 'Unhandled case.');
        }

        fs.rmdirSync();
    } catch(e){
        console.error(e);
    }

    res.writeHead(301, {
        Location: `${redirectURL}`
    }).end();
}

