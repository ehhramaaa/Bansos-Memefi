const { headerGetToken, headerWithToken } = require('./header')
const { SocksProxyAgent } = require('socks-proxy-agent');
const { StoreSession } = require("telegram/sessions");
const { Api, TelegramClient } = require("telegram");
const register = require("./register")
const { clear } = require('console');
const fetch = require("node-fetch")
const input = require("input");
const fs = require("fs");
const { queryAccessToken, queryGetProfile, querySendTaps, queryNextBoss, queryApplyBooster } = require("./query")

require('dotenv').config();
const apiId = 28285888;
const apiHash = "144e7bafbe0ac8c60a7cd56133b91add";
const apiUrl = "https://api-gw-tg.memefi.club/graphql";
const sessionPath = "./sessions/"
const phonePath = "./phone.txt"
const proxyDomain = [
    "tor.socks.ipvanish.com",
    "par.socks.ipvanish.com",
    "fra.socks.ipvanish.com",
    "lin.socks.ipvanish.com",
    "nrt.socks.ipvanish.com",
    "ams.socks.ipvanish.com",
    "waw.socks.ipvanish.com",
    "lis.socks.ipvanish.com",
    "sin.socks.ipvanish.com",
    "sea.socks.ipvanish.com",
    "sto.socks.ipvanish.com",
    "iad.socks.ipvanish.com",
    "atl.socks.ipvanish.com",
    "chi.socks.ipvanish.com",
    "dal.socks.ipvanish.com",
    "den.socks.ipvanish.com",
    "lax.socks.ipvanish.com",
    "lon.socks.ipvanish.com",
    "nyc.socks.ipvanish.com",
    "mia.socks.ipvanish.com",
    "phx.socks.ipvanish.com",
    "syd.socks.ipvanish.com",
]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkIp(proxy) {
    try {
        const response = await fetch(`https://freeipapi.com/api/json`, { agent: proxy });
        const data = await response.json();
        return [data.ipAddress, data.countryName];
    } catch (error) {
        console.error('Error fetching IP details:', error.message);
        return 'error';
    }
}

