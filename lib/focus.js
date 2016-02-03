(function($){
	// judge jQuery is exists
	// if not,just exit
	if($ == undefined){
		console.log('jQuery is undefined');
		return;
	}

	//default config
	var FocusConfig = {
		KEYS:{
			'LEFT': 37,
			'RIGHT': 39,	
			'UP': 38,
			'DOWN': 40
		},
		cacheTime:2000,//default focus cache  time 1000s
		KEYSMAP:{
			'LEFT':'RIGHT',
			'RIGHT':'LEFT',
			'UP':'DOWN',
			'DOWN':'UP'
		},
		direction:{
			'111':'RIGHT',
			'101':'RIGHT',
			'100':'UP',
			'000':'UP',
			'011':'LEFT',
			'001':'LEFT',
			'010':'DOWN',
			'110':'DOWN'
		}
	}

	var tree = [];

	function bindGroups(){

	}


	function buildFocusDomTree(){
		var defLevels = $("[data-focus-level]");
		if(!defLevels){
		}else{
			for (var i = 0; i < defLevels.length; i++) { 
				var level = defLevels[i];
				var levelName = $(level).data('focusLevel');//.attributes['data-focus-level'].value;
				var levelArr = [];
				var defGroups = $(level).find("[data-focus-group]");
				var groupArr = []
				for (var j = 0; j < defGroups.length; j++) {
					var group = defGroups[j];
					var groupName =$(group).data('focusGroup');
					var elements = [];
					groupElements = $(group).find("[focusable]");
					for (var k = 0; k < groupElements.length; k++) {
						elements.push($(groupElements[k]));
					};
					var groupObj = {'group':groupName,'elements':elements};
					groupArr.push(groupObj);
				};
				var levelObj = {'level':levelName,'groups':groupArr};
				tree.push(levelObj);
			};
		}

	}

	//-----------------------start directive cache module----------------//
	var FocusCache = {
		lastFocus:undefined,
		curFocus:undefined,
		directive:undefined,
		cacheTiemoutId:undefined,
		cacheTime:FocusConfig.cacheTime,
		setFocusCahce : function(current,directive){
			var that = this;
			that.lastFocus = that.curFocus;
			that.curFocus = current;
			that.directive = directive;
			if(that.lastFocus){
				if(that.cacheTiemoutId){
					clearTimeout(that.cacheTiemoutId);
				}
				that.cacheTiemoutId = setTimeout(function(){
					that.lastFocus = undefined;
				},that.cacheTime);
			}
		},
		getFocusCache : function(current,directive){
			var that = this;
			var opposite = FocusConfig.KEYSMAP[directive];//get the last focus directive
			var cache;
			if(current == that.curFocus && opposite == that.directive){
				cache =  that.lastFocus;
			}
			return cache;
		},
		setCacheTime : function(time){
			FocusConfig.cacheTime =  time;
		}
	};
	//----------------------end directive cache module----------------//





	//-----------------------start calculate distance---------------------//

	/*
	** get the element position(x,y)
	*/
	function getPosition(element){
		var position = {};
		position.height = element.height();
		position.width = element.width();
		var offset = element.offset();
		position.left = offset.left;
		position.top = offset.top;
		return position;
	}
	function getPoint(element){
		var position = getPosition(element);
		var point = {};
		point.x = position.left + position.width / 2;
		point.y = position.top + position.height / 2;
		return point;
	}
	/*
	**calculate the distance between elements
	*/
	function calDistance(from,to){
		//var from = getPoint(ele1);
		//var to = getPoint(ele2);
		return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
	}
	function calPointGroupDistance(center,group,directive){
		var element = group[0];
		var elePoint = getPoint($(element));
		var centerPoint = getPoint($(center));
		var distance = 0;
		switch(directive){
			case 'UP':
				distance = centerPoint.y - elePoint.y;
				break;
			case 'DOWN':
				distance = elePoint.y - centerPoint.y;
				break;
			case 'LEFT':
				distance = centerPoint.x - elePoint.x;
				break; 
			case 'RIGHT':
				distance = elePoint.x - centerPoint.x;
				break; 
		}
		return distance;
	}
      
	/*
	**get element direction
	*/
	function getFocusDirection(centerPoint,point){
		var offsetX =point.x - centerPoint.x;
		var offsetY = point.y - centerPoint.y;
		var directions = "";
		function pushDirection(value){
			if(value){
				directions += '1';
			}else{
				directions += '0';
			}
			
		}
		pushDirection(offsetX >= 0);
		pushDirection(offsetY >= 0);
		pushDirection(Math.abs(offsetX) >= Math.abs(offsetY));
		console.log(FocusConfig.direction[directions])
		return FocusConfig.direction[directions];
	}


	//-----------------------end calculate distance---------------------//



	//-----------------------start FocusTree manage---------------------//

		var FocusTree = (function(){
			function flushTree(){
			}
			function getElementGroup(element,levelName,groupName){
				for (var i = 0; i < tree.length; i++) {
					if(tree[i].level == levelName){
						var groups = tree[i].groups;
						for (var j = 0; j < groups.length; j++){
							if(groups[j].group == groupName){
								return groups[j].elements;
							}
						};
					}
				};
				return null;
			}
			function getTreeGroup(level){
				for (var i = 0; i < tree.length; i++) {
					if(tree[i].level == level){
						return tree[i].groups;
					}
				};
				return null;
			}
			return {
				flushTree            : flushTree(),
				getElementGroup      : getElementGroup,
				getTreeGroup         : getTreeGroup
			}
		})();

	//-----------------------end FocusTree manage---------------------//




	//get the nearby element,steps:
	//first search in current group
	//if there is no next element in current group
	//then search in current level other group

	function findParent(element,back){
		var parents = element.parents();
		for (var i = 0; i < parents.length; i++) {
			var parent = parents[i];
			if(parent.tagName == 'BODY'){
				if(!back.group){
					back.group = 'group0';
				}
				back.level = 'level0';
				return back;
			}
			if($(parent).attr("data-focus-group") && !back.level){
				back.group = $(parent).data('focusGroup');
			}
			if($(parent).attr("data-focus-level")){
				if(!back.group){
					back.group = 'group0';
				}
				back.level = $(parent).data('focusLevel');
				return back;
			}
		};
	}

	// group find strategy2
	//find in eghit direction
	function findNearestElements(center,elements,directive){
		var next = {};
		var centerPoint = getPoint(center);
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var point = getPoint(element);
			if(centerPoint.x == point.x && centerPoint.y == point.y){
				continue;
			}else{
				if(!directive || getFocusDirection(centerPoint,point) == directive){//is user press directive
					var distance = calDistance(centerPoint,point);
					if(!next.distance || distance < next.distance){
						next.distance = distance;
						next.element = element;
					}
				}
			}
			
		};
		return next;
	}
	// group find strategy2 
	//find in cross four direction 
	function findNearestIngroup(center,elements,directive){
		var next = {};
		var centerPoint = getPoint(center);
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var point = getPoint(element);
			if(centerPoint.x == point.x && centerPoint.y == point.y){
				continue;
			}else{
				var isSameDirection = false;
				switch(directive){
					case 'LEFT':
						isSameDirection = (centerPoint.x - point.x) > 0;
						break;
					case 'RIGHT':
						isSameDirection = (point.x - centerPoint.x) > 0;
						break;
					case 'UP':
						isSameDirection = (centerPoint.y - point.y) > 0;
						break;
					case 'DOWN':
						isSameDirection = (point.y - centerPoint.y) > 0;
						break;
				}
				if(isSameDirection){
					var distance = calDistance(centerPoint,point);
					if(!next.distance || distance < next.distance){
						next.distance = distance;
						next.element = element;
					}
				}
			}
		}
		return next;
	}

	function findNearbyNext(curFocus,back,directive){
		var hasNext;
		elements = FocusTree.getElementGroup(curFocus,back.level,back.group);
		var next = findNearestElements(curFocus,elements,directive);
		if(next.element && next.distance){
			hasNext = next;
		}else{
			next = findNearestIngroup(curFocus,elements,directive);
			if(next.element && next.distance){
				hasNext = next;
			}
		}
		return hasNext;
	}
	function findNextByGroup(curFocus,back,directive){
		var groups = FocusTree.getTreeGroup(back.level);
		var min = 9999;
		var next;
		var group;
		for (var i = 0; i < groups.length; i++) {
			if(groups[i].group == back.group){
				continue;
			}else{
				var distance = calPointGroupDistance(curFocus,groups[i].elements,directive)
				if(distance > 0 && distance < min){
					min = distance;
					group  = groups[i].elements;
				}
			}
		}
		if(group){
			var next = findNearestElements(curFocus,group);
			if(next.element && next.distance){
				return next.element;
			}else{
				return;
			}
		}
		return;
	}
	function findNextByLevel(curFocus,back,directive){
		var groups = FocusTree.getTreeGroup(back.level);
		var min = 9999;
		var next;
		for (var i = 0; i < groups.length; i++) {
			if(groups[i].group == back.group){
				continue;
			}else{
				back.group = groups[i].group;
				hasNext = findNearbyNext(curFocus,back,directive);
				if(hasNext){
					if(hasNext.distance < min){
						min = hasNext.distance;
						next = hasNext.element;
					}
				}
			}
		};
		return next;
	}

	function hasCache(directive){
		var isExists = false;
		var curFocus = FocusCache.curFocus;
		var cache = FocusCache.getFocusCache(curFocus,directive);
		if(cache){
			setFocus(cache,curFocus);
			FocusCache.setFocusCahce(cache,directive);//update cache
			isExists = true;
		}
		return isExists;
	}
	function hasCustom(directive){
		var isExists = false;
		var curFocus = FocusCache.curFocus;
		var query;
		var nexts = curFocus.data('focusNext');
		for(key in nexts){
		    var nextStr = key.toUpperCase();
			if(nextStr == directive){
				query = nexts[key];
				break;
			}
		};
		if(query){
			setFocus($(query),curFocus);
			FocusCache.setFocusCahce($(query),directive);//update cache
			isExists = true;
		}
		return isExists;
	}

	function getNearby(directive){
		var curFocus = FocusCache.curFocus;
		var back = {};
		findParent(curFocus,back);//find the level and group
		if(back.level && back.group){
			var hasNext = findNearbyNext(curFocus,back,directive);//current group
			if(hasNext){
				setFocus(hasNext.element,curFocus);
				FocusCache.setFocusCahce(hasNext.element,directive);//update cache
				return;
			}
			else{
				// can't find next in current group
				///strategy1: find the nearest group by the directive
				// call findNextByGroup
				var next = findNextByGroup(curFocus,back,directive);
				if(next){
					setFocus(next,curFocus);
					FocusCache.setFocusCahce(next,directive);//update cache
				}

				// can't find next in current group
				//strategy2: find the nearest element  by the level
				// call findNextByLevel
				
			}
		}
	}

	function setFocus(current,last){
		if(last){
			last.removeClass('focused');
		}
		current.addClass('focused');
	}

	function setDefaultFocus(){
		$('#item1').addClass('focused');
		FocusCache.setFocusCahce($("#item1"));
	}


	//-----------------------start directive handler---------------------//
	/*
	** directive handler
	*/
	function handler(directive){
		//1.judge cache,2.user define 3.find the nearest element by the current element(group,level other)
		if(hasCache(directive)){
			return;
		}
		if(hasCustom(directive)){
			return;
		}
		
		getNearby(directive);
	}


	function init(){
		buildFocusDomTree();
		setDefaultFocus();
		$(window).keydown(function(event){
  			switch(event.keyCode) {
  				case FocusConfig.KEYS.LEFT:
  					handler('LEFT');
  					break;
  				case FocusConfig.KEYS.RIGHT:
  					handler('RIGHT');
  					break;
  				case FocusConfig.KEYS.UP:
  					handler('UP');
  					break;
  				case FocusConfig.KEYS.DOWN:
  					handler('DOWN');
  					break;
  				default:
  					break;
  			}
		});
	}

	//-----------------------end directive handler-----------------------//

	//初始化事件监听
	$(document).ready(init);
})(jQuery)