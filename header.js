const headerGetToken =
{
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    'Origin': 'https://tg-app.memefi.club',
    'Referer': 'https://tg-app.memefi.club/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G988N Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Mobile Safari/537.36',
    'Sec-Ch-Ua': '"Android WebView";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Android"',
    'X-Requested-With': 'org.telegram.messenger',
}

const headerWithToken = (accessToken) => ({
    'Accept': '*/*',
    'Authorization': `Bearer ${accessToken}`,
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    'Origin': 'https://tg-app.memefi.club',
    'Referer': 'https://tg-app.memefi.club/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G988N Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Mobile Safari/537.36',
    'Sec-Ch-Ua': '"Android WebView";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Android"',
    'X-Requested-With': 'org.telegram.messenger'
});

module.exports = {
    headerGetToken,
    headerWithToken
}