var polyline = Array();
var map;
var gmap;
var geoResult;
var day;
var indexP;
var placemark=0;
var arrplacemark = Array();
var groups = Array();
var points = Array();
var fstart = true;
var cacheMarks = Array();
var visMarks = Array();

var ghybrid;
var mapevents = Array();
var mapMapnik;
var mapOsmarender;
var mapCycle;
var meet=false;
var notload = false;
var maxsize = false;
var polyset = false;
var traffic;
var MoveToGps = false;
var GPSCar = false;
var carInterval = false;

var poipointList = [];

var router = null;
var routerToPoint = false;

var lastTime = new Date();

var keyPressed = {};

/*/ Таймер перезагружающий страницу когда комп просыпается // подглючивает
setInterval(function(){
    var date = new Date();
    if(lastTime.getTime() < date.getTime()-30000) {// 30 сек
        setInterval(function(){
            $.ajax({url: 'empty.html', 
			    type: 'GET',
			    dataType: 'html',
			    timeout: 1000,
			    success : function() {
                    document.location.href = document.location.href;
			    }
		    });
        }, 1000);
    }
    lastTime = date;
}, 3000);*/

// Таймер обновляющий положение роутера
setInterval(function(){
	if(routerToPoint != false){
		var newRouter = new YMaps.Router([GPSCar.geoPoint , routerToPoint], [], {avoidTrafficJams: true});
		YMaps.Events.observe(newRouter, newRouter.Events.Success, function() {
			map.addOverlay(newRouter);
			map.removeOverlay(router);
			router = newRouter;
		});
	}
}, 5000);

keyPressed[38] = function(){ // up
	var c = map.getCenter();
	c.setLat(c.getLat()+(map.getZoom()/5000));
	map.setCenter(c);
};

keyPressed[40] = function(){ // down
	var c = map.getCenter();
	c.setLat(c.getLat()-(map.getZoom()/5000));
	map.setCenter(c);
};

keyPressed[37] = function(){ // left
	var c = map.getCenter();
	c.setLng(c.getLng()-(map.getZoom()/5000));
	map.setCenter(c);
};

keyPressed[39] = function(){ // right
	var c = map.getCenter();
	c.setLng(c.getLng()+(map.getZoom()/5000));
	map.setCenter(c);
};



YMaps.jQuery(function(){
	$("body").keyup(function(event){
		if(typeof(keyPressed[event.keyCode]) != 'undefined' ){
			keyPressed[event.keyCode]();
		}
	});
});

function setSize(selector,max) {
	maxsize = max;
	if (max)
	{
		$('.upmenu, label').hide();
		$(selector).css({position:'fixed',top:0, left:0,zIndex:9999999999,width:$(window).width(),height:$(window).height()});
		$('#googlemap').css({width:$(window).width(),height:$(window).height()});
		var $ym = $('.YMaps-common-object-layer');
		$ym.width($ym.parent().width()).height($ym.parent().height());
	}
	else
	{
		$('.upmenu, label').show();
		$(selector).css({position:'relative',top:0,zIndex:1, left:0,width:'594px',height:'310px'});
		$('#googlemap').css({width:'594px',height:'310px'});
		var $ym = $('.YMaps-common-object-layer');
		$ym.width($ym.parent().width()).height($ym.parent().height());
	}
	if (gmap)
	gmap.checkResize() ;
	map.redraw();

}

// Запускается все здесь
function showGeneralMap(selector,x,y)
{
	loadConfig();
	x = x?x:0;
	y = y?y:0;
	map = new YMaps.Map(YMaps.jQuery(selector)[0]);
	if (x!=0 && y!=0)
		map.setCenter(new YMaps.GeoPoint(x, y), config.zoomLevel);
	else{
		map.setCenter(new YMaps.GeoPoint(30.31, 59.93), config.zoomLevel);
		
	}
	map.redraw();

	//map.addControl(new YMaps.Zoom());
	
	traffic = new YMaps.Traffic.Control({ showInfoSwitcher: true }, { infoLayerShown: true });
	map.addControl(traffic, new YMaps.ControlPosition(YMaps.ControlPosition.BOTTOM_LEFT, new YMaps.Point(5, 5)));
	traffic.show();
	
	standartLoad(selector);
	
	// Вешаем событие изменение опласти видимости карты
	YMaps.Events.observe(map,map.Events.BoundsChange, function () {
		var bounds = map.getBounds();
		loadMarks(bounds.getLeft(),bounds.getTop(),bounds.getRight(),bounds.getBottom());
	});
	
	// обновление пробок раз в 5 минут
	setInterval(function(){traffic.update();}, 5*60000);
}