async function getAccessToken(authQuery, retryCount = 3, proxy) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headerGetToken,
            body: JSON.stringify(authQuery),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        if (responseJson.data === null) {
            throw new Error(`HTTP error! status: ${responseJson.errors.message}`);
        }

        if ('telegramUserLogin' in responseJson.data) {
            console.log('Successfully Get Access Token');
            return responseJson.data.telegramUserLogin.access_token;
        } else {
            console.log('No access token found in the response.');
            if (retryCount > 0) {
                console.log(`Retrying... attempts left: ${retryCount}`);
                return getAccessToken(authData, retryCount - 1, proxy);
            } else {
                throw new Error('Failed to get access token after multiple attempts.');
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function getAccountInfo(accessToken, proxy) {
    console.log("[ACCOUNT INFO]")

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headerWithToken(accessToken),
            body: JSON.stringify(queryGetProfile),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();


        console.log('coinsAmount\t:', responseJson.data.telegramGameGetConfig.coinsAmount)
        console.log('currentEnergy\t:', responseJson.data.telegramGameGetConfig.currentEnergy)
        console.log('maxEnergy\t:', responseJson.data.telegramGameGetConfig.maxEnergy)

        console.log("[BOSS INFO]")
        console.log('level\t:', responseJson.data.telegramGameGetConfig.currentBoss.level)
        console.log('currentHealth\t:', responseJson.data.telegramGameGetConfig.currentBoss.currentHealth)
        console.log('maxHealth\t:', responseJson.data.telegramGameGetConfig.currentBoss.maxHealth)

        console.log("[BOOST INFO]")
        console.log('TurboAmount\t:', responseJson.data.telegramGameGetConfig.freeBoosts.currentTurboAmount)
        console.log('RefillAmount\t:', responseJson.data.telegramGameGetConfig.freeBoosts.currentRefillEnergyAmount)

        console.log("[LEVEL INFO]")
        console.log('weaponLevel\t:', responseJson.data.telegramGameGetConfig.weaponLevel)
        console.log('energyLimitLevel:', responseJson.data.telegramGameGetConfig.energyLimitLevel)
        console.log('tapBotLevel\t:', responseJson.data.telegramGameGetConfig.tapBotLevel)

        return [responseJson.data.telegramGameGetConfig.nonce, responseJson.data.telegramGameGetConfig.weaponLevel, responseJson.data.telegramGameGetConfig.freeBoosts.currentTurboAmount, responseJson.data.telegramGameGetConfig.freeBoosts.currentRefillEnergyAmount, responseJson.data.telegramGameGetConfig.currentBoss.currentHealth]

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function sendTaps(accessToken, nonce, weaponLevel, proxy) {
    console.log("[SEND TAPS]")

    let limitTap = Math.floor(Math.random() * (200 - 50 + 1)) + 50
    let currentEnergy = 0
    let taps

    do {
        if (weaponLevel <= 5) {
            if (currentEnergy <= 200) {
                taps = Math.floor(Math.random() * (50 - 10 + 1)) + 10
            } else {
                taps = Math.floor(Math.random() * (400 - 200 + 1)) + 200
            }
        } else {
            if (currentEnergy <= 200) {
                taps = Math.floor(Math.random() * (5 - 1 + 1)) + 1
            } else {
                taps = Math.floor(Math.random() * (50 - 10 + 1)) + 10
            }
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headerWithToken(accessToken),
                body: JSON.stringify(querySendTaps(nonce, taps)),
                agent: proxy
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseJson = await response.json();

            if ('telegramGameProcessTapsBatch' in responseJson.data) {
                currentEnergy = responseJson.data.telegramGameProcessTapsBatch.currentEnergy
                console.log('Success Tap-Tap, Current Energy:', currentEnergy)
                await sleep(Math.floor(Math.random() * (500 - 300 + 1)) + 300)
            } else {
                console.log("Send Taps:", responseJson.data)
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    } while (currentEnergy >= limitTap)
    console.log("Energy Already Limit")
}

async function applyBoost(accessToken, typeBoost, proxy) {
    console.log("[CLAIM SPECIAL BOX]")

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headerWithToken(accessToken),
            body: JSON.stringify(queryApplyBooster(typeBoost)),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        if (responseJson.data.telegramGameActivateBooster) {
            console.log(`applyBoost${typeBoost} Success`)
        } else {
            console.log(`applyBoost${typeBoost}:`, responseJson.data)
        }

    } catch (error) {
        console.error('Error:', error.message);

    }
}

async function setNewBoss(accessToken, proxy) {
    console.log("[SET NEXT BOSS]")

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headerWithToken(accessToken),
            body: JSON.stringify(queryNextBoss),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        console.log("setNewBoss:", responseJson.data)
    } catch (error) {
        console.error('Error:', error.message);

    }
}


(async () => {
    process.on('SIGINT', () => {
        console.log('Exiting...');
        process.exit();
    })

    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath);
    }

    const phone = fs.readFileSync(phonePath, 'utf-8').split(/\r?\n/).map(line => line.replace(/\s/g, '')).filter(line => line !== '');

    // Login Telegram
    for (const number of phone) {
        const sessions = new StoreSession(`${sessionPath}${number}`);
        await register(TelegramClient, sessions, apiId, apiHash, number, input)
    }
    // End Login Telegram

    console.log("Clearing Screen ......");
    await sleep(3000)

    // Clear Screen
    clear()

    while (true) {
        let index = 0;
        for (const number of phone) {
            console.log(`\n<=====================[${number}]=====================>`);
            const proxyUrl = `socks5://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@${proxyDomain[index]}:1080`;
            const proxy = new SocksProxyAgent(proxyUrl)

            const sessions = new StoreSession(`${sessionPath}${number}`);
            const client = new TelegramClient(sessions, apiId, apiHash, {
                connectionRetries: 5,
            });

            client.setLogLevel("none")

            await client.start({
                phoneNumber: number,
                onError: (err) => console.log(err.message),
            });

            client.setLogLevel("none");

            const auth = await client.invoke(
                new Api.messages.RequestWebView({
                    peer: "memefi_coin_bot",
                    bot: "memefi_coin_bot",
                    fromBotMenu: false,
                    platform: 'android',
                    url: "https://tg-app.memefi.club/game",
                })
            );

            const authData = decodeURIComponent(decodeURIComponent(auth.url.split('tgWebAppData=')[1].split('&tgWebAppVersion')[0]));

            const splitAuth = {
                authDate: parseInt(authData.split('auth_date=')[1].split('&hash')[0]),
                hash: authData.split('hash=')[1],
                queryId: authData.split('query_id=')[1].split('&user')[0],
                id: parseInt(authData.split('"id":')[1].split(',"first_name"')[0]),
                firstName: authData.split('"first_name":"')[1].split('","last_name"')[0],
                lastName: authData.split('"last_name":"')[1].split('","username"')[0],
                username: authData.split('"username":"')[1].split('","language_code"')[0],
            }

            const authQuery = queryAccessToken(splitAuth.authDate, splitAuth.hash, splitAuth.queryId, splitAuth.id, splitAuth.firstName, splitAuth.lastName, splitAuth.username)

            const accessToken = await getAccessToken(authQuery, 3, proxy)

            if (accessToken !== null) {
                const infoIp = await checkIp(proxy);

                if (infoIp !== 'error') {
                    const [ip, country] = infoIp;
                    console.log("[CHECK IP]")
                    console.log(`Ip\t:${ip}`)
                    console.log(`Country\t:${country}`)
                }

                const accountInfo = await getAccountInfo(accessToken, proxy)

                if (Array.isArray(accountInfo)) {
                    const [nonce, weaponLevel, turboBalance, refillBalance, bossHealth] = accountInfo;

                    await sendTaps(accessToken, nonce, weaponLevel, proxy)

                    for (let i = 0; i < turboBalance; i++) {
                        await applyBoost(accessToken, "Turbo", proxy)
                        await sleep(3000)
                        await sendTaps(accessToken, nonce, weaponLevel, proxy)
                    }

                    for (let i = 0; i < refillBalance; i++) {
                        await applyBoost(accessToken, "Recharge", proxy)
                        await sleep(3000)
                        await sendTaps(accessToken, nonce, weaponLevel, proxy)
                    }

                    if (bossHealth <= 0) {
                        await setNewBoss(accessToken, proxy)
                        await sleep(3000)
                    }
                } else {
                    console.log("accountInfo:", accountInfo)
                }

                index++
            }

        }

        const rest = Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000
        console.log(`Rest For ${((rest / 1000) / 60)} Minute`)
        await sleep(rest)
    }
})()