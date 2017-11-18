const fs = require('fs');
const request = require('request');
const notifier = require('node-notifier');

const url = 'https://tickets.fifa.com/API/WCachedL1/en/BasicCodes/GetBasicCodesTST?currencyId=USD&productTeamId=';
const teamsID = {
    Argentina: 'ARG',
    Australia: 'AUS',
    Belgium: 'BEL',
    Brazil: 'BRA',
    Colombia: 'COL',
    CostaRica: 'CRC',
    Croatia: 'CRO',
    Denmark: 'DEN',
    Egypt: 'EGY',
    England: 'ENG',
    France: 'FRA',
    Germany: 'GER',
    Iceland: 'ISL',
    Iran: 'IRN',
    Japan: 'JPN',
    KoreaRepublic: 'KOR',
    Mexico: 'MEX',
    Morocco: 'MAR',
    Nigeria: 'NGA',
    Panama: 'PAN',
    Peru: 'PER',
    Poland: 'POL',
    Portugal: 'POR',
    Russia: 'RUS',
    SaudiArabia: 'KSA',
    Senegal: 'SEN',
    Serbia: 'SRB',
    Spain: 'ESP',
    Sweden: 'SWE',
    Switzerland: 'SUI',
    Tunisia: 'TUN',
    Uruguay: 'URU'
};

async function main () {
    while (true) {
        request({
            url: `${url}${teamsID.Argentina}`,
            json: true
        }, async function (error, response, body) {
            if (!error && response.statusCode === 200) {
                const cachedString = await readFile('fifa.json');

                const newString = JSON.stringify(body);
                if (cachedString !== newString) {
                    checkAvailability(body);
                    fs.writeFile('fifa.json', newString, (err) => {
                        if (err) throw err;
                        console.log('saved!');
                    });

                }
            }
        });

        await timeout(1500); // set your own time interval in milliseconds
    }
}

async function timeout (ms) { return new Promise(res => setTimeout(res, ms)); }

function checkAvailability (data) {
    try {
        const pricesArray = data.Data.PRODUCTPRICES;
        const available = pricesArray.findIndex((product) => ['CAT 1', 'CAT 2', 'CAT 3'].includes(product.CategoryName) && product.Availability !== 0);
        if (available >= 0) {
            console.log(`available!!!`);
            sendAlertMail();

            notifier.notify('Message');
            notifier.notify({
                'title': 'Available Tickets',
                'message': 'Available Tickets!!!'
            });
        }
    }
    catch (ex) {
        console.log(ex);
    }
}

function sendAlertMail () {
    const apiKey = 'YOUR_API_KEY';  // your sendgrid api key here!
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(apiKey);
    const msg = {
        to: 'your@email.com', // your email here
        from: 'your@email.com', // your email here
        subject: 'Available Tickets',
        text: 'Available Tickets',
    };
    sgMail.send(msg);
}

function readFile (filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (e, data) => {
            if (e) reject(e);
            resolve(data);
        })
    })
}

main();
