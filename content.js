/* Copyright (c) 2017 Bryan Laur - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary but not confidential.
 * Written by Bryan Laur (https://github.com/bjlaur)
 */

var isDevMode = !('update_url' in chrome.runtime.getManifest());

if (isDevMode) alert("LOADED: " + location.href);

// in your content script
chrome.runtime.onMessage.addListener(data => {
    if (data.action === "accounts") {
        doStepOne();
    }
});


function doStepOne() {
	if (isDevMode) alert("STUFF: " + location.href);
	onClassRemove($(document), "absolute--fill", doStepTwo);
}

function onClassRemove(root, targetClass, callback) {
	
	var x = new MutationObserver(function (mutations) {
		//debugger;
		if (isDevMode) console.log(mutations);

		for (var i=0; i < mutations.length; i++){
			
			
			var removedNodes = mutations[i].removedNodes;
			for (var j=0; j < removedNodes.length; j++){
				if(removedNodes[j].classList && removedNodes[j].classList.contains(targetClass))
				{
					x.disconnect();
					callback();
				}
			}
		}
	});
	
	var targetElements = root.find("."+targetClass);
	if (targetElements.length) {
		var n = targetElements.parent().get(0);
		if (isDevMode) console.log(n);
		x.observe(n, {childList:true});
	} else { callback();}
}

function expandAllCards(collapse) {
	
	$('.show-row').each(function(i, el) {
		if ($(el).children().first().text().indexOf("closed") >= 0) {
			this.click();
		}
	});
	
	
	$('.expandable-card-root').each(function(i, el) {
		if ( ($(el).find(".account-details-section").length !== 0 && collapse) ||
			 ($(el).find(".account-details-section").length === 0 && !collapse)
			){
			$(el).find(".expandable-card-header").each(function () {
				this.click();
			});
		}
	});
}

function getDetail(el, title) {
	return $(el).find('span[title="' +title + '"]').children().first();
}

var titles = [
			  "Account status",
			  "Type",
			  "Responsibility",
			  "Remarks",
			  "Times 30/60/90 days late",
			  "Last payment",
			  "Current Payment Status",
			  "Amount past due",
			  "Worst Payment Status"
			  ];

function runReporting() {
	expandAllCards();
	alert("run reporting");
	
	var list = [];
	var promises = [];
	
	$('.expandable-card-root').each(function(i, el) {
		
		var cardTitle = $(el).find(".mr3").children().first().text();
		var deferred = new jQuery.Deferred();
		promises.push(deferred);
		var res = onClassRemove($(el), 'ck-spinner', function() {
			
			//TODO: Balance and limit are quite fragile. See if you can find a better way to locate them.
			
			var pv1 = $(el).find(".pv1");
			var balance = pv1.eq(0).children().eq(1).text();
			var limit = pv1.eq(1).children().eq(1).text();
			var e = {
				"Title" : cardTitle,
				"Balance" : balance,
				"Credit Limit" : limit
			};
			
			$.each(titles, function(i, title){
				var res = getDetail(el, title);
				e[title] = res.text();
			});	
			console.log(e);
	
			list.push(e);
			deferred.resolve();
		});
		
		if (res === false) {deferred.resolve();}
		

	});
	
	Promise.all(promises).then(function()
	{
		//debugger;
		//console.log(list);
	});
	
}
	
	

function doStepTwo() {
	
	$.get(chrome.extension.getURL('/524.html'), function(data) {
		$(".accounts").children().first().after($(data));
		//if (isDevMode) alert("REMOVED");
		
		$('#btnCollapse').on( "click", function(){
			expandAllCards(true);
		});
		$('#btnExpand').on( "click", function(){
			expandAllCards();
		});
		$('#btnReport').on( "click", function(){
			runReporting();
		});

	});


	
	

}



if (location.href.startsWith("https://www.creditkarma.com/accounts")) {
	doStepOne();
}

