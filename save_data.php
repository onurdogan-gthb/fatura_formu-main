<?php
ob_start(); // Start output buffering
header('Content-Type: application/json');

// Enable error reporting for debugging (remove this in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Retrieve and decode JSON data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate data
if ($data === null || !isset($data['rows']) || !isset($data['summary'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON data received"]);
    exit;
}

// Database setup
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fatura_veritabani";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Prepare and execute SQL statements
// Insert rows into fatura_bilgileri
$stmt_rows = $conn->prepare("INSERT INTO fatura_bilgileri (sira, tarih, no, kisi, vergi_turu, tutar) VALUES (?, ?, ?, ?, ?, ?)");
if (!$stmt_rows) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare failed for fatura_bilgileri: " . $conn->error]);
    exit;
}

$stmt_rows->bind_param("issssd", $sira, $tarih, $no, $kisi, $vergiTuru, $tutar);

foreach ($data['rows'] as $row) {
    $sira = $row['sira'];
    $tarih = $row['tarih'];
    $no = $row['no'];
    $kisi = $row['kisi'];
    $vergiTuru = $row['vergiTuru'];
    $tutar = $row['tutar'];

    if (!$stmt_rows->execute()) {
        http_response_code(500);
        echo json_encode(["error" => "Execute failed for fatura_bilgileri: " . $stmt_rows->error]);
        exit;
    }
}

$stmt_rows->close();

// Insert summary into fatura_ozet
$stmt_summary = $conn->prepare("INSERT INTO fatura_ozet (genel_toplam_adet, genel_toplam_tutar, egitim_adet, egitim_tutar, temizlik_adet, temizlik_tutar, saglik_adet, saglik_tutar, gida_adet, gida_tutar, giyim_adet, giyim_tutar, kira_adet, kira_tutar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt_summary) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare failed for fatura_ozet: " . $conn->error]);
    exit;
}

$stmt_summary->bind_param("ididididididid", 
    $data['summary']['genel_toplam_adet'], $data['summary']['genel_toplam_tutar'],
    $data['summary']['egitim_adet'], $data['summary']['egitim_tutar'],
    $data['summary']['temizlik_adet'], $data['summary']['temizlik_tutar'],
    $data['summary']['saglik_adet'], $data['summary']['saglik_tutar'],
    $data['summary']['gida_adet'], $data['summary']['gida_tutar'],
    $data['summary']['giyim_adet'], $data['summary']['giyim_tutar'],
    $data['summary']['kira_adet'], $data['summary']['kira_tutar']
);

if (!$stmt_summary->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "Execute failed for fatura_ozet: " . $stmt_summary->error]);
    exit;
}

$stmt_summary->close();
$conn->close();

ob_end_clean(); // Discard the buffer contents
echo json_encode(["message" => "Data saved successfully"]);
exit;
?>