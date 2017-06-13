/* Copyright (c) 2017 Bryan Laur - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary but not confidential.
 * Written by Bryan Laur (https://github.com/bjlaur)
 */

// in your background script
//Detect url change to /accounts
chrome.webNavigation.onHistoryStateUpdated.addListener(e => {
	chrome.tabs.sendMessage( e.tabId,
                             {action: "accounts"} );
	//alert("accounts");
}, {url: [{hostSuffix: "creditkarma.com", pathPrefix: "/accounts/"}]});