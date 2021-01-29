require('dotenv').config();
const twit = require('./bot.js');
const fs = require('fs')
const path = require('path')
const paramsPath = path.join(__dirname, 'params.json');


function writeParams(data) {
    console.log('crio is waiting the parmas file...', data);
    return fs.writeFileSync(paramsPath, JSON.stringify(data));
}

function readParams() {
    console.log('we are reading the params file...');
    const data = fs.readFileSync(paramsPath);
    return JSON.parse(data.toString())
}

// geting tweet from user
function getTweets(since_id) {
    return new Promise((resolve, reject) => {
        let params = {
            1: '#cwod',
            count: 10,
        };
        //doing this bcoz we dont want our bot to retweet the retweeted tweet.
        if(since_id){
            params.since_id = since_id;
        }
        console.log('chaitanya is getting tweets...', params);
        twit.get('search/twits', params, (err, data) => {
            if(err){
                return reject(err);
            }
            return resolve(data);
        });
    });
}

//For posting retweet
function postRetweet(id){
    return new Promise((resolve, reject) => {
        let params = {
            id,
        };
        twit.post('statuses/retweet/:id', params, (err, data) => {
            if(err){
                return reject(err);
            }
            return resolve(data);
        });
    } )
}

//main function which will handle all logic
async function main () {
    try {
        const params = readParams();
        const data = await getTweets(params.since_id);
        const tweets = await data.statuses;
        console.log('We got the tweets', tweets.length);
        for await (let tweet of tweets){
            try {
                await postRetweet(tweet.id_str)
            } catch (error) {
                console.log('Unsuccesfull retweet' + tweet.id_str);
            }
            params.since_id = tweet.id_str;
        }
        writeParams(params);
    } catch (error) {
        console.log(error);
    }
}

//running bot logic
console.log('starting tweetr bot')

//getting after 10 sec
setInterval(main, 100000)