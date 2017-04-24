"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var botbuilder_1 = require("botbuilder");
var config_bot_1 = require("./support/config-bot");
var connector = new botbuilder_1.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new botbuilder_1.UniversalBot(connector);
config_bot_1.default(bot);
var Cookie = (function () {
    function Cookie(s1, s2, s3, s4, s5) {
        this.userName = s1;
        this.password = s2;
        this.credential = s3;
        this.jiraUrl = s4;
    }
    return Cookie;
}());
exports.cookie = new Cookie("", "", "", "", false);
exports.cookie.jiraUrl = "";
var app = express();
app.post('/api/messages', connector.listen());
var port = process.env.port || process.env.PORT || 3978;
app.listen(port, function () {
    console.log('Web Server listening on port %s', port);
});
