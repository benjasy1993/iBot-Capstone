"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("../support/url");
var utils_1 = require("../support/utils");
var config_1 = require("../../../config");
var Issue = (function () {
    function Issue(issue) {
        Object.assign(this, issue);
    }
    Issue.prototype.updateDescriptionAsync = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var putBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        putBody = "{\"update\": {\"description\": [{\"set\": \"" + description + "\"}]}}";
                        return [4 /*yield*/, utils_1.jiraPutAsync(url_1.JiraUrl.issue + "/" + this.key, { body: putBody })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Issue.prototype.updatePriorityAsync = function (priority) {
        return __awaiter(this, void 0, void 0, function () {
            var putBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        putBody = "{\"update\": {\"priority\": [{\"set\": {\"id\": \"" + priority.id + "\"}}]}}";
                        return [4 /*yield*/, utils_1.jiraPutAsync(url_1.JiraUrl.issue + "/" + this.key, { body: putBody })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Issue.prototype.performTransitionAsync = function (transition) {
        return __awaiter(this, void 0, void 0, function () {
            var postBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        postBody = "{\"transition\": {\"id\": \"" + transition.id + "\"}}";
                        return [4 /*yield*/, utils_1.jiraPostAsync(url_1.JiraUrl.issue + "/" + this.key + "/transitions", { body: postBody })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Issue.prototype.addCommentAsync = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var postBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        postBody = "{\"body\": \"" + comment + "\"}";
                        return [4 /*yield*/, utils_1.jiraPostAsync(url_1.JiraUrl.issue + "/" + this.key + "/comment", { body: postBody })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Issue.prototype.assignToUserAsync = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var putBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        putBody = "{\"fields\": {\"assignee\": {\"name\": \"" + user.name + "\"}}}";
                        return [4 /*yield*/, utils_1.jiraPutAsync(url_1.JiraUrl.issue + "/" + this.key, { body: putBody })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Issue.prototype.getAllTransitionsAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transitions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.jiraGetJsonAsync(url_1.JiraUrl.issue + "/" + this.key + "/transitions")];
                    case 1:
                        transitions = _a.sent();
                        return [2 /*return*/, transitions.transitions];
                }
            });
        });
    };
    Issue.prototype.moveToSprintAsync = function (sprint) {
        return __awaiter(this, void 0, void 0, function () {
            var postBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        postBody = "{\"issues\": [\"" + this.key + "\"]}";
                        return [4 /*yield*/, utils_1.jiraPostAsync(url_1.JiraUrl.sprint + "/" + sprint.id + "/issue", { body: postBody })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Issue.fromKeyAsync = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.jiraGetJsonAsync(url_1.JiraUrl.issue + "/" + key + "/?fields=" + Issue.interestedFields.join(','))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Issue.searchIssueBySummaryAsync = function (summary) {
        return __awaiter(this, void 0, void 0, function () {
            var issues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.jiraGetJsonAsync(url_1.JiraUrl.search + "/?jql=summary~\"" + summary + "\"&maxResults=10&fields=" + Issue.interestedFields.join(','))];
                    case 1:
                        issues = _a.sent();
                        return [2 /*return*/, issues.issues];
                }
            });
        });
    };
    Issue.createAsync = function (issueInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var issueMetadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.jiraPostJsonAsync(url_1.JiraUrl.issue, { body: JSON.stringify(issueInfo) })];
                    case 1:
                        issueMetadata = _a.sent();
                        return [4 /*yield*/, Issue.fromKeyAsync(issueMetadata.key)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Issue.calculateSumOfEstimate = function (issues) {
        if (issues && issues.length > 0) {
            return issues.map(function (i) { return i.fields[config_1.expectedTimeField]; }).reduce(Issue.sum);
        }
        else {
            return 0;
        }
    };
    Issue.sum = function (a, b) {
        return Issue.numberOf(a) + Issue.numberOf(b);
    };
    Issue.numberOf = function (num) {
        return num ? num : 0;
    };
    Issue.deleteAsync = function (issueInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var issueMetadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.jiraDeleteJsonAsync(url_1.JiraUrl.issue, { body: JSON.stringify(issueInfo) })];
                    case 1:
                        issueMetadata = _a.sent();
                        return [4 /*yield*/, Issue.fromKeyAsync(issueMetadata.key)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Issue;
}());
Issue.commonIssueTypes = ['Task', 'Story', 'Epic', 'Bug'];
Issue.interestedFields = [
    'project',
    'summary',
    'description',
    'issuetype',
    'status',
    'assignee',
    'priority',
    config_1.expectedTimeField
];
Issue.typeSubTask = 'Sub-task';
Issue.typeEpic = 'Epic';
exports.Issue = Issue;
