"use strict";

//this varibale will hold the info for coinlist
let basicCoinInfo;
//this variable will hold a list of coins
let listOfCoins;
//this vairable will store the price data for coins
let currerntCoinPriceData;
//this variable holds the % change by highest to lowest
let highToLowPct = [];
//number of coins called
const requestedNumber = 50;

//url for price
const cryptoComparePriceUrl = "https://min-api.cryptocompare.com/data/pricemultifull?";

//url historical price url
const histPriceDayUrl = "https://min-api.cryptocompare.com/data/histoday?";

//url news info

const cryptoNewsUrl = "https://min-api.cryptocompare.com/data/news/";

//this function will get data from the coinlist api
function getBasicInfo(callback) {
	$.getJSON("https://min-api.cryptocompare.com/data/all/coinlist", callback );
}

//takes data from the api and stores it into a variable
function addDataToGeneralInfo(data) {
  basicCoinInfo = data.Data;
  listOfCoins = Object.keys(basicCoinInfo);
  getCurrnetPriceData(cryptoComparePriceUrl,listOfCoins, updateData, requestedNumber);
  // the intervial will be set here
  setInterval( priceInterval, 30000);
}

function priceInterval() {
	getCurrnetPriceData(cryptoComparePriceUrl,listOfCoins, updateData, requestedNumber)
}


//this fuunction will call the price data for all the coins 
function getCurrnetPriceData(url, coinlist, callback, numberOfCoins) {
	let query = url + 'fsyms='+ coinlist.slice(0,numberOfCoins).join(",") + '&tsyms=USD';
	$.getJSON(query, callback);
}


//this function puts price data in a variable where it can be used
function updateData(data) {
	currerntCoinPriceData = data.DISPLAY;
	fromObjectToArray(currerntCoinPriceData, requestedNumber, listOfCoins);
	loadTopWinThreeCoin (highToLowPct, basicCoinInfo);
	loadTopLosThreeCoin (highToLowPct, basicCoinInfo);
	loadLeaderLoserBoard(highToLowPct, basicCoinInfo);
	leaderShown();
	}

//this funcition take the data from the JSON and puts it in an area which sorts it from heightest percent change to lowest
function fromObjectToArray(data, numberOfCoins, listOfCoins) {
	console.log('fromObjectToArray: rendered');
	highToLowPct = [];
	for(let i = 0; i < numberOfCoins; i ++){
		highToLowPct.push(data[listOfCoins[i]]);
		highToLowPct[i].USD.KEY = listOfCoins[i];
		highToLowPct[i].USD.CoinName = basicCoinInfo[listOfCoins[i]].CoinName.toUpperCase();
	}
	//sort the objects from hights percentage change in a day
	highToLowPct.sort(function(a,b){
		return b.USD.CHANGEPCTDAY - a.USD.CHANGEPCTDAY
	});
}

//this function takes two arrguments price data and coin info.  The data from those arrgument will be entered into the html doc
function topThreeHtml(priceData, coinInfo) {
	console.log("topThreeHTML: rendered")
	return `<div class='topresult fullcoindataresults'>
				<div class='top3sym'><img src='https://www.cryptocompare.com${coinInfo.ImageUrl}' alt="${priceData.USD.KEY}" name='${coinInfo.CoinName}'></div>
				<div class='topContent'><p>${coinInfo.FullName}</p></div>
				<div class='pecentageArrow'></div><div class='${positiveNegativeColor(priceData.USD.CHANGEPCTDAY)}'>${priceData.USD.CHANGEPCTDAY}%</div>
			</div>`
}

//this fucntion identifies if the interger is positive or negative and assignes the corresponding class 
function positiveNegativeColor(int) {
	if(int >= 0) {
		return "positiveIncrease";
	} else {
		return "negativeIncrease";
	}
}

//this function loads the top 3 coins with % change
function loadTopWinThreeCoin (arr, basicInfo) {
	let htmlContent = arr.slice(0, 3).map(function(priceData) {
		console.log(priceData);
		return topThreeHtml(priceData, basicInfo[priceData.USD.KEY]);
	});
	console.log(htmlContent);

	$('.topWin3results').html(htmlContent);
}

