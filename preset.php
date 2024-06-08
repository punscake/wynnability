<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $data = json_decode(file_get_contents('php://input'), true);
    $response = "{}";

    if (isset($data['class'])) {
        
        // Sanitize and validate name
        $class = sanitize($data['class']);
    
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