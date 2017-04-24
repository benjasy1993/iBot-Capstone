const mocha = require("mocha");
const assert = require('assert');
const botbuilder = require('botbuilder');
const FakeConsoleConnector = require('../lib/support/test/FakeConsoleConnector');
const configure = require('../lib/support/config-bot').default;

mocha.describe('iBot', function () {
    this.timeout(5000);

    let connector = null, bot = null, step = 0;

    mocha.beforeEach(function () {
        step = 0;

        connector = new FakeConsoleConnector.FakeConsoleConnector();
        bot = new botbuilder.UniversalBot(connector);

        configure(bot);
    });

    mocha.it('should greet the user when joining the chat', function (done) {
        bot.on('send', function (message) {
            assert(message.text.indexOf('Hi') !== -1);
            done();
        });

        function userAddedEvent(userId, userName) {
            const msg = new botbuilder.Message()
                .address({
                    channelId: 'console',
                    user: {id: 'user', name: 'User'},
                    bot: {id: 'bot', name: 'Bot'},
                    conversation: {id: 'conversation'}
                })
                .timestamp()
                .toMessage();
            msg.type = 'conversationUpdate';
            msg.membersAdded = [{id: userId, name: userName}];
            return msg;
        }

        bot.receive(userAddedEvent('bot', 'Bot'));
        bot.receive(userAddedEvent('user', 'User'));
    });

    // mocha.it('should tell its abilities when user asks', function (done) {
    //     bot.on('send', function (message) {
    //         switch (++step) {
    //             case 1:
    //                 assert(message.text.indexOf('You can ask me') !== -1);
    //                 done();
    //                 break
    //         }
    //     });
    //
    //     connector.processMessage('What can you do?');
    // });

    // mocha.it('should tell its inability to deal with unknown intent, and tell its abilities', function (done) {
    //     bot.on('send', function (message) {
    //         switch (++step) {
    //             case 1:
    //                 assert(message.text.startsWith('Sorry'));
    //                 assert(message.text.indexOf('You can ask me') !== -1);
    //                 done();
    //                 break
    //         }
    //     });
    //
    //     connector.processMessage('wasdqwerty');
    // });

    mocha.it('should execute the desired issue creation waterfall dialog', function (done) {
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    connector.processMessage('1');
                    break;
                case 2:
                    connector.processMessage('1');
                    break;
                case 3:
                    connector.processMessage('1');
                    break;
                case 4:
                    connector.processMessage('Summary');
                    break;
                case 5:
                    connector.processMessage('yes');
                    break;
                case 6:
                    done();
                    break
            }
        });

        connector.processMessage('I want to create a new issue.');
    });

    mocha.it('should extract all necessary information when stage, type and summary are provided', function (done) {
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    connector.processMessage('1');
                    break;
                case 2:
                    connector.processMessage('Yes');
                    break;
                case 3:
                    done();
                    break
            }
        });

        connector.processMessage('I want to create a new in progress task that could be summarized as "Summary".');
    });

    mocha.it("should not create anything without the user's confirmation", function (done) {
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    connector.processMessage('1');
                    break;
                case 2:
                    connector.processMessage('No');
                    break;
                case 3:
                    done();
                    break
            }
        });

        connector.processMessage('I want to create a new in progress task that could be summarized as "Summary".');
    });

    mocha.it('should tell the burn down rate', function (done) {
        bot.on('send', function (message) {
            done();
        });

        connector.processMessage('What is the current progress?');
    });
});