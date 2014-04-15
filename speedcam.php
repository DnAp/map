<?
$zoom = $_GET['zoom'];
//1238_2453,1239_2453,1240_2453,1241_2453,1242_2453,
$sectorsStr = explode(',', $_GET["load"]);

$size = pow(2, $zoom-2)/100;

// return Math.pow(2,zoom-2)/100
$echoRows = array();
$paramNames = "IDX, X, Y, TYPE, SPEED, DirType, Direction, Distance, Angle, Comment";
$paramNames = explode(",", $paramNames);
$sectors = array();
$x1 = 100;
$x2 = 0;
$y1 = 100;
$y2 = 0;
foreach($sectorsStr as $sector) {
	if(!empty($sector)){
		list($x, $y) = explode("_", $sector);
		//echo $x.'-'.$y.'<br>';
		$sector = array(
				$x / $size, $y / $size, 
				($x+1) / $size, ($y+1) / $size
			);
		$x1 = $x1 > $sector[0] ? $sector[0] : $x1;
		$x2 = $x2 < $sector[2] ? $sector[2] : $x2;
		$y1 = $y1 > $sector[1] ? $sector[1] : $y1;
		$y2 = $y2 < $sector[3] ? $sector[3] : $y2;
		$sectors[] = $sector;
	}
}
//echo $x1.' '.$y1."\n".$x2.' '.$y2;
				
//SpeedCamPocketGIS
//	$str = '151263,30.3989550,59.9517683,5,60,1,320,500,15 // почти каждый день стоят тут с радаром -- pintez';

if($x2 >= 27.8733444 && $y2 >= 58.70456 && $x1 <= 34.5099715 && $y1 <= 61.1236668){
	$rows = file("mapcam_spb.txt");
}elseif($x2 >= 35.35005 && $y2 >= 54.3243229 && $x1 <= 40.02917 && $y1 <= 56.7693509){
	$rows = file("mapcam_msk.txt");
}elseif($x2 >= 80.25 && $y2 >= 53.72 && $x1 <= 85 && $y1 <= 56.13){
	$rows = file("mapcam_ngs.txt");
}else{
	echo '[]';
	exit;
}
$saveX = $saveY = 100;

foreach($rows as $row) {
	$str = $row;

	$key = count($paramNames)-1;


	$data = explode(',', $str, $key);

	$x = (float)$data[1]; // x
	$y = (float)$data[2]; // y
	if($saveX > $x && $x > 0 ){
		$saveX = $x;
	}
	if($saveY > $y && $y > 0){
		$saveY = $y;
	}
	$isTrue = false;
	//echo $x.' '.$y;
	//echo '<br>';
	$echo = false; 
	foreach($sectors as $sector){
		if(
			$sector[0] <= $x && 
			$sector[1] <= $y && 
			$sector[2] >= $x && 
			$sector[3] >= $y){
				$isTrue = true;
				break;
		}
	}
	if($isTrue) {
		list($angle, $comment) = explode("//", $data[$key-1], 2);
		$data[$key-1] = $angle;
		$data[$key] = '"'.addslashes( iconv("CP1251", "UTF-8", trim($comment))).'"';
		$line = array();
		foreach($paramNames as $k => $v){
			$line[]= $v.':'.$data[$k];
		}
		$echoRows[] = '{'.implode(",", $line).'}';
	}
}
//var_dump($saveX);
//var_dump($saveY);
echo "[".implode(",", $echoRows)."]";

?>