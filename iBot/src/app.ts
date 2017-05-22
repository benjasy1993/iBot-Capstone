## I'm just editing this file to test github functionality.

import * as express from "express";
import {ChatConnector, UniversalBot} from "botbuilder";
import configure from "./support/config-bot";
import {jiraRequestOptions} from "./modules/jira/support/utils"
const connector = new ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const bot = new UniversalBot(connector);
configure(bot);
class Cookie {
	userName:string;
	password:string;
	credential:string;
	jiraUrl: string;
	signedIn: boolean;
	justPass: boolean

	constructor(s1: string, s2: string, s3: string, s4: string, s5: boolean, s6: boolean) {
		this.userName = s1;
		this.password = s2;
		this.credential = s3;
		this.jiraUrl = s4;
		this.signedIn = s5;
		this.justPass = s6;
	}

}
export var cookie = new Cookie("", "", "", "", false, false);
const app = express();
app.post('/api/messages', connector.listen());

const port = process.env.port || process.env.PORT || 3978;
app.listen(port, () => {
    console.log('Web Server listening on port %s', port);
});