// Машинка :)
function CarOverlay (geoPoint, angle) {

	this.centerPoint = map.getCenter();
    var _this = this;
	this.geoPoint = geoPoint;
	this.centerPoint = map.getCenter();
	
    // Вызывается при добавления метки на карту 
    this.onAddToMap = function (pMap, parentContainer) {
        getElement().appendTo(parentContainer);
        this.onMapUpdate();
    };

    // Вызывается при удаление метки с карты
    this.onRemoveFromMap = function () {
        if (getElement().parent()) {
            getElement().remove();
        }
    };

    // Вызывается при обновлении карты
    this.onMapUpdate = function () {
        // Смена позиции оверлея
        var position = map.converter.coordinatesToMapPixels(geoPoint);
		
        getElement().css({
            left : position.x - 8,
            top :  position.y - 8
        });
    };

    // Метод открывает балун
    this.openBalloon = function () {};

    // Получает ссылку на DOM-узел метки
    function getElement () {
        var element = YMaps.jQuery("<div class=\"overlay\"/>");
		
        // Устанавливает z-index (такой же, как у метки)
		angle -= 90;
        element.css("z-index", YMaps.ZIndex.Overlay);
		element.css("-webkit-transform", "rotate("+(angle)+"deg)");
		element.css("-o-transform", "rotate("+(angle)+"deg)");
		element.css("-webkit-transform", "rotate("+(angle)+"deg)");
		
		var rad = (angle * Math.PI) / 180.0;

		cos = Math.cos(rad),
		sin = Math.sin(rad);
		var filter='progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = ' + cos + ', M12 = ' + (-sin) + ', M21 = ' + sin + ', M22 = ' + cos + ')';
		element.css("filter", filter);
		
        // Переопределяет метод после первого вызова,
        // чтобы не создавать DOM-узел дважды 
        return (getElement = function () {return element})();
    }
}

function gpsGateCallback(gps)
{
	if(gps.trackPoint.position.longitude != 0 && gps.trackPoint.position.latitude != 0){
		var newPosition = new YMaps.GeoPoint(gps.trackPoint.position.longitude, gps.trackPoint.position.latitude);
		
		if(!GPSCar || !GPSCar.geoPoint.equals(newPosition)) {		
			var centerPoint = map.getCenter();
			var movedTo = {lat:0,lng:0};
			
			if(GPSCar && !centerPoint.equals(GPSCar.centerPoint)){
				movedTo.lng = centerPoint.getLng() - GPSCar.geoPoint.getLng();
				movedTo.lat = centerPoint.getLat() - GPSCar.geoPoint.getLat();
			}
			
			if(GPSCar == false){
				map.setCenter( newPosition );
			}else{
				GPSCar.onRemoveFromMap();
			}
			
			GPSCar = new CarOverlay(
				newPosition, 
				gps.trackPoint.velocity.heading);
			map.addOverlay(GPSCar);
			
			if(MoveToGps && map.getBounds().contains(GPSCar.geoPoint) && (movedTo.lng!=0 || movedTo.lat !=0 ) ) {
				
				var newCenterPoint = new YMaps.GeoPoint(
						gps.trackPoint.position.longitude + movedTo.lng, 
						gps.trackPoint.position.latitude + movedTo.lat
					);
				
				/* Идея хорошая, но требует доработки
				var pointA = map.converter.coordinatesToClientPixels(centerPoint);
				var pointB = map.converter.coordinatesToClientPixels(newCenterPoint);
				map.moveBy(new YMaps.Point(pointB.x - pointA.x,pointB.y - pointA.y), true);
				//*/ 
				map.setCenter(newCenterPoint);
			}
			
			
		}
	}
	//setTimeout(function(){GpsGate.Client.getGpsInfo(gpsGateCallback);} , 800);
}

