<?php
// Hardcoded NEA billing info per house
$houses = [
    'house1' => [
        'label' => 'House Bill Residential',
        'region_id' => '242',
        'sc_no' => '026.17.032D ',
        'consumer_id' => '50239',
        'icon' => '🏠',
    ],
    'house2' => [
        'label' => 'Moti Cow Farm Agriculture ',
        'region_id' => '242',
        'sc_no' => '023.17.717',
        'consumer_id' => '37874',
        'icon' => '🏡',
    ],
    'house3' => [
        'label' => 'Moti Cow Farm Industrial',
        'region_id' => '242',
        'sc_no' => '026.17.501A',
        'consumer_id' => '66010',
        'icon' => '🏘️',
    ],
    'house4' => [
        'label' => 'Bhetnari Khet Irrigation',
        'region_id' => '242',
        'sc_no' => '026.17.722A ',
        'consumer_id' => '61220',   
        'icon' => '🏠',
    ],
];

// Enhanced function with better error handling and caching
function fetchBill($location, $sc_no, $consumer_id, $from, $to) {
    $url = 'https://www.neabilling.com/viewonline/viewonlineresult/';
    
    // Cache key for this request
    $cache_key = md5($location . $sc_no . $consumer_id . $from . $to);
    $cache_file = sys_get_temp_dir() . "/nea_cache_{$cache_key}.json";
    
    // Check cache (valid for 5 minutes)
    if (file_exists($cache_file) && (time() - filemtime($cache_file) < 300)) {
        return json_decode(file_get_contents($cache_file), true);
    }

    $postData = http_build_query([
        'NEA_location' => $location,
        'sc_no' => $sc_no,
        'consumer_id' => $consumer_id,
        'Fromdatepicker' => $from,
        'Todatepicker' => $to,
    ]);

    $headers = [
        'Content-Type: application/x-www-form-urlencoded',
        'Referer: https://www.neabilling.com/viewonline/',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return ['error' => 'Connection failed: ' . $error];
    }

    if ($httpCode !== 200) {
        return ['error' => 'HTTP Error: ' . $httpCode];
    }

    $result = parseNEAResponse($html);
    
    // Cache the result
    file_put_contents($cache_file, json_encode($result));
    
    return $result;
}

// Enhanced parsing function with better data validation
function parseNEAResponse($html) {
    if (empty($html)) {
        return ['error' => 'Empty response received'];
    }

    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML($html);
    $xpath = new DOMXPath($dom);

    $info = [
        'customer_name' => '',
        'sc_no' => '',
        'consumer_id' => '',
        'location' => ''
    ];

    // Extract Customer Info
    $tables = $xpath->query('//table[contains(@class, "sortable")]');
    foreach ($tables as $table) {
        if (strpos($table->textContent, 'Customer Name') !== false) {
            $rows = $table->getElementsByTagName('tr');
            foreach ($rows as $tr) {
                $tds = $tr->getElementsByTagName('td');
                if ($tds->length >= 4 && strpos($tds->item(0)->nodeValue, 'Customer Name') !== false) {
                    $info['customer_name'] = trim($tds->item(1)->nodeValue);
                    $info['sc_no'] = trim($tds->item(3)->nodeValue);
                }
                if ($tds->length >= 4 && strpos($tds->item(0)->nodeValue, 'NEA Location') !== false) {
                    $info['location'] = trim($tds->item(1)->nodeValue);
                    $info['consumer_id'] = trim($tds->item(3)->nodeValue);
                }
            }
            break;
        }
    }

    // Extract bills with enhanced validation
    $bills = [];
    $rows = $xpath->query('//table[contains(@class,"sortable")]/tr');
    foreach ($rows as $row) {
        $cols = $row->getElementsByTagName('td');
        if ($cols->length >= 13) {
            $status = trim($cols->item(1)->nodeValue);
            $bill_date = trim($cols->item(3)->nodeValue);

            if (strtoupper($bill_date) === 'TOTAL') {
                continue;
            }

            $bills[] = [
                'status'       => $status,
                'period'       => trim($cols->item(2)->nodeValue),
                'bill_date'    => $bill_date,
                'units'        => trim($cols->item(4)->nodeValue),
                'amount'       => trim($cols->item(5)->nodeValue),
                'rebate'       => trim($cols->item(6)->nodeValue),
                'rate'         => trim($cols->item(7)->nodeValue),
                'payable'      => trim($cols->item(8)->nodeValue),
                'paid_amount'  => trim($cols->item(9)->nodeValue),
                'merchant'     => trim($cols->item(10)->nodeValue),
                'txn_id'       => trim($cols->item(11)->nodeValue),
                'paid_date'    => trim($cols->item(12)->nodeValue),
            ];
        }
    }

    return [
        'info' => $info,
        'bills' => $bills
    ];
}

