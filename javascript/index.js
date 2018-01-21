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
let cryptoComparePriceUrl = "https://min-api.cryptocompare.com/data/pricemultifull?";

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
	const query = url + 'fsyms='+ coinlist.slice(0,numberOfCoins).join(",") + '&tsyms=USD';
	console.log(query);
	$.getJSON(query, callback);
}


//this function puts price data in a variable where it can be used
function updateData(data) {
	currerntCoinPriceData = data.DISPLAY;
	fromObjectToArray(currerntCoinPriceData, requestedNumber, listOfCoins);
	loadTopWinThreeCoin (highToLowPct, basicCoinInfo);
	loadTopLosThreeCoin (highToLowPct, basicCoinInfo); 
	}

//this funcition take the data from the JSON and puts it in an area which sorts it from heightest percent change to lowest
function fromObjectToArray(data, numberOfCoins, listOfCoins) {
	console.log('fromObjectToArray: rendered')
	for(let i = 0; i < numberOfCoins; i ++){
		highToLowPct.push(data[listOfCoins[i]]);
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
		return topWinnerHtml(priceData, basicCoinInfo[priceData.USD.FROMSYMBOL]);
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
		htmlContent.unshift(topLosserHtml(priceData, basicCoinInfo[priceData.USD.FROMSYMBOL]));
	});

	$('.topLos3results').html(htmlContent);
}
//this function runs the program
function runApp() {
	getBasicInfo(addDataToGeneralInfo);
}


$(runApp);