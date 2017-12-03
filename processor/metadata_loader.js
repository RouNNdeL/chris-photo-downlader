'use strict';

const escapeRegExp = require("./support").escapeRegExp;
const asyncCall = require("./support").asyncCall;

const URL_BASE = require("./support").URL_BASE;
const URL_METADATA_ENDPOINT = URL_BASE + "/?type=337";

const REGEX_METADATA_PARAMS = /(photo\[.*?\])=(\d+)/g;
const REGEX_METADATA_DAYS = /<select.*name="photo\[day]".*>\s*([\s\S]*?)\s*<\/select>/;
const REGEX_METADATA_OPTION = /<option.*value="(.*?)".*>(.*?)<\/option>/;

function getMetadataParams(url)
{
    const regex = REGEX_METADATA_PARAMS;
    const params = {};

    try
    {
        url = decodeURI(url)
    }
    catch(e)
    {
    }

    let match;
    while((match = regex.exec(url)) !== null)
    {
        params[match[1]] = match[2];
    }

    return params;
}

async function getMetadataTexts(params)
{
    const texts = {};
    const html = await asyncCall(URL_METADATA_ENDPOINT, {method: "POST", form: params});

    for(let k in params)
    {
        if(!params.hasOwnProperty(k))
            continue;

        const regex = new RegExp("<select.*name=\"" + escapeRegExp(k) + "\".*>[\\s\\S]*?<option.*value=\"" + escapeRegExp(params[k])
            + "\".*selected.*>(.*?)<\\/option>[\\s\\S]*?<\\/select>");
        const match = html.match(regex);
        if(match !== null)
            texts[k] = match[1];
    }

    return texts;
}

async function getMetadataTextsFromUrl(url)
{
    const params = getMetadataParams(url);
    return getMetadataTexts(params);
}

async function generateDirName(url)
{
    const texts = await getMetadataTextsFromUrl(url);

    if(texts["photo[turnus]"] !== undefined)
    {
        return texts["photo[turnus]"] + "/" + texts["photo[day]"];
    }
    else if(texts["photo[camp]"] !== undefined && texts["photo[year]"] !== undefined)
    {
        return texts["photo[camp]"]+" "+texts["photo[year]"]+"/"+texts["photo[day]"];
    }
    throw new Error("Error: Cannot generate directory name");
}

async function getDays(url)
{
    const params = getMetadataParams(url);
    if(params["photo[day]"] !== undefined)
        return [params["photo[day]"]];

    const days = [];
    const html = await asyncCall(URL_METADATA_ENDPOINT, {method: "POST", form: params});
    const days_match = html.match(REGEX_METADATA_DAYS);

    if(days_match === null)
        return null;

    const regex = new RegExp(REGEX_METADATA_OPTION.source, "g");
    const daysMatch = days_match[1];
    let day_match;
    while((day_match = regex.exec(daysMatch)) !== null)
    {
        days.push(day_match[1]);
    }
    return days;
}

function isDay(url)
{
    const params = getMetadataParams(url);
    return params.hasOwnProperty("photo[day]");

}

module.exports.generateDirName = generateDirName;
module.exports.getDays = getDays;
module.exports.isDay = isDay;