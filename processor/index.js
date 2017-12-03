'use strict';

const downloader = require("./downloader");
const metadataLoader = require("./metadata_loader");
const Confirm = require("prompt-confirm");

const REGEX_URL = /(https?:\/\/)?(www\.)?chris\.com\.pl\/dla-uczestnikow\/fotorelacje-campy/;

async function processUrl(url, batch = false)
{
    if(url === null || url === undefined || url.match(REGEX_URL) === null)
    {
        console.error("Please provide a valid URL");
        process.exit(-1);
    }

    if(!metadataLoader.isDay(url))
    {
        const prompt = new Confirm("No day selected, do you want to download the whole batch?");
        if(await prompt.run())
        {
            await processDays(url);
        }
        else
        {
            console.log("Aborting...");
        }
        return;
    }

    if(batch)
    {
        await processDays(url);
    }
    else
    {
        let dir = await metadataLoader.generateDirName(url);
        await downloader.download(url, dir);
    }
}

async function processDays(url)
{
    console.log("Loading available days...");
    const days = await metadataLoader.getDays(url);
    console.log("Found " + days.length + " day" + (days.length > 1 ? "s" : ""));
    for(let i = 0; i < days.length; i++)
    {
        console.log("");
        await processUrl(url + "&photo[day]=" + days[i], false);
    }
}

module.exports.download = downloader.download;
module.exports.generateDirName = metadataLoader.generateDirName;
module.exports.process = processUrl;