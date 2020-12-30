var TOO_MUCH_SYNERGY=100;var SQUARES_PER_ROW=5;var DEFAULT_PROFILE={defaultMinimumSynergy:-3,defaultMaximumSynergy:7,defaultMaximumIndividualSynergy:3.75,defaultMaximumSpill:2,defaultInitialOffset:1,defaultMaximumOffset:2,baselineTime:27.75,timePerDifficulty:0.75};var NORMAL_PROFILE={defaultMinimumSynergy:DEFAULT_PROFILE.defaultMinimumSynergy,defaultMaximumSynergy:DEFAULT_PROFILE.defaultMaximumSynergy,defaultMaximumIndividualSynergy:DEFAULT_PROFILE.defaultMaximumIndividualSynergy,defaultMaximumSpill:DEFAULT_PROFILE.defaultMaximumSpill,defaultInitialOffset:DEFAULT_PROFILE.defaultInitialOffset,defaultMaximumOffset:DEFAULT_PROFILE.defaultMaximumOffset,baselineTime:DEFAULT_PROFILE.baselineTime,timePerDifficulty:DEFAULT_PROFILE.timePerDifficulty};var SHORT_PROFILE={defaultMinimumSynergy:DEFAULT_PROFILE.defaultMinimumSynergy,defaultMaximumSynergy:3,defaultMaximumIndividualSynergy:DEFAULT_PROFILE.defaultMaximumIndividualSynergy,defaultMaximumSpill:DEFAULT_PROFILE.defaultMaximumSpill,defaultInitialOffset:DEFAULT_PROFILE.defaultInitialOffset,defaultMaximumOffset:DEFAULT_PROFILE.defaultMaximumOffset,baselineTime:12,timePerDifficulty:0.5};var BLACKOUT_PROFILE={defaultMinimumSynergy:-10,defaultMaximumSynergy:10,defaultMaximumIndividualSynergy:4.5,defaultMaximumSpill:4,defaultInitialOffset:2,defaultMaximumOffset:6,baselineTime:DEFAULT_PROFILE.baselineTime,timePerDifficulty:DEFAULT_PROFILE.timePerDifficulty};var SHORTBLACKOUT_PROFILE={defaultMinimumSynergy:-4,defaultMaximumSynergy:4,defaultMaximumIndividualSynergy:DEFAULT_PROFILE.defaultMaximumIndividualSynergy,defaultMaximumSpill:DEFAULT_PROFILE.defaultMaximumSpill,defaultInitialOffset:2,defaultMaximumOffset:6,baselineTime:12,timePerDifficulty:0.5};Array.prototype.sortNumerically=function(){return this.sort(function(a,b){return a-b;});};Array.prototype.shuffled=function(){var toShuffle=this.slice();for(var i=0;i<toShuffle.length;i++){var randElement=Math.floor(Math.random()*(i+1));var temp=toShuffle[i];toShuffle[i]=toShuffle[randElement];toShuffle[randElement]=temp;}
return toShuffle;};function hasDuplicateStrings(array){var seen={};for(var i=0;i<array.length;i++){var el=array[i];if(el in seen){return true;}
seen[el]=true;}
return false;};var INDICES_PER_ROW={"row1":[1,2,3,4,5],"row2":[6,7,8,9,10],"row3":[11,12,13,14,15],"row4":[16,17,18,19,20],"row5":[21,22,23,24,25],"col1":[1,6,11,16,21],"col2":[2,7,12,17,22],"col3":[3,8,13,18,23],"col4":[4,9,14,19,24],"col5":[5,10,15,20,25],"tlbr":[1,7,13,19,25],"bltr":[5,9,13,17,21]};function invertObject(obj){var ret={};Object.keys(obj).forEach(function(key){obj[key].forEach(function(item){if(!ret[item])ret[item]=[];ret[item].push(key);});});return ret;}
var ROWS_PER_INDEX=invertObject(INDICES_PER_ROW);var BingoGenerator=function(bingoList,options){if(!options){options={};}
this.language=options.lang||'name';this.mode=options.mode||'normal';this.seed=options.seed||Math.ceil(999999*Math.random()).toString();if(bingoList.info&&bingoList.info.combined==='true'){if(bingoList[this.mode]){bingoList=bingoList[this.mode];}
else if(bingoList["normal"]){bingoList=bingoList["normal"];}
else{console.log("bingoList doesn't contain a valid sub goal list for mode: \""+this.mode+"\"");}}
this.goalsByDifficulty=bingoList;this.rowtypeTimeSave=bingoList.rowtypes;this.synergyFilters=bingoList.synfilters||{};this.goalsList=[];for(var i=1;i<=25;i++){this.goalsList=this.goalsList.concat(bingoList[i]);}
this.goalsList.sort(function(a,b){var timeDiff=a.time-b.time;if(timeDiff!==0){return timeDiff;}
if(a.id>b.id){return 1;}
else if(a.id<b.id){return-1;}
else{return 0;}});this.goalsByName={};for(var i=0;i<this.goalsList.length;i++){var goal=this.goalsList[i];this.goalsByName[goal.name]=goal;}
this.profile=NORMAL_PROFILE;if(this.mode==='short'){this.profile=SHORT_PROFILE;}
else if(this.mode==='blackout'){this.profile=BLACKOUT_PROFILE;}
this.baselineTime=options.baselineTime||this.profile.baselineTime;this.timePerDifficulty=options.timePerDifficulty||this.profile.timePerDifficulty;this.minimumSynergy=options.minimumSynergy||this.profile.defaultMinimumSynergy;this.maximumSynergy=options.maximumSynergy||this.profile.defaultMaximumSynergy;this.maximumIndividualSynergy=options.maximumIndividualSynergy||this.profile.defaultMaximumIndividualSynergy;this.maximumSpill=options.maximumSpill||this.profile.defaultMaximumSpill;this.initialOffset=options.initialOffset||this.profile.defaultInitialOffset;this.maximumOffset=options.maximumOffset||this.profile.defaultMaximumOffset;Math.seedrandom(this.seed);};BingoGenerator.prototype.makeCard=function(){this.bingoBoard=this.generateMagicSquare();var populationOrder=this.generatePopulationOrder();for(var i=1;i<=25;i++){var nextPosition=populationOrder[i];var result=this.chooseGoalForPosition(nextPosition);if(result.goal){this.bingoBoard[nextPosition].types=result.goal.types;this.bingoBoard[nextPosition].subtypes=result.goal.subtypes;this.bingoBoard[nextPosition].rowtypes=result.goal.rowtypes;this.bingoBoard[nextPosition].name=result.goal[this.language]||result.goal.name;this.bingoBoard[nextPosition].id=result.goal.id;this.bingoBoard[nextPosition].time=result.goal.time;this.bingoBoard[nextPosition].goal=result.goal;this.bingoBoard[nextPosition].synergy=result.synergy;}
else{return false;}}
return this.bingoBoard;};BingoGenerator.prototype.generateMagicSquare=function(){var magicSquare=[];for(var i=1;i<=25;i++){var difficulty=this.difficulty(i);magicSquare[i]={difficulty:difficulty,desiredTime:difficulty*this.timePerDifficulty};}
return magicSquare;};function weightedShuffle(arr){return arr.map(el=>({el,sortVal:(el.weight||0)+Math.random()+Math.random()+Math.random()+Math.random()-2})).sort(({sortVal:sv1},{sortVal:sv2})=>sv2-sv1).map(({el})=>el);}
BingoGenerator.prototype.chooseGoalForPosition=function(position){var desiredDifficulty=this.bingoBoard[position].difficulty;var desiredTime=desiredDifficulty*this.timePerDifficulty;for(var offset=this.initialOffset;offset<=this.maximumOffset;offset++){var minTime=desiredTime-offset;var maxTime=desiredTime+offset;var goalsAtTime=this.getGoalsInTimeRange(minTime,maxTime);goalsAtTime=weightedShuffle(goalsAtTime);for(var j=0;j<goalsAtTime.length;j++){var goal=goalsAtTime[j];if(this.hasGoalOnBoard(goal)){continue;}
if(this.mode==='blackout'){if(this.hasConflictsOnBoard(goal)){continue;}}
var synergies=this.checkLine(position,goal);if(this.maximumSynergy>=synergies.maxSynergy&&synergies.minSynergy>=this.minimumSynergy){return{goal:goal,synergy:synergies.maxSynergy};}}}
return false;};BingoGenerator.prototype.generatePopulationOrder=function(){var populationOrder=[];populationOrder[1]=13;var diagonals=[1,7,19,25,5,9,17,21].shuffled();populationOrder=populationOrder.concat(diagonals);var nondiagonals=[2,3,4,6,8,10,11,12,14,15,16,18,20,22,23,24].shuffled();populationOrder=populationOrder.concat(nondiagonals);for(var k=23;k<=25;k++){var currentSquare=this.getDifficultyIndex(k);if(currentSquare===0)continue;for(var i=1;i<25;i++){if(populationOrder[i]==currentSquare){populationOrder.splice(i,1);break;}}
populationOrder.splice(1,0,currentSquare);}
return populationOrder;};BingoGenerator.prototype.difficulty=function(i){var Num3=this.seed%1000;var Rem8=Num3%8;var Rem4=Math.floor(Rem8/2);var Rem2=Rem8%2;var Rem5=Num3%5;var Rem3=Num3%3;var RemT=Math.floor(Num3/120);var Table5=[0];Table5.splice(Rem2,0,1);Table5.splice(Rem3,0,2);Table5.splice(Rem4,0,3);Table5.splice(Rem5,0,4);Num3=Math.floor(this.seed/1000);Num3=Num3%1000;Rem8=Num3%8;Rem4=Math.floor(Rem8/2);Rem2=Rem8%2;Rem5=Num3%5;Rem3=Num3%3;RemT=RemT*8+Math.floor(Num3/120);var Table1=[0];Table1.splice(Rem2,0,1);Table1.splice(Rem3,0,2);Table1.splice(Rem4,0,3);Table1.splice(Rem5,0,4);i--;RemT=RemT%5;x=(i+RemT)%5;y=Math.floor(i/5);var e5=Table5[(x+3*y)%5];var e1=Table1[(3*x+y)%5];value=5*e5+e1;if(this.mode=="long"){value=Math.floor((value+25)/2);}
value++;return value;};BingoGenerator.prototype.getShuffledGoals=function(difficulty){return this.goalsByDifficulty[difficulty].shuffled();};BingoGenerator.prototype.getDifficultyIndex=function(difficulty){for(var i=1;i<=25;i++){if(this.bingoBoard[i].difficulty==difficulty){return i;}}
return 0;};BingoGenerator.prototype.getGoalsInTimeRange=function(minTime,maxTime){return this.goalsList.filter(function(goal){return minTime<=goal.time&&goal.time<=maxTime;});};BingoGenerator.prototype.hasGoalOnBoard=function(goal){for(var i=1;i<=25;i++){if(this.bingoBoard[i].id===goal.id){return true;}}
return false;};BingoGenerator.prototype.hasConflictsOnBoard=function(goal){for(var i=1;i<=25;i++){var square=this.bingoBoard[i];if(square.goal){var squares=[goal,square.goal];var synergy=this.evaluateSquares(squares);if(synergy>=TOO_MUCH_SYNERGY){return true;}}}
return false;};BingoGenerator.prototype.getOtherSquares=function(row,position){var rowIndices=INDICES_PER_ROW[row].filter(function(index){return index!=position;});var board=this;return rowIndices.map(function(index){return board.bingoBoard[index];});};BingoGenerator.prototype.checkLine=function(position,potentialGoal){var rows=ROWS_PER_INDEX[position];var maxSynergy=0;var minSynergy=TOO_MUCH_SYNERGY;for(var rowIndex=0;rowIndex<rows.length;rowIndex++){var row=rows[rowIndex];var potentialSquare=JSON.parse(JSON.stringify(potentialGoal));potentialSquare.desiredTime=this.bingoBoard[position].desiredTime;var potentialRow=this.getOtherSquares(row,position);potentialRow.push(potentialSquare);var effectiveRowSynergy=this.evaluateSquares(potentialRow);maxSynergy=Math.max(maxSynergy,effectiveRowSynergy);minSynergy=Math.min(minSynergy,effectiveRowSynergy);}
return{minSynergy:minSynergy,maxSynergy:maxSynergy};};BingoGenerator.prototype.evaluateRow=function(row){return this.evaluateSquares(this.getOtherSquares(row));};BingoGenerator.prototype.getEffectiveTypeSynergiesForRow=function(row){var synergiesForSquares=this.calculateSynergiesForSquares(this.getOtherSquares(row));var effectiveTypeSynergies=this.calculateEffectiveTypeSynergies(this.calculateCombinedTypeSynergies(synergiesForSquares));var rowtypeSynergies=this.filterRowtypeSynergies(synergiesForSquares);return[effectiveTypeSynergies,rowtypeSynergies];};BingoGenerator.prototype.evaluateSquares=function(squares){var ids=squares.map(function(el){return el.id;}).filter(function(el){return el;});if(hasDuplicateStrings(ids)){return TOO_MUCH_SYNERGY;}
var synergiesForSquares=this.calculateSynergiesForSquares(squares);return this.calculateEffectiveSynergyForSquares(synergiesForSquares);};BingoGenerator.prototype.calculateSynergiesForSquares=function(squares){var typeSynergies={};var subtypeSynergies={};var rowtypeSynergies={};var timeDifferences=[];for(var m=0;m<squares.length;m++){var square=squares[m];this.mergeTypeSynergies(typeSynergies,square.types);this.mergeTypeSynergies(subtypeSynergies,square.subtypes);this.mergeTypeSynergies(rowtypeSynergies,square.rowtypes);if(square.time!==undefined&&square.desiredTime!==undefined){timeDifferences.push(square.desiredTime-square.time);}}
return{typeSynergies:typeSynergies,subtypeSynergies:subtypeSynergies,rowtypeSynergies:rowtypeSynergies,goals:squares,timeDifferences:timeDifferences};};BingoGenerator.prototype.mergeTypeSynergies=function(typeSynergies,newTypeSynergies){for(var type in newTypeSynergies){if(!typeSynergies[type]){typeSynergies[type]=[];}
typeSynergies[type].push(newTypeSynergies[type]);}};BingoGenerator.prototype.calculateCombinedTypeSynergies=function(synergiesForSquares){var typeSynergies=synergiesForSquares.typeSynergies;var subtypeSynergies=synergiesForSquares.subtypeSynergies;var combinedTypeSynergies={};for(var type in typeSynergies){if(type in subtypeSynergies){combinedTypeSynergies[type]=typeSynergies[type].concat(subtypeSynergies[type]);}
else{combinedTypeSynergies[type]=typeSynergies[type];}}
return combinedTypeSynergies;};BingoGenerator.prototype.filterRowtypeSynergies=function(synergiesForSquares){var rowtypeSynergies={};for(var rowtype in synergiesForSquares.rowtypeSynergies){var rowtypeSynergy=synergiesForSquares.rowtypeSynergies[rowtype];if(rowtypeSynergy.length<SQUARES_PER_ROW){continue;}
var rowtypeCost=0;for(var i=0;i<rowtypeSynergy.length;i++){rowtypeCost+=rowtypeSynergy[i];}
var rowTypeThreshold=this.rowtypeTimeSave[rowtype];if(rowTypeThreshold>0&&rowTypeThreshold>rowtypeCost){rowtypeSynergies[rowtype]=rowTypeThreshold-rowtypeCost;}
else if(rowTypeThreshold<0&&rowTypeThreshold>rowtypeCost){rowtypeSynergies[rowtype]=rowtypeCost-rowTypeThreshold;}}
return rowtypeSynergies;};BingoGenerator.prototype.calculateEffectiveTypeSynergies=function(typeSynergies){var effectiveTypeSynergies={};for(var type in typeSynergies){var synergies=typeSynergies[type];var effectiveSynergies=this.filterSynergyValuesForType(type,synergies);if(effectiveSynergies.length>0){effectiveTypeSynergies[type]=effectiveSynergies;}}
return effectiveTypeSynergies;};BingoGenerator.prototype.filterSynergyValuesForType=function(type,synergies){synergies.sortNumerically();var filter=this.synergyFilters[type]||"";if(/^min/.test(filter)){var count=Number(filter.split(" ")[1]);return synergies.slice(0,count);}
else if(/^max/.test(filter)){var count=Number(filter.split(" ")[1]);synergies.reverse();return synergies.slice(0,count);}
else{return synergies.slice(0,-1);}};BingoGenerator.prototype.calculateEffectiveSynergyForSquares=function(synergiesForSquares){var typeSynergies=this.calculateCombinedTypeSynergies(synergiesForSquares);var rowtypeSynergies=this.filterRowtypeSynergies(synergiesForSquares);var effectiveTypeSynergies=this.calculateEffectiveTypeSynergies(typeSynergies);var rowSynergy=0;for(var type in effectiveTypeSynergies){var synergies=effectiveTypeSynergies[type];for(var i=0;i<synergies.length;i++){if(synergies[i]>this.maximumIndividualSynergy){return TOO_MUCH_SYNERGY;}
rowSynergy+=synergies[i];}}
for(var rowtype in rowtypeSynergies){rowSynergy+=rowtypeSynergies[rowtype];}
var timeDifferences=synergiesForSquares.timeDifferences;for(var i=0;i<timeDifferences.length;i++){var timeDifference=timeDifferences[i];rowSynergy+=timeDifference;}
return rowSynergy;};ootBingoGenerator=function(bingoList,opts){var bingoGenerator=new BingoGenerator(bingoList,opts);var card=false;var iterations=0;while(!card&&iterations<100){card=bingoGenerator.makeCard();iterations++;}
card["meta"]={iterations:iterations};if(!card){console.log();console.log(iterations);}
return card;};console.log('TEST GENERATOR JAAA');

// eval(mod_pagespeed_$G02ckBwnJ);