// Function to format currency
function formatCurrency($amount) {
    return 'Rs. ' . number_format((float)$amount, 2);
}

// Function to get status badge
function getStatusBadge($status) {
    $badges = [
        'PAID' => '<span class="badge badge-success">✓ Paid</span>',
        'UN-PAID' => '<span class="badge badge-danger">✗ Unpaid</span>',
        'PENDING' => '<span class="badge badge-warning">⏳ Pending</span>',
    ];
    return $badges[$status] ?? '<span class="badge badge-secondary">' . $status . '</span>';
}

// Input validation function
function validateInput($data) {
    $errors = [];
    
    if (empty($data['houses'])) {
        $errors[] = 'Please select at least one house';
    }
    
    if (empty($data['from_date']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['from_date'])) {
        $errors[] = 'Invalid from date format';
    }
    
    if (empty($data['to_date']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['to_date'])) {
        $errors[] = 'Invalid to date format';
    }
    
    if (strtotime($data['from_date']) > strtotime($data['to_date'])) {
        $errors[] = 'From date cannot be later than to date';
    }
    
    return $errors;
}
?>

<!DOCTYPE html>
<?php
// [Previous PHP code remains the same until the HTML section]
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEA Bill Checker by PT</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>');
            opacity: 0.3;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            position: relative;
        }

        .header p {
            opacity: 0.9;
            position: relative;
        }

        .form-section {
            padding: 30px;
            background: #f8f9fa;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 15px;
            font-weight: 600;
            color: #2c3e50;
        }

        .house-selection {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }

        .house-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }

        .house-card:hover {
            border-color: #3498db;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .house-card.selected {
            border-color: #27ae60;
            background: #f8fff8;
            box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
        }

        /* Custom Checkbox Styling */
        .custom-checkbox {
            position: relative;
            display: inline-block;
            width: 24px;
            height: 24px;
            margin-top: 5px;
            flex-shrink: 0;
        }

        .custom-checkbox input[type="checkbox"] {
            opacity: 0;
            width: 0;
            height: 0;
            position: absolute;
        }

        .checkmark {
            position: absolute;
            top: 0;
            left: 0;
            height: 24px;
            width: 24px;
            background-color: #fff;
            border: 2px solid #ddd;
            border-radius: 4px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .custom-checkbox:hover .checkmark {
            border-color: #3498db;
            background-color: #f8f9ff;
        }

        .custom-checkbox input:checked ~ .checkmark {
            background-color: #27ae60;
            border-color: #27ae60;
        }

        .checkmark::after {
            content: "";
            position: absolute;
            display: none;
        }

        .custom-checkbox input:checked ~ .checkmark::after {
            display: block;
        }

        .custom-checkbox .checkmark::after {
            left: 6px;
            top: 2px;
            width: 6px;
            height: 12px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }

        .house-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .house-icon {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .house-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
            font-size: 16px;
        }

        .house-details {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }

        .date-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .date-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
        }

        .date-input:focus {
            outline: none;
            border-color: #3498db;
        }

        .submit-btn {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            padding: 15px 40px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
        }

        .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #666;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .selection-summary {
            background: #e8f5e8;
            border: 1px solid #c3e6c3;
            border-radius: 8px;
            padding: 12px;
            margin-top: 15px;
            display: none;
        }

        .selection-summary.show {
            display: block;
        }

        .selection-summary h4 {
            margin: 0 0 8px 0;
            color: #2c3e50;
            font-size: 14px;
        }

        .selected-houses {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .selected-house-tag {
            background: #27ae60;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        /* Rest of the CSS remains the same... */
        .results-section {
            padding: 30px;
        }

        .result-card {
            background: white;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .result-header {
            background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .result-header h3 {
            font-size: 20px;
            margin: 0;
        }

        .customer-info {
            padding: 20px;
            background: #f8f9fa;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }

        .info-label {
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 16px;
            color: #2c3e50;
        }

        .bills-container {
            padding: 20px;
        }

        .bills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }

        .bill-card {
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s ease;
            position: relative;
        }

        .bill-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .bill-card.paid {
            border-left: 5px solid #27ae60;
            background: #f8fff8;
        }

        .bill-card.unpaid {
            border-left: 5px solid #e74c3c;
            background: #fff5f5;
        }

        .bill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .bill-period {
            font-weight: 600;
            color: #2c3e50;
            font-size: 16px;
        }

        .badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .badge-success {
            background: #d4edda;
            color: #155724;
        }

        .badge-danger {
            background: #f8d7da;
            color: #721c24;
        }

        .badge-warning {
            background: #fff3cd;
            color: #856404;
        }

        .badge-secondary {
            background: #e2e3e5;
            color: #383d41;
        }

        .bill-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }

        .bill-detail {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .bill-detail:last-child {
            border-bottom: none;
        }

        .bill-amount {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-top: 10px;
        }

        .amount-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }

        .amount-value {
            font-size: 24px;
            font-weight: 700;
            color: #2c3e50;
        }

        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
        }

        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #2c3e50;
        }

        .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .date-inputs {
                grid-template-columns: 1fr;
            }
            
            .house-selection {
                grid-template-columns: 1fr;
            }
            
            .bills-grid {
                grid-template-columns: 1fr;
            }
            
            .customer-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-bolt"></i> NEA Bill Checker</h1>
            <p>Professional Electricity Billing Dashboard</p>
        </div>

        <div class="form-section">
            <form method="POST" id="billForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-home"></i> Select Properties
                        </label>
                        <div class="house-selection">
                            <?php foreach ($houses as $key => $house): ?>
                                <div class="house-card" data-house="<?= $key ?>">
                                    <div class="custom-checkbox">
                                        <input type="checkbox" name="houses[]" value="<?= $key ?>" id="house_<?= $key ?>"
                                               <?= isset($_POST['houses']) && in_array($key, $_POST['houses']) ? 'checked' : '' ?>>
                                        <span class="checkmark"></span>
                                    </div>
                                    <div class="house-content">
                                        <span class="house-icon"><?= $house['icon'] ?></span>
                                        <div class="house-title"><?= $house['label'] ?></div>
                                        <div class="house-details">
                                            SC: <?= $house['sc_no'] ?><br>
                                            ID: <?= $house['consumer_id'] ?>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        
                        <div class="selection-summary" id="selectionSummary">
                            <h4><i class="fas fa-check-circle"></i> Selected Properties:</h4>
                            <div class="selected-houses" id="selectedHouses"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-calendar-alt"></i> Date Range
                        </label>
                        <div class="date-inputs">
                            <div>
                                <input type="date" name="from_date" class="date-input" required 
                                       value="<?= $_POST['from_date'] ?? '' ?>" placeholder="From Date">
                            </div>
                            <div>
                                <input type="date" name="to_date" class="date-input" required 
                                       value="<?= $_POST['to_date'] ?? '' ?>" placeholder="To Date">
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" class="submit-btn">
                    <i class="fas fa-search"></i>
                    View Bills
                </button>
            </form>

            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Fetching billing data...</p>
            </div>
        </div>

        <?php
        // [Previous PHP result processing code remains the same]
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['houses'])) {
            $errors = validateInput($_POST);
            
            if (!empty($errors)) {
                echo '<div class="error-message">';
                foreach ($errors as $error) {
                    echo '<p><i class="fas fa-exclamation-triangle"></i> ' . htmlspecialchars($error) . '</p>';
                }
                echo '</div>';
            } else {
                $from = date('m/d/Y', strtotime($_POST['from_date']));
                $to = date('m/d/Y', strtotime($_POST['to_date']));
                
                $totalPaid = 0;
                $totalUnpaid = 0;
                $totalBills = 0;
                
                echo '<div class="results-section">';
                
                foreach ($_POST['houses'] as $key) {
                    if (!isset($houses[$key])) continue;

                    $house = $houses[$key];
                    $location = $house['region_id'];
                    $sc_no = $house['sc_no'];
                    $consumer_id = $house['consumer_id'];

                    $result = fetchBill($location, $sc_no, $consumer_id, $from, $to);

                    if (isset($result['error'])) {
                        echo '<div class="error-message">';
                        echo '<h4>' . $house['icon'] . ' ' . $house['label'] . '</h4>';
                        echo '<p><i class="fas fa-exclamation-triangle"></i> ' . htmlspecialchars($result['error']) . '</p>';
                        echo '</div>';
                        continue;
                    }

                    echo '<div class="result-card">';
                    echo '<div class="result-header">';
                    echo '<span style="font-size: 24px;">' . $house['icon'] . '</span>';
                    echo '<div>';
                    echo '<h3>' . htmlspecialchars($house['label']) . '</h3>';
                    echo '<small>' . htmlspecialchars($result['info']['customer_name']) . '</small>';
                    echo '</div>';
                    echo '</div>';

                    echo '<div class="customer-info">';
                    echo '<div class="info-item">';
                    echo '<div class="info-label">Customer Name</div>';
                    echo '<div class="info-value">' . htmlspecialchars($result['info']['customer_name']) . '</div>';
                    echo '</div>';
                    echo '<div class="info-item">';
                    echo '<div class="info-label">SC Number</div>';
                    echo '<div class="info-value">' . htmlspecialchars($result['info']['sc_no']) . '</div>';
                    echo '</div>';
                    echo '<div class="info-item">';
                    echo '<div class="info-label">Consumer ID</div>';
                    echo '<div class="info-value">' . htmlspecialchars($result['info']['consumer_id']) . '</div>';
                    echo '</div>';
                    echo '<div class="info-item">';
                    echo '<div class="info-label">Location</div>';
                    echo '<div class="info-value">' . htmlspecialchars($result['info']['location']) . '</div>';
                    echo '</div>';
                    echo '</div>';

                    if (!empty($result['bills'])) {
                        echo '<div class="bills-container">';
                        echo '<div class="bills-grid">';

                        foreach ($result['bills'] as $bill) {
                            $isPaid = in_array($bill['status'], ['PAID', 'PAY ADVANCE']);
                            $cardClass = $isPaid ? 'paid' : 'unpaid';
                            $totalBills++;
                            
                            if ($isPaid) {
                                $totalPaid += (float)$bill['paid_amount'];
                            } else {
                                $totalUnpaid += (float)$bill['payable'];
                            }

                            echo '<div class="bill-card ' . $cardClass . '">';
                            echo '<div class="bill-header">';
                            echo '<div class="bill-period">' . htmlspecialchars($bill['period']) . '</div>';
                            echo getStatusBadge($bill['status']);
                            echo '</div>';

                            echo '<div class="bill-details">';
                            echo '<div class="bill-detail">';
                            echo '<span>Bill Date:</span>';
                            echo '<span>' . htmlspecialchars($bill['bill_date']) . '</span>';
                            echo '</div>';
                            echo '<div class="bill-detail">';
                            echo '<span>Units:</span>';
                            echo '<span>' . htmlspecialchars($bill['units']) . '</span>';
                            echo '</div>';
                            echo '<div class="bill-detail">';
                            echo '<span>Rate:</span>';
                            echo '<span>' . formatCurrency($bill['rate']) . '</span>';
                            echo '</div>';
                            echo '<div class="bill-detail">';
                            echo '<span>Amount:</span>';
                            echo '<span>' . formatCurrency($bill['amount']) . '</span>';
                            echo '</div>';
                            if ($bill['rebate'] > 0) {
                                echo '<div class="bill-detail">';
                                echo '<span>Rebate:</span>';
                                echo '<span>' . formatCurrency($bill['rebate']) . '</span>';
                                echo '</div>';
                            }
                            if ($isPaid) {
                                echo '<div class="bill-detail">';
                                echo '<span>Paid Date:</span>';
                                echo '<span>' . htmlspecialchars($bill['paid_date']) . '</span>';
                                echo '</div>';
                                echo '<div class="bill-detail">';
                                echo '<span>Transaction ID:</span>';
                                echo '<span>' . htmlspecialchars($bill['txn_id']) . '</span>';
                                echo '</div>';
                            }
                            echo '</div>';

                            echo '<div class="bill-amount">';
                            echo '<div class="amount-label">' . ($isPaid ? 'Paid Amount' : 'Payable Amount') . '</div>';
                            echo '<div class="amount-value">' . formatCurrency($isPaid ? $bill['paid_amount'] : $bill['payable']) . '</div>';
                            echo '</div>';

                            echo '</div>';
                        }

                        echo '</div>';
                        echo '</div>';
                    } else {
                        echo '<div class="bills-container">';
                        echo '<p style="text-align: center; color: #666; padding: 40px;">No bills found for the selected date range.</p>';
                        echo '</div>';
                    }

                    echo '</div>';
                }

                if ($totalBills > 0) {
                    echo '<div class="summary-stats">';
                    echo '<div class="stat-card">';
                    echo '<div class="stat-value">' . $totalBills . '</div>';
                    echo '<div class="stat-label">Total Bills</div>';
                    echo '</div>';
                    echo '<div class="stat-card">';
                    echo '<div class="stat-value">' . formatCurrency($totalPaid) . '</div>';
                    echo '<div class="stat-label">Total Paid</div>';
                    echo '</div>';
                    echo '<div class="stat-card">';
                    echo '<div class="stat-value">' . formatCurrency($totalUnpaid) . '</div>';
                    echo '<div class="stat-label">Total Unpaid</div>';
                    echo '</div>';
                    echo '<div class="stat-card">';
                    echo '<div class="stat-value">' . formatCurrency($totalPaid + $totalUnpaid) . '</div>';
                    echo '<div class="stat-label">Grand Total</div>';
                    echo '</div>';
                    echo '</div>';
                }
                
                echo '</div>';
            }
        }
        ?>
    </div>

    <script>
        const houses = <?= json_encode($houses) ?>;
        
        // Enhanced checkbox handling
        document.querySelectorAll('.house-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking directly on checkbox
                if (e.target.type === 'checkbox') return;
                
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                updateCardState(this, checkbox.checked);
                updateSelectionSummary();
            });
        });

        // Handle direct checkbox clicks
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateCardState(this.closest('.house-card'), this.checked);
                updateSelectionSummary();
            });
        });

        function updateCardState(card, checked) {
            if (checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }

        function updateSelectionSummary() {
            const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const summaryDiv = document.getElementById('selectionSummary');
            const selectedHousesDiv = document.getElementById('selectedHouses');
            
            if (selectedCheckboxes.length > 0) {
                summaryDiv.classList.add('show');
                selectedHousesDiv.innerHTML = '';
                
                selectedCheckboxes.forEach(checkbox => {
                    const houseKey = checkbox.value;
                    const house = houses[houseKey];
                    if (house) {
                        const tag = document.createElement('div');
                        tag.className = 'selected-house-tag';
                        tag.innerHTML = `${house.icon} ${house.label}`;
                        selectedHousesDiv.appendChild(tag);
                    }
                });
            } else {
                summaryDiv.classList.remove('show');
            }
        }

        // Form submission handling
        document.getElementById('billForm').addEventListener('submit', function(e) {
            const selectedHouses = document.querySelectorAll('input[type="checkbox"]:checked');
            
            if (selectedHouses.length === 0) {
                e.preventDefault();
                alert('Please select at least one property to check bills.');
                return;
            }
            
            const loading = document.getElementById('loading');
            const submitBtn = document.querySelector('.submit-btn');
            
            loading.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        });

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Set initial states for pre-selected checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                updateCardState(checkbox.closest('.house-card'), checkbox.checked);
            });
            updateSelectionSummary();
            
            // Hide loading on page load
            document.getElementById('loading').style.display = 'none';
        });
    </script>
</body>
</html>

