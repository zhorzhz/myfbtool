<?PHP  
// FTP this script to a server  
$url = "http://findmyfbid.com/";  
$fields = "url=".$_POST['url'];
$ch = curl_init();      
curl_setopt($ch, CURLOPT_URL, $url);  
curl_setopt($ch, CURLOPT_POST, 1); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);     
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);  
$result = curl_exec($ch);   
curl_close($ch);  
$start = strpos($result, '/success/') + 9;
$end = strpos(substr($result, $start), '" />');
$f = substr($result, $start, $end);
if(is_numeric($f)){
	echo $f;
} else {
	$url2 = "https://lookup-id.com/";  
	$fields2 = "fburl=".$_POST['url']."&check=Lookup";
	$fields3 = array('fburl' => $_POST['url'], "check" => "Lookup");
	$ch2 = curl_init();      
	curl_setopt($ch2, CURLOPT_URL, $url2);  
	curl_setopt($ch2, CURLOPT_POST, 1); 
	curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);     
	curl_setopt($ch2, CURLOPT_POSTFIELDS, $fields3);  
	$result2 = curl_exec($ch2);   
	curl_close($ch2);  
	$start2 = strpos($result2, 'id="code">') + 10;
	$end2 = strpos(substr($result2, $start2), '</span>');
	$f2 = substr($result2, $start2, $end2);
	if(is_numeric($f2)){
		echo $f2;
	} else {
		echo 'Oops ... Problem with getting id';
	}
}

?>