export const Url = {
    jiraBaseUrl: 'https://osucse5911sp17.atlassian.net',
    jenkinsBaseUrl: 'http://184.73.99.250:8080'
};

export const LUISIntents = {
    create: 'Create',
    search: 'Search',
    modify: 'Modify',
    queryBurnDownRate: 'QueryBurnDownRate',
    help: 'Help',
    viewAssign: 'ViewAssign'

};

/*
 * This is name of the field 'Estimate'.
 * You might want to change this to the corresponding name for your Jira.
 *
 * Seriously, Jira, WTF is this?
 */
export const expectedTimeField = 'customfield_10117';
export const epicNameField = 'customfield_10002';