import * as request from "request";
import {Url} from "../../../config";
import RequestCallback = request.RequestCallback;
import RequestResponse = request.RequestResponse;
import CoreOptions = request.CoreOptions;
import {cookie} from "../../../app";

export const jiraRequestOptions: CoreOptions = {
    baseUrl: "",
    // baseUrl: url,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ${process.env.credential}'
    }
};

export interface HttpResponse {
    response: RequestResponse,
    body: any
}

export async function jiraGetJsonAsync<T>(url: string, extraRequestOptions?: CoreOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request.get(url, makeRequestOptions(extraRequestOptions), makeJson(resolve, reject));
    });
}

export async function jiraPostJsonAsync<T>(url: string, extraRequestOptions?: CoreOptions): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request.post(url, makeRequestOptions(extraRequestOptions), makeJson(resolve, reject));
    });
}

export async function jiraPostAsync(url: string,
                             extraRequestOptions?: CoreOptions): Promise<HttpResponse> {
    return new Promise<HttpResponse>((resolve, reject) => {
        request.post(url, makeRequestOptions(extraRequestOptions), handleHTTPResponse(resolve, reject));
    });
}

export async function jiraPutAsync(url: string,
                            extraRequestOptions?: CoreOptions): Promise<HttpResponse> {
    return new Promise<HttpResponse>((resolve, reject) => {
        request.put(url, makeRequestOptions(extraRequestOptions), handleHTTPResponse(resolve, reject));
    });
}

function makeJson<T>(resolve: (value?: T | PromiseLike<T>) => void,
                     reject: (reason?: any) => void): RequestCallback {
    return (error, response, body) => {
        if (!error && response.statusCode < 400) {
            resolve(JSON.parse(body) as T);
        } else {
            reject(body);
        }
    };
}

function handleHTTPResponse(resolve: (value?: HttpResponse | PromiseLike<HttpResponse>) => void,
                            reject: (reason?: any) => void): RequestCallback {
    return (error, response, body) => {
        if (!error && response.statusCode < 400) {
            resolve({response: response, body: body});
        } else {
            reject(body);
        }
    };
}

function makeRequestOptions(extraRequestOptions?: CoreOptions): CoreOptions {
    if (extraRequestOptions) {
        const copy = Object.assign({}, jiraRequestOptions);
        return Object.assign(copy, extraRequestOptions);
    } else {
        return jiraRequestOptions;
    }
}
