'use strict';

const request = require("request");
const URL_BASE = "http://www.chris.com.pl/";

function asyncCall(url, options = {})
{
    return new Promise((resolve, reject) =>
    {
        request(url, options, (err, resp, cont) =>
        {
            if(err === null)
                resolve(cont);
            else
                reject(err);
        });
    })
}

function escapeRegExp(str)
{
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports.URL_BASE = URL_BASE;
module.exports.asyncCall = asyncCall;
module.exports.escapeRegExp = escapeRegExp;