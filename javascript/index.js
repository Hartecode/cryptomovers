"use strict";

//this varibale will hold the info for coinlist
let basicCoinInfo;
//this variable will hold a list of coins
let listOfCoins;
//this vairable will store the price data for coins
let currerntCoinPriceData;
//this variable holds the % change by highest to lowest
const highToLowPct = [];
//number of coins called
const requestedNumber = 50;

//url for price
const cryptoComparePriceUrl = "https://min-api.cryptocompare.com/data/pricemultifull?";

//url historical price url
const histPriceUrl = "https://min-api.cryptocompare.com/data/histoday?";

//this function will get data from the coinlist api
function getBasicInfo(callback) {
	$.getJSON("https://min-api.cryptocompare.com/data/all/coinlist", callback );
}

//takes data from the api and stores it into a variable
function addDataToGeneralInfo(data) {
  basicCoinInfo = data.Data;
  listOfCoins = Object.keys(basicCoinInfo);
  getCurrnetPriceData(cryptoComparePriceUrl,listOfCoins, updateData, requestedNumber);
}

//this fuunction will call the price data for all the coins 
function getCurrnetPriceData(url, coinlist, callback, numberOfCoins) {
	let query = url + 'fsyms='+ coinlist.slice(0,numberOfCoins).join(",") + '&tsyms=USD';
	// console.log(query);
	$.getJSON(query, callback);
}


//this function puts price data in a variable where it can be used
function updateData(data) {
	currerntCoinPriceData = data.DISPLAY;
	fromObjectToArray(currerntCoinPriceData, requestedNumber, listOfCoins);
	loadTopWinThreeCoin (highToLowPct, basicCoinInfo);
	loadTopLosThreeCoin (highToLowPct, basicCoinInfo);
	loadLeaderLoserBoard(highToLowPct, basicCoinInfo);
	topChart(histPriceUrl, 'dayLeaderChart' , highToLowPct); 
	}

//this funcition take the data from the JSON and puts it in an area which sorts it from heightest percent change to lowest
function fromObjectToArray(data, numberOfCoins, listOfCoins) {
	console.log('fromObjectToArray: rendered')
	for(let i = 0; i < numberOfCoins; i ++){
		highToLowPct.push(data[listOfCoins[i]]);
		highToLowPct[i].USD.KEY = listOfCoins[i];
	}
	//sort the objects from hights percentage change in a day
	highToLowPct.sort(function(a,b){
		return b.USD.CHANGEPCTDAY - a.USD.CHANGEPCTDAY
	});
}

//this function takes two arrguments price data and coin info.  The data from those arrgument will be entered into the html doc
function topWinnerHtml(priceData, coinInfo) {
	return `<li>
				<img class="top3sym" src="https://www.cryptocompare.com${coinInfo.ImageUrl}" name="${coinInfo.CoinName}">
				<div class="topContent"><p>${coinInfo.FullName} <span class="priceInc">${priceData.USD.PRICE}</span></p></div>
				<div class="pecentageArrow"><i class="fa fa-sort-asc" aria-hidden="true"></i></div><div class="positiveIncrease">${priceData.USD.CHANGEPCTDAY}%</div>
			</li>`
}

//this function loads the top 3 coins with % change
function loadTopWinThreeCoin (arr, basicInfo) {
	let htmlContent = arr.slice(0, 3).map(function(priceData) {
		return topWinnerHtml(priceData, basicInfo[priceData.USD.KEY]);
	});

	$('.topWin3results').html(htmlContent);
}

//this function takes two arrguments price data and coin info.  The data from those arrgument will be entered into the html doc
function topLosserHtml(priceData, coinInfo) {
	return `
			<li>
				<img class="top3sym" src="https://www.cryptocompare.com${coinInfo.ImageUrl}" name="${coinInfo.CoinName}">
				<div class="topContent"><p>${coinInfo.FullName} <span class="priceDec">${priceData.USD.PRICE}</span></p></div>
				<div class="pecentageArrow"><i class="fa fa-caret-down" aria-hidden="true"></i></div><div class="negativeIncrease">${priceData.USD.CHANGEPCTDAY}%</div>
			</li>`
}

//this function loads the top 3 coins with % change
function loadTopLosThreeCoin (arr, basicInfo) {
	let htmlContent = []

	arr.slice(-3).forEach(function(priceData) {
		htmlContent.unshift(topLosserHtml(priceData, basicInfo[priceData.USD.KEY]));
	});

	$('.topLos3results').html(htmlContent);
}

//this function takes two arrguments price data and coin info.  The data from those arrgument will be entered into the html doc
function boardHtml(priceData, coinInfo) {
	return `<li>
				<img class="top3sym" src="https://www.cryptocompare.com${coinInfo.ImageUrl}" name="${coinInfo.CoinName}">
				<div class="topContent"><p>${coinInfo.FullName} <span class="priceInc">${priceData.USD.PRICE}</span></p></div>
				<div class="pecentageArrow"><i class="fa fa-sort-asc" aria-hidden="true"></i></div><div class="positiveIncrease">${priceData.USD.CHANGEPCTDAY}%</div>
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
						return [obj.time, obj.close];
					});
	return histData;
}


//this will call data for the lead coin and put it in the main page chart

//this is a chart fucntion which takes a few argument
function topChart(url, idHTML , arr){
	let symb = arr[0].USD.KEY;
	let query = {
		fsym: symb,
		tsym: 'USD',
		allData: true,
		aggregate: 1
	}
	

	$.getJSON(url, query,function(data){
		
		console.log(usableChartData(data));
		Highcharts.stockChart(idHTML, {


	        rangeSelector: {
	            selected: 1
	        },

	        title: {
	            text: `${symb} Coin Price`
	        },

	        series: [{
	            name: symb,
	            data: usableChartData(data),
	            tooltip: {
	                valueDecimals: 2
	            }
	        }]
	    });
	});

	
}

//this function runs the program
function runApp() {
	getBasicInfo(addDataToGeneralInfo);
	llboardButton();
	aboutButton();
}


$(runApp);