function standartLoad(selector)
{
	// APPLE or LOCAL
	
	if(typeof(gpsInfo) != 'undefined' && typeof(gpsInfo.isApple) != 'undefined'){
		(function(){
			if (typeof(GpsGate) == 'undefined') { GpsGate = {}; }

			var _url = 'http://localhost:12176/';
			if(isLocalTest)
				_url = "";
			var _scriptCounter = 0;

			// API
			GpsGate.Client = {
				Copyright: 'Franson Technology AB - GpsGate',

				getGpsInfo: function(callback)
				{
					// Нет асинхронности!
					var id = 0;//_scriptCounter++;
					var scriptNodeId = 'GpsGateXss_' + id;

					var poolName = scriptNodeId;

					GpsGate.Client._callback[poolName] = function(/*arguments*/)
					{
						var scriptNode = document.getElementById(scriptNodeId);
						scriptNode.parentNode.removeChild(scriptNode);
						delete GpsGate.Client._callback[poolName];
						scriptNode = null;

						callback.apply(this, arguments);
					};

					var callUrl = _url + 'updatePosition.js?';

					var script = document.createElement('script');
					script.type = 'text/javascript';
					script.id = scriptNodeId;
					// script.charset = 'utf-8'; // necessary?

					var noCache = '&noCache=' + ((new Date()).getTime().toString().substr(5) + id);
					script.src = callUrl + noCache;

					// todo: use this method on non-conforming browsers? (altough both IE6 and PC-Safari seems to work anyway)
					// document.write('<script src="' + src + '" type="text/javascript"><\/script>');

					document.getElementsByTagName('head')[0].appendChild(script);
					script = null;
				},

				getVersion: function(callback)
				{
					callback();
					//xssCall('getVersion', {}, callback);
				},

				// -----
				_callback: {}
			};
			
			
			if (typeof(gpsInfo) == 'undefined')
			{
				gpsInfo = {};
			}
			gpsInfo.updatePosition = function(position){
				var gps = {trackPoint:position};
			
				GpsGate.Client._callback['GpsGateXss_0'](gps);
			}

		})();
	}
	// END APPLE


	var toolbar = new YMaps.ToolBar([]);
	// Создание кнопки-флажка
	var button = new YMaps.ToolBarToggleButton({
		icon: "map-fullscreen.png",
		hint: "Разворачивает карту на весь экран"
	});
	
	// Если кнопка активна, то карта разворачивается во весь экран
	YMaps.Events.observe(button, button.Events.Select, function () {
		setSize(selector,true);
		$(window).resize(function(){setSize(selector,true);});
		YMaps.jQuery("#info").hide();

	});
	// Если кнопка неактивна, то карта принимает фиксированный размер
	YMaps.Events.observe(button, button.Events.Deselect, function () {
		setSize(selector);
		$(window).unbind('resize');
		YMaps.jQuery("#info").show();
	});
	
	
	// Добавление кнопки на панель инструментов
	toolbar.add(button);
	button.select(); // по умолчанию fullScreen
	//toolbar.add(buttonSearch);
	
	if(typeof(GpsGate) != 'undefined'){
		///// Роутер
		var buttonRouter = new YMaps.ToolBarToggleButton({
			icon: "route.png",
			hint: "Проложить маршрут",
			width:60
		});
		
		YMaps.Events.observe(buttonRouter, buttonRouter.Events.Select, function () {
			map.removeOverlay(router);
			routerToPoint = false;
		});
		
		YMaps.Events.observe(buttonRouter, buttonRouter.Events.Deselect, function () {
			
		});
		
		YMaps.Events.observe(map, map.Events.Click, function(refMap, mouseEvent){
			if(buttonRouter.isSelected()) {
				
				var newRouter = new YMaps.Router([GPSCar.geoPoint , mouseEvent.getGeoPoint()], [], {avoidTrafficJams: true});
				YMaps.Events.observe(newRouter, newRouter.Events.Success, function() {
					map.addOverlay(newRouter);
				});
				routerToPoint = mouseEvent.getGeoPoint();
				router = newRouter;
				buttonRouter.deselect();
			}
		});
		
		toolbar.add(buttonRouter);
	}
	// Яркость

    button = new YMaps.ToolBarButton({
		icon: "images/eye.png",
		hint: "Яркость",
		width:60
	});
	YMaps.Events.observe(button, button.Events.Click, function () {
        var op = parseFloat($("#routemap").css("opacity"));
        op -= .2;
        if(op < .4){
            op = 1;
        }
        $("#routemap").css("opacity", op);
	});
	toolbar.add(button);

	// POI POINT
	button = new YMaps.ToolBarToggleButton({
		icon: "images/warning.png",
		hint: "Опасные участки(BETA)",
		width:60
	});
	
	YMaps.Events.observe(button, button.Events.Select, function () {
		poipoint = true;
	});
	
	YMaps.Events.observe(button, button.Events.Deselect, function () {
		poipoint = false;
	});
	
	toolbar.add(button);

	
	// Добавление панели инструментов на карту
	map.addControl(toolbar);
	
	// zoom +
	toolbar = new YMaps.ToolBar([]);
	button = new YMaps.ToolBarButton({
		icon: "images/plus.gif",
		hint: "Увеличивает масштаб",
		width:60
	});
	
	// bind key +
	keyPressed[187] = function(){
		var zoomLvl = map.getZoom()+1;
		map.setZoom(zoomLvl);
		config.zoomLevel = zoomLvl;
		saveConfig();
	};
	keyPressed[107] = keyPressed[187];
	
	YMaps.Events.observe(button, button.Events.Click, keyPressed[187]);
	toolbar.add(button);
	
	
	
	map.addControl(toolbar, new YMaps.ControlPosition(YMaps.ControlPosition.TOP_LEFT, new YMaps.Point(5, 60)));
	
	// zoom -
	toolbar = new YMaps.ToolBar([]);
	button = new YMaps.ToolBarButton({
		icon: "images/minus.gif",
		hint: "Уменьшает масштаб",
		width:60
	});
	// bind key -
	keyPressed[189] = function(){
		var zoomLvl = map.getZoom()-1;
		map.setZoom(zoomLvl);
		config.zoomLevel = zoomLvl;
		saveConfig();
	};
	keyPressed[109] = keyPressed[189];
	YMaps.Events.observe(button, button.Events.Click, keyPressed[189]);
	toolbar.add(button);
	
	map.addControl(toolbar, new YMaps.ControlPosition(YMaps.ControlPosition.TOP_LEFT, new YMaps.Point(5, 120)));
	
	// GPS 
	if (typeof(GpsGate) != 'undefined' && typeof(GpsGate.Client) != 'undefined')
	{
		GpsGate.Client.getGpsInfo(gpsGateCallback);
		carInterval = setInterval(function(){GpsGate.Client.getGpsInfo(gpsGateCallback);} , 800);
		MoveToGps = true;
		var toolbar = new YMaps.ToolBar([]);
		var button = new YMaps.ToolBarButton({
			icon: "rss_icon.png",
			hint: "GPS",
			width:60
		});
		
		YMaps.Events.observe(button, button.Events.Click, function () {
			
			if(GPSCar) {
				clearInterval(carInterval);
				carInterval = setInterval(function(){GpsGate.Client.getGpsInfo(gpsGateCallback);} , 800);
				map.setCenter(GPSCar.geoPoint);
			}
		});
		
		toolbar.add(button);
		map.addControl(toolbar, new YMaps.ControlPosition(YMaps.ControlPosition.TOP_LEFT, new YMaps.Point(5, 180)));
	}
	
	map.enableScrollZoom();

	var searchControl = new YMaps.SearchControl({
		resultsPerPage: 5,  // Количество объектов на странице
		useMapBounds: 1     // Объекты, найденные в видимой области карты
		// будут показаны в начале списка
	});
	var search = new YMaps.SearchControl({noPlacemark:true,prefLang:'ru',resultsPerPage:5});
	YMaps.Events.observe(search, search.Events.Select, function () { this.collapse();});
	map.addControl(search);

	
	addListBoxTypeMap();
	changeMapType(typemap);
	//bindGoogleMap();
}

