var searchInput, lcContainer, lcArray, currentLineupCount;

/****************************** Utilities *********************************/

NodeList.prototype.forEach = function(func){
	for(var i = 0 ; i < this.length ; i++){
		func(this[i]);
	}
}
/*************************************************************************/
/********************************* APP ***********************************/
var init = function() {
	lcContainer = document.querySelector('#lineup-card-container');
	lcArray = lcContainer.querySelectorAll('div.lineup');

	searchInput = document.createElement('input');
	searchInput.placeholder = "Player Search...";
	searchInput.type = "text";

	var lineupCount = document.createElement('div');
	lineupCount.style.color = "yellow";
	lineupCount.style.display = "inline";
	lineupCount.innerHTML = '<span id="DKLM-current-lineup-count">' + lcArray.length + '</span> / '+lcArray.length;

	var ownerships = document.createElement('div');
	ownerships.style.height = "240px";
	ownerships.style.resize = "both";
	ownerships.style.overflowY = "scroll"
	var ownershipsTable = document.createElement('table');
	ownershipsTable.id = 'DKLM-ownership-table';
	ownershipsTable.width = "auto";
	ownerships.appendChild(ownershipsTable);

	lcContainer.parentNode.insertBefore(searchInput, lcContainer);
	lcContainer.parentNode.insertBefore(lineupCount, lcContainer);
	lcContainer.parentNode.insertBefore(ownerships, lcContainer);
	bindSearchEvents(searchInput);
	filterAndGenerateOwnerships('');
};

var bindSearchEvents = function(input){
	var searchFunc = function(e){
		filterAndGenerateOwnerships(input.value);
	};
	input.addEventListener('change', searchFunc);
	input.addEventListener('keyup', searchFunc);
};

var findMatch = function(lc, text){
	var playerNames = lc.querySelectorAll('td.p-name a'),
		searches = text.split('&'),
		i;
	if(text == ''){
		return true;
	}
	if(searches.length > 1){
		for(i = 0 ; i < searches.length ; i++){
			if(!findMatch(lc, searches[i])){
				return false;
			}
		}
		return true;
	} else {
		console.log(text);
		for(i = 0 ; i < playerNames.length ; i++ ){
			if(playerNames[i].innerText.toLowerCase().indexOf(text.trim()) > -1){
				return true;
			}
		}
		return false;
	}
};

var incrementOwnershipsFromLineup = function(lc, ownerships){
	var playerNames = lc.querySelectorAll('td.p-name a');
	playerNames.forEach(function(player){
		if (ownerships.hasOwnProperty(player.innerText)){
			ownerships[player.innerText]++;
		} else {
			ownerships[player.innerText] = 1;
		}
	});
	return ownerships;
};

var displayOwnerships = function(ownerships){
	var ownershipContainer = document.querySelector('#DKLM-ownership-table'),
		ownershipTemplate = document.createElement('tr'),
		ownershipNode, cells, color;

	ownershipTemplate.className = "DKLM-ownership-node";
	ownershipTemplate.appendChild(document.createElement('td'));
	ownershipTemplate.appendChild(document.createElement('td'));
	ownershipContainer.innerHTML = "";

	for(var player in ownerships){
		if(ownerships.hasOwnProperty(player)){
			ownershipNode = ownershipTemplate.cloneNode(true);
			if(ownerships[player] / currentLineupCount >= .4){
				color = "lightcoral";
			} else if (ownerships[player] / currentLineupCount >= .25) {
				color = "yellow";
			} else if (ownerships[player] / currentLineupCount >= .1) {
				color = "lightblue";
			} else {
				color = "lightgreen";
			}
			cells = ownershipNode.querySelectorAll('td');
			cells[0].innerText = player;
			cells[0].style.color = color;
			cells[1].innerText = ownerships[player];
			cells[1].style.color = color;
			ownershipNode.setAttribute('data-ownership', ownerships[player]);
			addOwnershipNode(ownershipNode);
		}
	}
	ownershipContainer.parentNode.scrollTop = 0;
};

var filterAndGenerateOwnerships = function(text){
	var counter = 0,
		ownerships = {},
		matchedPlayer;
	lcArray.forEach(function(lineup){
		if(!findMatch(lineup, text)){
			lineup.style.display = "none";
		} else {
			lineup.style.display = "block";
			counter++;
			ownerships = incrementOwnershipsFromLineup(lineup, ownerships);
		}
	});
	currentLineupCount = counter;
	document.querySelector('#DKLM-current-lineup-count').innerHTML = currentLineupCount;
	displayOwnerships(ownerships);
};

var addOwnershipNode = function(node){
	var ownershipTable = document.querySelector('#DKLM-ownership-table'),
		ownerships = ownershipTable.querySelectorAll('.DKLM-ownership-node');
	if(ownerships.length === 0){
		ownershipTable.appendChild(node);
	} else {
		for(var i = 0 ; i < ownerships.length ; i++){
			if(parseInt(ownerships[i].getAttribute('data-ownership'), 10) < parseInt(node.getAttribute('data-ownership'), 10)){
				ownershipTable.insertBefore(node, ownerships[i]);
				return;
			}
		}
		ownershipTable.appendChild(node);
	}
}

init();