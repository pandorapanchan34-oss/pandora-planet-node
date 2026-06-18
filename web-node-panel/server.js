/**
 * PANDORA HYBRID GATEWAY — web-node-panel/server.js
 * (Web UI ⇄ UE5 リアルタイムデータ中継サーバー)
 */
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let webClient = null;
let ue5Client = null;

console.log("🌌 PANDORA GATEWAY: ポート 8080 で点火しました。");

wss.on('connection', (ws, req) => {
    const url = req.url;
    
    if (url === '/web') {
        webClient = ws;
        console.log("📱 WEB_NODE: コントロールパネルが同期しました。");
    } else if (url === '/ue5') {
        ue5Client = ws;
        console.log("🎮 UE5_WORLD: アンリアルエンジンが受肉しました。");
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        // ── 双方向データパルス相転移 ──
        if (url === '/web' && ue5Client) {
            // WebUI（マスター）からのサイバーコード防衛指示をUE5（3D世界）へ送信
            ue5Client.send(JSON.stringify(data));
        } else if (url === '/ue5' && webClient) {
            // UE5側で発生した電気パルスや原生生物（E）の襲撃データをWebUIへ送信
            webClient.send(JSON.stringify(data));
        }
    });

    ws.on('close', () => {
        if (ws === webClient) webClient = null;
        if (ws === ue5Client) ue5Client = null;
    });
});