function unbindGoogleMap()
{
	$('#googlemap').hide();
	$('.YMaps-map-type-layer-container').show();
	$('.YMaps-layer YMaps-common-object-layer').show();
	if (mapevents[0])
	mapevents[0].cleanup();
	if (mapevents[1])
	mapevents[1].cleanup();
	var $ym = $('.YMaps-common-object-layer');
	$ym.width('auto').height('auto');
}
function bindGoogleMap(type)
{
	var selector = '#'+$(map.getContainer()).attr('id');
	map.setType(new YMaps.MapType(["none#layer"],'',{minZoom:1, maxZoom:17}));
	map.redraw();
	if ($('#googlemap').length==0)
	{
		var $div = $('<div>').attr('id','googlemap').width($(selector).width()).height($(selector).height());
		
		if (!meet)
		$div.css({zIndex:1});
		$(selector).prepend($div);
	}
	
	$('#googlemap').show();
	$('.YMaps-layer-container').css({background:'transparent',zIndex:'auto'});
	if (polyset)
	$('.YMaps-common-object-layer').css({zIndex:'1'});
	else
	$('.YMaps-common-object-layer').css({zIndex:'auto'});
	
	//$('.YMaps-common-object-layer svg').parent().wrapInner($('<div>').css({zIndex:5,position:'absolute'}));
	$('.YMaps-common-object-layer svg').parent().css({zIndex:5});
	if (maxsize) setSize(selector,true);
	$('.YMaps-map-type-layer-container').hide();
	//$('.YMaps-layer YMaps-common-object-layer').hide();
	if (!gmap)
	{
		gmap = new GMap2(document.getElementById('googlemap'));
		gmap.enableContinuousZoom();
		gmap.enableScrollWheelZoom();
		addOSMLayer();
	}
	switch(type)
	{
		case 'gotsat': case 4:
		gmap.setMapType(G_SATELLITE_MAP);;
		break;
		case 'gothyb': case 5:
		gmap.setMapType(G_HYBRID_MAP);;
		break;
		case 'gotrel': case 6:
		gmap.setMapType(G_PHYSICAL_MAP);;
		break;
		case 'osmmap': case 7:
		gmap.setMapType(mapMapnik);
		break;
		case 'osmbike': case 8:
		gmap.setMapType(mapCycle);
		break;
		default: gmap.setMapType(G_NORMAL_MAP);
	}
	gmap.setCenter(new GLatLng(map.getCenter().getLat(), map.getCenter().getLng()), map.getZoom());
	//Двигают картой
	GEvent.addListener(gmap,"move", function (overlay, latlng) {
		map.setCenter(new YMaps.GeoPoint(gmap.getCenter().lng(), gmap.getCenter().lat()), gmap.getZoom());
	}, this);
	//Как-то изменяют область видимости
/*	GEvent.addListener(gmap,"update", function (overlay, latlng) {
		map.setCenter(new YMaps.GeoPoint(gmap.getCenter().lng(), gmap.getCenter().lat()), gmap.getZoom());
	}, this);*/
	//Если нажимают на контроллер зумаaddPolyline
	mapevents[0] = YMaps.Events.observe(map, map.Events.BoundsChange, function () {
		gmap.setCenter(new GLatLng(map.getCenter().getLat(), map.getCenter().getLng()), map.getZoom());
	});
	mapevents[1] = YMaps.Events.observe(map, map.Events.Move, function () {
		gmap.setCenter(new GLatLng(map.getCenter().getLat(), map.getCenter().getLng()), map.getZoom());
	});
	var $ym = $('.YMaps-common-object-layer');
	$ym.width($ym.parent().width()).height($ym.parent().height());
}
function addOSMLayer()
{
	var copyOSM = new GCopyrightCollection("<a href=\"http://www.openstreetmap.org/\">OpenStreetMap</a>");
	copyOSM.addCopyright(new GCopyright(1, new GLatLngBounds(new GLatLng(-90,-180), new GLatLng(90,180)), 0, " "));
	var tilesMapnik     = new GTileLayer(copyOSM, 1, 17, {tileUrlTemplate: 'http://tile.openstreetmap.org/{Z}/{X}/{Y}.png'});
	var tilesOsmarender = new GTileLayer(copyOSM, 1, 17, {tileUrlTemplate: 'http://tah.openstreetmap.org/Tiles/tile/{Z}/{X}/{Y}.png'});
	var tilesCycle    = new GTileLayer(copyOSM, 1, 17, {tileUrlTemplate: 'http://c.tile.opencyclemap.org/cycle/{Z}/{X}/{Y}.png'});
	mapMapnik     = new GMapType([tilesMapnik],     G_NORMAL_MAP.getProjection(), "Mapnik");
	mapOsmarender = new GMapType([tilesOsmarender], G_NORMAL_MAP.getProjection(), "Osmarend");
	mapCycle = new GMapType([tilesCycle], G_NORMAL_MAP.getProjection(), "Cycle");
	gmap.addMapType(mapMapnik);
	gmap.addMapType(mapOsmarender);
	gmap.addMapType(mapCycle);
}

