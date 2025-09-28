'use strict';

export function scriptRequiresApis(apis) {
    apis.forEach(api => {
        if (!chrome || !chrome[api]) {
            if (document) {
                document.body.textContent = 'some chrome APIs are unavailable :(';
            }

            throw new Error('one or more of required chrome APIs are unavailable: ' + apis);
        }
    });
}