//this function loads the top 3 coins with % change
function loadTopLosThreeCoin (arr, basicInfo) {
	let htmlContent = []

	arr.slice(-3).forEach(function(priceData) {
		htmlContent.unshift(topThreeHtml(priceData, basicInfo[priceData.USD.KEY]));
	});
	console.log(htmlContent);
	$('.topLoss3results').html(htmlContent);
}

//this function takes two arrguments price data and coin info.  The data from those arrgument will be entered into the html doc
function boardHtml(priceData, coinInfo) {
	return `<li class="fullcoindataresults">
				<div class='top3sym'><img src='https://www.cryptocompare.com${coinInfo.ImageUrl}' alt="${priceData.USD.KEY}" name='${coinInfo.CoinName}'></div>
				<div class="topContent"><p>${coinInfo.FullName} <span class="priceInc">${priceData.USD.PRICE}</span></p></div>
				<div class="pecentageArrow"></div><div class="${positiveNegativeColor(priceData.USD.CHANGEPCTDAY)}">${priceData.USD.CHANGEPCTDAY}%</div>
			</li>`
}

//this function loads the top 3 coins with % change
function loadLeaderLoserBoard(arr, basicInfo) {
	let htmlContent = arr.map(function(priceData) {
		// console.log(priceData.USD.KEY);
		// console.log(arr.indexOf(priceData));
		return boardHtml(priceData, basicInfo[priceData.USD.KEY]);
	});

	$('.llboardresults').html(htmlContent);
}

//this function displays and closes the leader/loser board modal
function llboardButton() {
	$('.LLBoard').on('click', function(){
		$('.leader-looser').fadeIn();
	});

	$('.boardclose').on('click', function(){
		$('.leader-looser').css('display', 'none');	
	});

}

//this function displays and closes the about modal
function aboutButton() {
	$('.about').on('click', function(){
		$('.aboutContent').fadeIn();
	});

	$('.aboutclose').on('click', function(){
		$('.aboutContent').css('display', 'none');
	});
}

//this function converts the data from the json to a usable array for chart
function usableChartData(json) {
	let fullData = json.Data;
	let histData = fullData.map(function(obj){
						return [obj.time * 1000, obj.close];
					});
	return histData;
}


//this is a chart fucntion which takes a few argument
function finChart(url, idHTML , key){
	const query = {
		fsym: key,
		tsym: 'USD',
		allData: true,
		aggregate: 1
	}
	

	$.getJSON(url, query,function(data){
		
		// console.log(usableChartData(data));
		Highcharts.stockChart(idHTML, {


	        rangeSelector: {
	            selected: 1
	        },

	        title: {
	            text: `${key} Coin Price`
	        },

	        series: [{
	            name: key,
	            data: usableChartData(data),
	            tooltip: {
	                valueDecimals: 2
	            }
	        }],

	        responsive: {
		        rules: [{
		            condition: {
		                maxHeight: 400
		            },
		        }]
		    }
	    });
	});

}

//this function will load the the info for lead coin info
function leaderShown() {
	let winningCoin = highToLowPct[0].USD.KEY;
	let winnerPriceData = highToLowPct[0];
	$(".leaderData").html(searchHtml(winnerPriceData, basicCoinInfo[winningCoin]));
	finChart(histPriceDayUrl, 'dayLeaderChart' , winningCoin); 
}

//this function takes a users input and retuns search result
function cryptoSearch() {
	$(".finder").on("submit", function (e) {
		e.preventDefault();
		
		//if input 1 has a val of 0 the use input from 
		let userInput = $(".secinputsearch").val().toUpperCase();
		console.log(userInput)
		findAndDisplay(userInput);
		$(".searching").val('');
});

$('.searchclose').on('click', function(){
		$('.modal, div .searchresult').css('display', 'none');
	});



////this takes an string and return search html
function findAndDisplay(str) {
	$('.modal').css('display', 'none');
	let searchResult = highToLowPct.find(function (e) {
			return e.USD.KEY === str ||  e.USD.CoinName === str;
		});

		if(searchResult != undefined) {
			console.log("render search result:"+ JSON.stringify(searchResult));
			$(".searchGenInfo").html(searchHtml(searchResult, basicCoinInfo[searchResult.USD.KEY]));
			finChart(histPriceDayUrl, "searchChart" , searchResult.USD.KEY);
			$(".searchresult").fadeIn();
		} else{
			console.log("search result not found");
		}
	}
}