function getArrTypeMapList()
{
	var arr = Array();
	for (var i=0; i<11; i++)
	arr[i] = Array();
	arr[0][0] = '<font class="ya">Y</font>andex Карта';
	arr[0][1] = "yatmap";
	arr[1][0] = '<font class="ya">Y</font>andex Спутник';
	arr[1][1] = "yatsat";
	arr[2][0] = '<font class="ya">Y</font>andex Гибрид';
	arr[2][1] = "yathyb";
	arr[3][0] = '<font class="go1">G</font><font class="go2">o</font><font class="go3">o</font><font class="go1">g</font><font class="go4">l</font><font class="go2">e</font> Карта';
	arr[3][1] = "gotmap";
	arr[4][0] = '<font class="go1">G</font><font class="go2">o</font><font class="go3">o</font><font class="go1">g</font><font class="go4">l</font><font class="go2">e</font> Спутник';
	arr[4][1] = "gotsat";
	arr[5][0] = '<font class="go1">G</font><font class="go2">o</font><font class="go3">o</font><font class="go1">g</font><font class="go4">l</font><font class="go2">e</font> Гибрид';
	arr[5][1] = "gothyb";
	arr[6][0] = '<font class="go1">G</font><font class="go2">o</font><font class="go3">o</font><font class="go1">g</font><font class="go4">l</font><font class="go2">e</font> Рельеф';
	arr[6][1] = "gotrel";
	arr[7][0] = "OpenStreetMap";
	arr[7][1] = "osmmap";
	arr[8][0] = "OSM Cycle ";
	arr[8][1] = "osmbike";
	arr[9][0] = "Народная карта";
	arr[9][1] = "pmap";
	arr[10][0] = "Народная гибрид";
	arr[10][1] = "pmaphyb";
	return arr;
}
function addListBoxTypeMap()
{
	typemap = typemap?typemap:0;
	var arr = getArrTypeMapList();

	var toolBar = new YMaps.ToolBar([]);
	var listBox = new YMaps.ListBox({caption: arr[typemap][0]});

	var mapstype = Array();
	for (var i=0 ; i<arr.length; i++)
	{
		mapstype[i] = new YMaps.ListBoxItem(arr[i][0]);
		addClickEvent(mapstype[i],arr[i]);

		listBox.add(mapstype[i]);
	}
	function addClickEvent(maptype,arr)
	{
		YMaps.Events.observe(maptype, maptype.Events.Click, function (maptype)
		{
			listBox.setCaption(arr[0]);
			listBox.collapse();
			changeMapType(arr[1]);
		}
		);
	}
	var sep=new YMaps.ListBoxItem("<hr>");
	var sep2=new YMaps.ListBoxItem("<hr>");
	toolBar.add(listBox);
	map.addControl(toolBar,new YMaps.ControlPosition(YMaps.ControlPosition.TOP_RIGHT, new YMaps.Point(5, 5)));
	addGoogleLayer();
}

