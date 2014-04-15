// Угадал тут цифру сколько градусов в метре
var gradInMeterX = 0.0000162;
var gradInMeterY = 0.0000091;

var SpeedCam = function(IDX, X, Y, TYPE, SPEED, DirType, Direction, Distance, Angle, Comment) {
	var _this = this, geoPointCenter = new YMaps.GeoPoint(X, Y);
	var canvas, polygon;
	var polygonePoints = [geoPointCenter];
	
	
	// Вызывается при добавления метки на карту 
    this.onAddToMap = function (pMap, parentContainer) {
		getElement().appendTo(parentContainer);
        this.onMapUpdate();
	}
	this.onMapUpdate = function () {
	
		if(map.getZoom() < 14){
			getElement().hide();
			return;
		}
        // Смена позиции оверлея
        var position = map.converter.coordinatesToMapPixels(geoPointCenter); // .moveBy(offset)
        getElement().show().css({
            left : position.x-9,
            top :  position.y-26
        })
    };

	
	this.drowLineTo = function(Angle)
	{
		Angle = Angle * (Math.PI/180) - Math.PI/2;
		var x = Math.cos( Angle ) * Distance * gradInMeterX;
		var y = -Math.sin( Angle ) * Distance * gradInMeterY;
		polygonePoints.push( new YMaps.GeoPoint(X+x, Y+y) );
		//canvas.lineTo(X + x, Y + y );
	}

	this.drow = function()
	{
		//canvas.beginPath();
		polygonePoints.push(geoPointCenter);
		
		var point = this.drowLineTo(Direction -( Angle / 2))
		
		if(Angle > 30){
			if(Angle > 100){
				this.drowLineTo(Direction - ( Angle * 3 / 8));
			}
			this.drowLineTo(Direction - ( Angle / 4));
			if(Angle > 100){
				this.drowLineTo(Direction - ( Angle / 8));
			}
			this.drowLineTo(Direction);
			if(Angle > 100){
				this.drowLineTo(Direction + ( Angle / 8));
			}
			this.drowLineTo(Direction + ( Angle / 4))
			if(Angle > 100){
				this.drowLineTo(Direction + ( Angle * 3 / 8));
			}
		}
		this.drowLineTo(Direction + ( Angle / 2));
		
		//canvas.fillStyle = "rgba(128, 255,128,0.5)"; 
		//canvas.fill();
	}
	
	// Получает ссылку на DOM-узел метки
    function getElement () {
        var element = YMaps.jQuery("<div class=\"SpeedCam type"+TYPE+"\"/>");

        // Устанавливает z-index (такой же, как у метки)
        element.css("z-index", YMaps.ZIndex.Overlay);

        // Открывает балун по щелчку кнопкой мыши по метке
        element.bind("click", function () {
            _this.openBalloon();
        });

        // Переопределяет метод после первого вызова,
        // чтобы не создавать DOM-узел дважды 
        return (getElement = function () {return element})();
    }
	
	// Рисуем полигон
	this.drow();
	
	polygon = new YMaps.Polygon(polygonePoints, { style: "polygon#Example"} );
	if(Comment.length > 50){
		var words = Comment.split(" ");
		Comment = [""];
		var cRow = 0;
		for(i = 0; i < words.length; i++){
			if(Comment[cRow].length + words[i].length > 50) {
				Comment.push("");
				cRow++;
			}
			Comment[cRow] += words[i]+" ";
		}
		Comment = Comment.join("<br>");
	}
	polygon.description = Comment; 
	
	map.addOverlay(polygon);
	
}