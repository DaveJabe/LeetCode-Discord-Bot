
const eris = require('eris');
const cheerio = require('cheerio');
const axios = require("axios");
const pretty = require('pretty');
const express = require('express');

// loading in filesystem to parse json
const fs = require('fs');

var token = JSON.parse(fs.readFileSync('./auth.json').toString())["token"];

const url1 = "https://leetcode.com/problem-list/top-interview-questions/";
const url2 = "https://leetcode.com/problem-list/top-100-liked-questions/";

// create a client instance with our bot token
const bot = new eris.Client(token);

async function scrapeData(url) {
    try {
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        const listItems = $('a')
        hRefs = [];

        listItems.each((idx, element) => {
            const title = $(element).attr('href');
            hRefs.push(title);
        })

        hRefs = hRefs.filter((hRef) => hRef.startsWith("/problems/") && !hRef.includes("/solution"));

        return hRefs

    }
    catch (error) {
        console.log(error);
    }
}

function randomProblem(hRefs) {
    const randomProblem = hRefs[Math.floor(Math.random() * hRefs.length)];
    return "https://leetcode.com" + randomProblem;
}

async function dailyProblem() {
    try {
        const urls = [url1, url2];
        const url = urls[Math.floor(Math.random() * urls.length)];

        const hRefs = await scrapeData(url);
        return "Here's today's problem! \nGood luck! \n\n" + randomProblem(hRefs);
        

    } catch (err) {
        console.warn('Failed to respond to mention.');
        console.warn(err);
    }
}

// when the bot is connected and ready, log to console
bot.on('ready', () => {
    console.log('Connected and ready');
});

// Every time a message is sent anywhere the bot is present,
// this event will fire and we will check if the bot was mentioned.
// If it was, the bot will attempt to respond with "Present".
bot.on('messageCreate', async (msg) => {

    if (msg.content === "?start daily timer") {

        const prob = await dailyProblem();
        await msg.channel.createMessage(prob);

        const oneMinute = 60000;
        const oneHour = oneMinute * 60;
        const oneDay = oneHour * 24;

        setInterval(async () => {
            const prob = await dailyProblem();
            await msg.channel.createMessage(prob);
        }, oneDay);
    }

    if (msg.content.startsWith("?np")) {

        const args = msg.content.split(' ');

        if (args.length < 2) {

            msg.channel.createMessage(" Please enter from which list you would like me to pick a new problem.  \n\nOption 1: Top Interview Questions \n\nOption 2: Top 100 Liked Questions");
                        
        } else {

             switch (args[1]) {
                case "1":
                    try {
                        const hRefs = await scrapeData(url1);
                
                        await msg.channel.createMessage("Here's a brand new problem from Top Interview Questions! \nGood luck! \n\n" + randomProblem(hRefs));
                    } catch (err) {
                        // There are various reasons why sending a message may fail.
                        // The API might time out or choke and return a 5xx status,
                        // or the bot may not have permission to send the message (403 status).
                        console.warn('Failed to respond to mention.');
                        console.warn(err);
                    }
                    break;
                case "2":
                    try {
                        const hRefs = await scrapeData(url2);
                
                        await msg.channel.createMessage("Here's a brand new problem from Top 100 Liked Questions! \nGood luck! \n\n" + randomProblem(hRefs));

                    } catch (err) {
                        console.warn('Failed to respond to mention.');
                        console.warn(err);
                    }
                    break;
                default:
                    msg.channel.createMessage("Please pick a valid number! \n\nOption 1: Top Interview Questions \n\nOption 2: Top 100 Liked Questions");
                }
            }
        }
    }
);

bot.on('error', err => {
    console.warn(err);
});

bot.connect();


