'use strict';

const downloader = require("./downloader");
const metadataLoader = require("./metadata_loader");
const Confirm = require("prompt-confirm");

async function process(url)
{
    if(url === null || url === undefined)
    {
        console.error("Please provide a URL");
        process.exit(-1);
    }

    console.log("Generating directory name...");
    let dir;
    try
    {
        dir = await metadataLoader.generateDirName(url);
        if(dir === null)
            dir = "Downloads";
    }
    catch(e)
    {
        const prompt = new Confirm("No day selected, do you want to download the whole batch?");
        if(await prompt.run())
        {
            console.log("Loading available days...");
            const days = await metadataLoader.getDays(url);
            console.log("Found " + days.length + " day" + (days.length > 1 ? "s" : ""));
            for(let i = 0; i < days.length; i++)
            {
                console.log("");
                await process(url + "&photo[day]=" + days[i], null);
            }
        }
        else
        {
            console.log("Aborting...");
        }
        return;
    }

    await
        downloader.download(url, dir);

}

module.exports.download = downloader.download;
module.exports.generateDirName = metadataLoader.generateDirName;
module.exports.process = process;