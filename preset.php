<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    //echo file_get_contents("presets/archer.json");
    // Sanitize and validate name
    print($_POST);
    
    $class = sanitize($_POST['class']);
    
    $response = "{}";

    if (preg_match("/^[a-zA-Z]*$/", $class) && file_exists("presets/" + $class + ".json")) {

        $response = file_get_contents("presets/" + $class + ".json");

    }

    header('Content-type: application/json');
    //echo $response;

}

function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>