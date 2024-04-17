var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const qs = require("qs");
const FileSync = require("lowdb/adapters/FileSync");
const lowdb_1 = __importDefault(require("lowdb"));
const _config = {
    HOST_URL: "https://testnet.binancefuture.com",
    API_KEY: "",
    API_SECRET: ""
};
const _buildSign = (data, config) => {
    return crypto_1.default.createHmac('sha256', config.API_SECRET).update(data).digest('hex');
};
const privateRequest = async (data, endPoint, type) => {
    let adapter = new FileSync('data/db.json');
    let db = (0, lowdb_1.default)(adapter);
    _config.API_KEY = db.get('user').value().API.APIKEY;
    _config.API_SECRET = db.get('user').value().API.APISECRET;
    data.timestamp = Date.now();
    const dataQueryString = qs.stringify(data);
    const signature = _buildSign(dataQueryString, _config);
    const requestConfig = {
        method: type,
        url: _config.HOST_URL + endPoint + '?' + dataQueryString + '&signature=' + signature,
        headers: {
            'X-MBX-APIKEY': _config.API_KEY,
        }
    };
    try {
        const response = await (0, axios_1.default)(requestConfig).then(r => r.data);
        console.log(requestConfig.url);
        return response;
    }
    catch (err) {
        console.log(err);
        return err;
    }
};
exports.privateRequest = privateRequest;
//# sourceMappingURL=core.js.map