function getZoomValue(zoom)
{
	return Math.pow(2,zoom-2)/100;
}

function loadMarks(x1,y1,x2,y2)
{
	zoom = map.getZoom();
	if(poipoint && zoom >= 14) {
		var zoom = map.getZoom();
		size = getZoomValue(zoom);
        mx1 = Math.floor(x1*size);
        my1 = Math.floor(y1*size);
        mx2 = Math.floor(x2*size);
        my2 = Math.floor(y2*size);
        if(typeof(poipointList[zoom]) == 'undefined'){
            poipointList[zoom] = [];
        }
        var key;   
        var fromLoad = [];
        for (var i=mx1; i<=mx2 ;i++) {
			for (var j=my2; j<=my1 ;j++) {
                key = ""+i+"_"+j;
                if(typeof(poipointList[zoom][key]) == 'undefined'){
                    fromLoad.push( key);
                }
            }
        }

		if(fromLoad.length > 0){
			$.getJSON('speedcam.php',
				{zoom:zoom, load: fromLoad.join(',')},
				function(data){
					fLoadMarks(data, fromLoad, zoom);
				});
		}
	}
}

function fLoadMarks(data, fromLoad, zoom)
{
	$.each(fromLoad, function(index, key){
		poipointList[zoom][key] = true;
	});
	$.each(data, function(index, carData){
		
		var point = new SpeedCam( carData.IDX, carData.X, carData.Y, carData.TYPE, carData.SPEED, 
				carData.DirType, carData.Direction, carData.Distance, carData.Angle, carData.Comment);
		map.addOverlay(point);
		
	
	});
	
}

