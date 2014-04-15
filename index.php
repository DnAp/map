<html>
<body style="-moz-user-select:none;-webkit-user-select:none;user-select:none;" unselectable='on'>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>CarMap :)</title>
<?
// dnap.su
$tokien['google'] = 'ABQIAAAAxMO1nwM0s13B2QG03di78RRImsiypdcZ0CGtKIM68fC9LcXHdRRoOqjRXjxUwx6aS6b7bh9kfhfXsg';
$tokien['ya'] = 'AB8cVk4BAAAAdpzTHAIAGl6H5WwlJKLfd5byIqYNnnhxhvEAAAAAAAAAAADSZBomZSu0YEfJoXs4CtE3YpnvgA==';

?>
<script type="text/javascript" src="http://localhost:12175/javascript/GpsGate.js"></script>
<script type="text/javascript" src="http://localhost:12176/gpsInfo.js"></script>
<script src="http://api-maps.yandex.ru/1.1/index.xml?key=<?=$tokien['ya']?>&modules=traffic~pmap" type="text/javascript"></script>
<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;sensor=true&amp;key=<?=$tokien['google']?>" type="text/javascript"></script>
 <script type="text/javascript"> 
var typemap = 0;
var gomapkey = '<?=$tokien['google']?>';
var yamapkey = '<?=$tokien['ya']?>';
var isLocalTest = false;
<?if(!empty($_GET['localtest'])):?>
	isLocalTest = true;
	gpsInfo = {isApple:1};
<?endif;?>

</script> 
<script type="text/javascript" src="mapya.js?1.0"></script> 
<script type="text/javascript" src="speedcam.js?1.0"></script> 

 <link rel="icon" type="image/png" href="SystemMap.png" />
 <link rel="stylesheet" type="text/css" media="all" href="css.css"/>
</head>

<div class="map"><div id="routemap"></div></div> 
	
<script>	
var $ = YMaps.jQuery;
var poipoint = false;
$(document).ready(function() {
	var style = new YMaps.Style("default#greenPoint");
		style.polygonStyle = new YMaps.PolygonStyle();
		style.polygonStyle.fill = 1;
		style.polygonStyle.outline = 0;
		style.polygonStyle.fillColor = "00ff0055";
	YMaps.Styles.add("polygon#Example", style);

	showGeneralMap('#routemap', <?=isset($_GET['x']) ? $_GET['x'] : 'false'?>, <?=isset($_GET['y']) ? $_GET['y'] : 'false'?>);
	
<?if(!empty($_GET['poipoint'])):?>	
	poipoint = true;
	$(".YMaps-search-control-text")[0].setAttribute('x-webkit-speech')
	var point = new SpeedCam(151263,30.3989550,59.9517683,5,60,1,320,500,15, "почти каждый день стоят тут с радаром");
	map.addOverlay(point);
	map.addOverlay(new SpeedCam(149605,29.6674361,60.1939681,104,60,1,252,500,15, "опасный поворот"));
	
	map.setCenter(new YMaps.GeoPoint(30.3989550,59.9517683));
<?endif;?>
});
</script>
<div id="info">
	<p>Спасибо хабрачеловеку <a href="http://blare.habrahabr.ru/">blare</a> за статью <a href="http://habrahabr.ru/blogs/webdev/116057/">Как подружить Yandex карты с Google и OSM?</a> и предоставленный в ней код</p>
	<p>Топик с обсуждением и описанием на <a href="http://www.compcar.ru/forum/showthread.php?t=8146">compcar.ru</a>
	<p><a href="http://dnap.su/">DnAp</a> 2011 - <?=date("Y")?></p>
</div>


</body>
</html>