//this function runs the click listiner for the coins. when a coin is clicked it displays the full info
function showFullData() {
	console.log("render: showFullData");
	$('div').on('click', '.fullcoindataresults', function() {
		let coin = $(this).find("img").attr("alt");
		$('.modal').css('display', 'none');
		let searchResult = highToLowPct.find(function (e) {
			return e.USD.KEY === coin;
		});

		if(searchResult != undefined) {
			console.log("render search result:"+ JSON.stringify(searchResult));
			$(".searchGenInfo").html(searchHtml(searchResult, basicCoinInfo[searchResult.USD.KEY]));
			finChart(histPriceDayUrl, "searchChart" , searchResult.USD.KEY);
			$(".searchresult").fadeIn();
		}
	});
}


// function holds the html of detailed info on the coin
function searchHtml(priceData, basicInfo) {
	return `<div class="imageIcon"><img class="searchIcon" src="https://www.cryptocompare.com${basicInfo.ImageUrl}" name="${basicInfo.CoinName}"></div>
				<div class="searchCoinInfo">
				   <div class="coinName">${basicInfo.FullName}</div>
		           <div class="coinCost">${priceData.USD.PRICE}</div>
		           <div class="coinPercentage ${positiveNegativeColor(priceData.USD.CHANGEPCTDAY)}">${priceData.USD.CHANGEPCTDAY}%</div>
		           <div class="priceData">
		             <h4>MKTCAP</h4>
		             <p class="mktcapSearch">${priceData.USD.MKTCAP}</p>
		           </div>
		           <div class="priceData">
		             <h4>Vol.24</h4>
		             <p class="volSearch">${priceData.USD.VOLUME24HOURTO}</p>
		           </div>
		           <div class="priceData">
		             <h4>Open 24hr</h4>
		             <p class="openSearch">${priceData.USD.OPEN24HOUR}</p>
		           </div>
				</div>
				<div class="searchRanking">
				  <h2>Rank</h2>
				  <p>${highToLowPct.findIndex(obj => obj.USD.KEY === priceData.USD.KEY) + 1}/50</p>
				</div>  `;
}

//this function holds the html for the news links 
function newsHtml(obj){
	return `<article role="article">
				<a href="${obj.url}" target="_blank">
					<div class='newsImgBox'><img src="${obj.imageurl}"></div>
					<div class="newsTitleBox">
						<h4>${obj.title}</h4>
						<p>${obj.source_info.name}</p>
					</div>
				</a>
			</article>`;
}

//this funtion loops through the josn to render the news articles 
function renderNews(json) {
	let htmlContent = json.slice(0, 8).map(function(obj) {
		return newsHtml(obj);
	});

	$(".news").html(htmlContent);
}

//this function gets the crypto news info by api call
function getNewsInfo(url, callback) {
	$.getJSON(url, callback);
}

//this function handles the click listeners for the side nav bar
function responsiveNav(){
	$('#navopen').on("click", function(){
		$('header').toggleClass('fullheight');
	});

	$('#mySidenav .about, #mySidenav .LLBoard, #mySidenav button').on("click", function(){
		$('#mySidenav').css('width', '0');
	});

	
}

//this is a click listner that closes a modal if clicked away from the content or exscape is clicked
$(".modal").on("click",function(e){
	console.log("you clicked on the modal");
	if(e.target === this){
		$(this).css("display", "none");
	}
});

///if the user press down on the escape key then display: none will be applied onto a modal
$(document).keydown(function(e){
	if (e.keyCode === 27) { 
		$(".modal").css("display", "none"); 
	} 
});

//this will listen to the window size and remove a class from header once fired
$(window).resize( function(){
	console.log("running");
	if($(window).width() >= 880) {
		console.log("ok");
		$('header').removeClass('fullheight');
	}
});


//this function runs the program
function runApp() {
	getBasicInfo(addDataToGeneralInfo);
	llboardButton();
	aboutButton();
	cryptoSearch();
	getNewsInfo(cryptoNewsUrl, renderNews);
	responsiveNav();
	showFullData();

}


$(runApp);