function addGoogleLayer()
{
	var none = new YMaps.TileDataSource('', false, false);
	var tnone = function () {return new YMaps.Layer(none)};
	YMaps.Layers.add("none#layer", tnone);
}
function changeMapType(type)
{
	unbindGoogleMap();
	var min = 2;
	var max = 17;
	switch (type)
	{
		case 'yatmap': case 0:
		map.setType(YMaps.MapType.MAP);
		break;
		case 'yathyb': case 1:
		map.setType(YMaps.MapType.HYBRID);
		break;
		case 'yatsat': case 2:
		map.setType(YMaps.MapType.SATELLITE);
		break;
		case 'pmap': case 9:
		map.setType(YMaps.MapType.PMAP);
		break;
		case 'pmaphyb': case 10:
		map.setType(YMaps.MapType.PHYBRID);
		break;
		case 'gotmap': case 3:
		bindGoogleMap(type);
		break;
		case 'gotsat': case 4:
		bindGoogleMap(type);
		break;
		case 'gothyb': case 5:
		bindGoogleMap(type);
		break;
		case 'gotrel': case 6:
		bindGoogleMap(type);
		break;
		case 'osmmap': case 7:
		bindGoogleMap(type);
		break;
		case 'osmbike': case 8:
		bindGoogleMap(type);
		break;
	}

}

var config = {
	moveToGps: false,
	zoomLevel: 10,
	mapType: "yatmap"
};

function loadConfig(){
	var cfg = getCookie('config');
	if(cfg != null){
		cfg = cfg.split(";");
		$.each(cfg, function(key, val){
			if(val != ""){
				var data = val.split('=', 2);
				config[data[0]] = data[1];
			}
		});
	}
}
function saveConfig(){
	var cfg = "";
	$.each(config, function(key, val){
		cfg += key + "=" + val + ";";
	});
	setCookie("config", cfg, {expires:30});
}

// возвращает cookie если есть или undefined
function getCookie(name) {
	var matches = document.cookie.match(new RegExp(
	  "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	))
	return matches ? decodeURIComponent(matches[1]) : undefined 
}

// уcтанавливает cookie
function setCookie(name, value, props) {
	props = props || {}
	var exp = props.expires
	if (typeof exp == "number" && exp) {
		var d = new Date()
		d.setTime(d.getTime() + exp*1000*60*60*24)
		exp = props.expires = d
	}
	if(exp && exp.toUTCString) { props.expires = exp.toUTCString() }

	value = encodeURIComponent(value)
	var updatedCookie = name + "=" + value
	for(var propName in props){
		updatedCookie += "; " + propName
		var propValue = props[propName]
		if(propValue !== true){ updatedCookie += "=" + propValue }
	}
	document.cookie = updatedCookie

}

// удаляет cookie
function deleteCookie(name) {
	setCookie(name, null, { expires: -1 })
}

