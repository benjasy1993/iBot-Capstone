# iBot
A bot aimed to simplify the process of interacting with common business tools like: Jira, Salesforce, etc.

[Add to Skype](https://join.skype.com/bot/cac0015b-d14d-4aa4-8807-b6697bd75c2d)

# Screenshots
See [Images](https://github.com/izzyleung/Skype-Bot-Demo/tree/master/images)

## Installation & Deployment Instruction
* Install Node.js
* Create a LUIS endpoint
    * Go to [LUIS](https://www.luis.ai/), create an account, then create a new app.
    * Select `Import Utterance`, upload `Jira.json` from folder `luis-model`, then click `Train`.
    * Click `Publish`, copy the URL.
* Run the bot locally
    * Change the file `.env.example` to `.env`.
        * Change the `LUIS_MODEL_URL` to the URL you just copied.
    * __RECOMMENDED__: Use `yarn`. 
        * Install `yarn`: [Tutorial](https://yarnpkg.com/en/docs/install)
        * `cd` into code directory
        * `yarn`
        * Launch the bot with `yarn start`
        * Run unit tests with `yarn test`
        * Rerun the code every time file changes (for development purpose only): `yarn launch`
    * You can also use `npm`.
        * `cd` into code directory
        * `npm install`
        * Launch the bot with `npm start`
        * Run unit tests with `npm test`
        * Rerun the code every time file changes (for development purpose only): `npm run launch`
    * Interact with the bot via [BotFramework-Emulator](https://github.com/Microsoft/BotFramework-Emulator/releases)
* Deployment
    * Deploy the code to any server, copy down the bot's endpoint.
    * Publish the bot to [Microsoft Bot Framework Platform](https://dev.botframework.com/bots/new).
    * Config the following environment variable of the bot on the server, then restart it.
        * `MICROSOFT_APP_ID`
        * `MICROSOFT_APP_PASSWORD`
        * `LUIS_MODEL_URL` (Optional if you have already uploaded the `.env` file)
    * You now should be able to access the bot on Skype and any other chat application you fancy.
    

## References
[Bot Framework](https://docs.botframework.com/en-us/)  

[Bot Framework Node.js API](https://docs.botframework.com/en-us/node/builder/overview/)  

[Get Started on Heroku with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction)  

[Register a bot](https://dev.botframework.com/bots/new)
