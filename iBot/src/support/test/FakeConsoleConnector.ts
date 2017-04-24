import {
    IConnector,
    IEvent,
    Message,
    IMessage,
    IAddress,
    IAttachment,
    IThumbnailCard,
    ICardAction,
    ICardImage
} from "botbuilder";

/**
 * Removes unnecessary functions of the class `ConsoleConnector` in botbuilder.
 * Most importantly, removes console output to make unit tests result stands out.
 */
export class FakeConsoleConnector implements IConnector {
    private handler: (events: IEvent[], cb?: (err: Error) => void) => void;
    private replyCnt = 0;

    public processMessage(line: string): this {
        if (this.handler) {
            const msg = new Message()
                .address({
                    channelId: 'console',
                    user: {id: 'user', name: 'User1'},
                    bot: {id: 'bot', name: 'Bot'},
                    conversation: {id: 'Convo1'}
                })
                .timestamp()
                .text(line);
            this.handler([msg.toMessage()]);
        }
        return this;
    }

    public onEvent(handler: (events: IEvent[], cb?: (err: Error) => void) => void): void {
        this.handler = handler;
    }

    public send(messages: IMessage[], done: (err: Error) => void): void {
        for (let i = 0; i < messages.length; i++) {
            if (this.replyCnt++ > 0) {
                log(null);
            }
            const msg = messages[i];
            if (msg.text) {
                log(msg.text);
            }
            if (msg.attachments && msg.attachments.length > 0) {
                for (let j = 0; j < msg.attachments.length; j++) {
                    if (j > 0) {
                        log(null);
                    }
                    renderAttachment(msg.attachments[j]);
                }
            }
        }

        done(null);
    }

    public startConversation(address: IAddress, cb: (err: Error, address?: IAddress) => void): void {
        const adr = clone(address);
        adr.conversation = {id: 'Convo1'};
        cb(null, adr);
    }
}

function renderAttachment(a: IAttachment) {
    switch (a.contentType) {
        case 'application/vnd.microsoft.card.hero':
        case 'application/vnd.microsoft.card.thumbnail':
            const tc: IThumbnailCard = a.content;
            if (tc.title) {
                if (tc.title.length <= 40) {
                    line('=', 60, tc.title);
                } else {
                    line('=', 60);
                    wrap(tc.title, 60, 3);
                }
            }
            if (tc.subtitle) {
                wrap(tc.subtitle, 60, 3);
            }
            if (tc.text) {
                wrap(tc.text, 60, 3);
            }
            renderImages(tc.images);
            renderButtons(tc.buttons);
            break;
        case 'application/vnd.microsoft.card.signin':
        case 'application/vnd.microsoft.card.receipt':
        default:
            line('.', 60, a.contentType);
            if (a.contentUrl) {
                wrap(a.contentUrl, 60, 3);
            } else {
                log(JSON.stringify(a.content));
            }
            break;
    }
}

function renderImages(images: ICardImage[]) {
    if (images && images.length) {
        line('.', 60, 'images');
        const bullet = images.length > 1 ? '* ' : '';
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (img.alt) {
                wrap(bullet + img.alt + ': ' + img.url, 60, 3);
            } else {
                wrap(bullet + img.url, 60, 3);
            }
        }
    }
}

function renderButtons(actions: ICardAction[]) {
    if (actions && actions.length) {
        line('.', 60, 'buttons');
        const bullet = actions.length > 1 ? '* ' : '';
        for (let i = 0; i < actions.length; i++) {
            const a = actions[i];
            if (a.title == a.value) {
                wrap(bullet + a.title, 60, 3);
            } else {
                wrap(bullet + a.title + ' [' + a.value + ']', 60, 3);
            }
        }
    }
}

function line(char: string, length: number, title?: string) {
    if (title) {
        let txt = repeat(char, 2);
        txt += '[' + title + ']';
        if (length > txt.length) {
            txt += repeat(char, length - txt.length);
        }
        log(txt);
    } else {
        log(repeat(char, length));
    }
}

function wrap(text: string, length: number, indent = 0) {
    let buffer = '';
    const pad = indent ? repeat(' ', indent) : '';
    const tokens = text.split(' ');
    length -= pad.length;
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (buffer.length) {
            if ((buffer.length + 1 + t.length) > length) {
                log(pad + buffer);
                buffer = t;
            } else {
                buffer += ' ' + t;
            }
        } else if (t.length < length) {
            buffer = t;
        } else {
            log(pad + t);
        }
    }
    if (buffer.length) {
        log(pad + buffer);
    }
}

function repeat(char: string, length: number): string {
    let txt = '';
    for (let i = 0; i < length; i++) {
        txt += char;
    }
    return txt;
}

//noinspection JSUnusedLocalSymbols
function log(text: string) {
    // Do nothing
}

function clone(obj: any): any {
    const cpy: any = {};
    if (obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                cpy[key] = obj[key];
            }
        }
    }
    return cpy;
}
