<?php
if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $class = $_GET['class'];
    $response = "{}";

    if (isset($class)) {
        
        // Sanitize and validate name
        $class = sanitize($class);
    
        if (preg_match("/^[a-zA-Z]*$/", $class) && file_exists("presets/" . $class . ".json")) {
    
            $response = file_get_contents("presets/" . $class . ".json");
    
        }

    }

    header('Content-type: application/json');
    echo $response;
    
}

function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>