'use strict';

const request = require("request");
const fs = require("fs");
const shell = require("shelljs");

const asyncCall = require("./support").asyncCall;

const URL_BASE = require("./support").URL_BASE;
const URL_PHOTO_ENDPOINT = URL_BASE + "?type=339";

const REGEX_ALBUM = /<a.*data-album-id="(\d+)".*?>(.*?)<span.*<\s*\/a>/;
const REGEX_PHOTO_URL = /<a\s*href="(.*?)".*\/><\/\s*a>/;
const REGEX_FILE_NAME = /.*\/(.*)$/;

async function getAlbumIds(url)
{
    const html = await asyncCall(url);

    const ids = {};
    const regex = new RegExp(REGEX_ALBUM.source, "g");
    let match;
    while((match = regex.exec(html)) !== null)
    {
        ids[match[1]] = match[2];
    }
    return ids;
}

async function loadImageHtml(albumId)
{
    return await asyncCall(URL_PHOTO_ENDPOINT,
        {
            method: "POST",
            form: {
                albumId: albumId
            }
        });
}

function processImageHtml(html)
{
    const urlArray = [];
    const lines = html.split("\n");
    for(let i = 0; i < lines.length; i++)
    {
        const match = lines[i].match(REGEX_PHOTO_URL);
        if(match !== null)
            urlArray.push(match[1]);
    }
    return urlArray;
}

function downloadImages(urlArray, path)
{
    path += (path.charAt(path.length - 1) === "/" ? "" : "/");
    if(!fs.existsSync(path))
    {
        shell.mkdir('-p', path);
    }
    for(let i = 0; i < urlArray.length; i++)
    {
        const url = urlArray[i];
        const match = url.match(REGEX_FILE_NAME);
        const name = (match === null ? url : match[1]);
        downloadImage(URL_BASE+url, path + name);
    }
}

function downloadImage(url, path)
{
    const stream = fs.createWriteStream(path);
    stream.on('error', function(err)
    {
        console.error(err);
    });
    request(url).pipe(stream);
}

async function execute(url, path)
{
    let albumIds = await getAlbumIds(url);
    if(Object.keys(albumIds).length === 0)
    {
        console.error("The provided URL doesn't seem to be valid. Please try a different one.\n" +
            "(Error: unable to find albumId)");
        process.exit(-2);
    }
    console.log("Got "+Object.keys(albumIds).length+" album id"+(Object.keys(albumIds).length > 1 ? "s" : "")+"\n");
    for(let k in albumIds)
    {
        if(!albumIds.hasOwnProperty(k))
            continue;
        let imageHtml = await loadImageHtml(k);
        console.log("Got image data for album '"+albumIds[k]+"' with id: "+k);
        let urls = processImageHtml(imageHtml);
        console.log("Got "+urls.length+" image URL"+(urls.length > 1 ? "s" : ""));
        console.log("Starting download...");
        downloadImages(urls, path+"/"+albumIds[k]);
    }
}

module.exports.download = execute;