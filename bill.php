<?php
require_once 'nea.php';

// ==== Telegram Bot Setup ====
$botToken = '7884551034:AAFRPL_HFo34_c_8u1LBlHLE8VkMHhA1lyQ';
$allowedUserId = '5810854501';

// ==== User Sessions (Simple file-based storage) ====
$sessionFile = 'user_sessions.json';

// ==== Incoming Update ====
$update = json_decode(file_get_contents('php://input'), true);
$chatId = $update['message']['chat']['id'] ?? $update['callback_query']['message']['chat']['id'] ?? '';
$fromId = $update['message']['from']['id'] ?? $update['callback_query']['from']['id'] ?? '';
$message = strtolower(trim($update['message']['text'] ?? ''));
$callbackData = $update['callback_query']['data'] ?? '';

// ==== Security Check ====
if ($fromId != $allowedUserId) {
    sendTelegram($botToken, $chatId, "❌ Unauthorized access denied.");
    exit;
}

// ==== Handle Callback Queries ====
if ($callbackData) {
    handleCallbackQuery($callbackData, $chatId);
    exit;
}

// ==== Command Handler ====
switch (true) {
    case $message === '/start':
        sendWelcomeMessage($chatId);
        break;

    case $message === '/bill':
        showBillMenu($chatId);
        break;

    case $message === '/latest':
        $response = getLatestBills();
        sendTelegram($botToken, $chatId, $response, true);
        break;

    case $message === '/unpaid':
        $response = getUnpaidBills();
        sendTelegram($botToken, $chatId, $response, true);
        break;

    case $message === '/summary':
        $response = getBillsSummary();
        sendTelegram($botToken, $chatId, $response, true);
        break;

    case $message === '/houses':
        showHousesList($chatId);
        break;

    case $message === '/help':
        sendHelpMessage($chatId);
        break;

    case strpos($message, '/custom') === 0:
        handleCustomDateCommand($message, $chatId);
        break;

    case strpos($message, '/house') === 0:
        handleHouseCommand($message, $chatId);
        break;

    default:
        sendTelegram($botToken, $chatId, "❓ Unknown command. Type /help for available commands.");
}

// ==== Enhanced Functions ====

function sendWelcomeMessage($chatId) {
    global $botToken;
    
    $message = "🏠 *Welcome to NEA Bill Checker Bot!*\n\n";
    $message .= "I can help you check electricity bills for your properties.\n\n";
    $message .= "*Quick Commands:*\n";
    $message .= "• `/bill` - Interactive bill menu\n";
    $message .= "• `/latest` - Latest bills (current month)\n";
    $message .= "• `/unpaid` - Show unpaid bills only\n";
    $message .= "• `/summary` - Complete bill summary\n";
    $message .= "• `/houses` - List all properties\n";
    $message .= "• `/help` - Show all commands\n\n";
    $message .= "_Developed by P_";
    
    sendTelegram($botToken, $chatId, $message, true);
}

function showBillMenu($chatId) {
    global $botToken;
    
    $keyboard = [
        [
            ['text' => '📄 Latest Bills', 'callback_data' => 'latest_bills'],
            ['text' => '❌ Unpaid Bills', 'callback_data' => 'unpaid_bills']
        ],
        [
            ['text' => '📊 Full Summary', 'callback_data' => 'full_summary'],
            ['text' => '🏠 Select House', 'callback_data' => 'select_house']
        ],
        [
            ['text' => '📅 Custom Date', 'callback_data' => 'custom_date'],
            ['text' => '💰 Payment Summary', 'callback_data' => 'payment_summary']
        ]
    ];
    
    sendInlineKeyboard($chatId, "🏠 *NEA Bill Menu*\n\nChoose an option:", $keyboard);
}

function showHousesList($chatId) {
    global $botToken, $houses;
    
    $message = "🏠 *Your Properties:*\n\n";
    $count = 1;
    
    foreach ($houses as $key => $house) {
        $message .= "{$count}. {$house['icon']} *{$house['label']}*\n";
        $message .= "   📍 SC: `{$house['sc_no']}`\n";
        $message .= "   🆔 ID: `{$house['consumer_id']}`\n\n";
        $count++;
    }
    
    $message .= "💡 *Tip:* Use `/house 1` to get bills for specific property";
    
    sendTelegram($botToken, $chatId, $message, true);
}

function sendHelpMessage($chatId) {
    global $botToken;
    
    $message = "📋 *Available Commands:*\n\n";
    $message .= "*Basic Commands:*\n";
    $message .= "• `/start` - Welcome message\n";
    $message .= "• `/bill` - Interactive bill menu\n";
    $message .= "• `/latest` - Current month bills\n";
    $message .= "• `/unpaid` - Show unpaid bills\n";
    $message .= "• `/summary` - Complete summary\n";
    $message .= "• `/houses` - List all properties\n\n";
    
    $message .= "*Advanced Commands:*\n";
    $message .= "• `/house [number]` - Bills for specific house\n";
    $message .= "• `/custom YYYY-MM-DD YYYY-MM-DD` - Custom date range\n\n";
    
    $message .= "*Examples:*\n";
    $message .= "• `/house 1` - Bills for first property\n";
    $message .= "• `/custom 2024-01-01 2024-01-31` - January 2024 bills\n\n";
    
    $message .= "🤖 *Need help?* Contact the developer.";
    
    sendTelegram($botToken, $chatId, $message, true);
}

function handleCallbackQuery($data, $chatId) {
    global $botToken;
    
    switch ($data) {
        case 'latest_bills':
            $response = getLatestBills();
            sendTelegram($botToken, $chatId, $response, true);
            break;
            
        case 'unpaid_bills':
            $response = getUnpaidBills();
            sendTelegram($botToken, $chatId, $response, true);
            break;
            
        case 'full_summary':
            $response = getBillsSummary();
            sendTelegram($botToken, $chatId, $response, true);
            break;
            
        case 'select_house':
            showHouseSelection($chatId);
            break;
            
        case 'custom_date':
            sendTelegram($botToken, $chatId, "📅 *Custom Date Range*\n\nUse: `/custom YYYY-MM-DD YYYY-MM-DD`\n\n*Example:*\n`/custom 2024-01-01 2024-01-31`", true);
            break;
            
        case 'payment_summary':
            $response = getPaymentSummary();
            sendTelegram($botToken, $chatId, $response, true);
            break;
            
        default:
            if (strpos($data, 'house_') === 0) {
                $houseIndex = (int)str_replace('house_', '', $data);
                $response = getHouseBills($houseIndex);
                sendTelegram($botToken, $chatId, $response, true);
            }
    }
}

function showHouseSelection($chatId) {
    global $houses;
    
    $keyboard = [];
    $count = 1;
    $row = [];
    
    foreach ($houses as $key => $house) {
        $row[] = ['text' => "{$house['icon']} {$house['label']}", 'callback_data' => "house_{$count}"];
        
        if (count($row) == 2) {
            $keyboard[] = $row;
            $row = [];
        }
        $count++;
    }
    
    if (!empty($row)) {
        $keyboard[] = $row;
    }
    
    sendInlineKeyboard($chatId, "🏠 *Select a Property:*", $keyboard);
}

function getLatestBills() {
    global $houses;
    
    $from = date('m/01/Y');
    $to = date('m/d/Y');
    $summary = "📄 *Latest Bills (" . date('M Y') . ")*\n";
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    $totalAmount = 0;
    $unpaidCount = 0;
    
    foreach ($houses as $key => $house) {
        $res = fetchBill($house['region_id'], $house['sc_no'], $house['consumer_id'], $from, $to);
        
        if (isset($res['error'])) {
            $summary .= "🏠 *{$house['label']}*\n";
            $summary .= "❌ Error: {$res['error']}\n\n";
            continue;
        }
        
        $info = $res['info'];
        $bills = $res['bills'];
        
        $summary .= "🏠 *{$house['label']}* {$house['icon']}\n";
        $summary .= "👤 {$info['customer_name']}\n";
        
        if (empty($bills)) {
            $summary .= "📭 _No bills found_\n\n";
        } else {
            foreach ($bills as $bill) {
                $amount = (float)($bill['status'] === 'PAID' ? $bill['paid_amount'] : $bill['payable']);
                $totalAmount += $amount;
                
                if ($bill['status'] === 'UN-PAID') {
                    $unpaidCount++;
                    $summary .= "❌ *{$bill['period']}* – Rs. " . number_format($amount, 2) . " (DUE)\n";
                } else {
                    $summary .= "✅ *{$bill['period']}* – Rs. " . number_format($amount, 2) . " (PAID)\n";
                }
            }
        }
        $summary .= "\n";
    }
    
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $summary .= "💰 *Total Amount:* Rs. " . number_format($totalAmount, 2) . "\n";
    $summary .= "⚠️ *Unpaid Bills:* {$unpaidCount}\n";
    $summary .= "🕐 *Generated:* " . date('M d, Y H:i');
    
    return $summary;
}

function getUnpaidBills() {
    global $houses;
    
    $from = date('m/01/Y', strtotime('-3 months'));
    $to = date('m/d/Y');
    $summary = "❌ *Unpaid Bills Alert*\n";
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    $totalUnpaid = 0;
    $unpaidCount = 0;
    
    foreach ($houses as $key => $house) {
        $res = fetchBill($house['region_id'], $house['sc_no'], $house['consumer_id'], $from, $to);
        
        if (isset($res['error'])) continue;
        
        $info = $res['info'];
        $bills = $res['bills'];
        $hasUnpaid = false;
        
        foreach ($bills as $bill) {
            if ($bill['status'] === 'UN-PAID') {
                if (!$hasUnpaid) {
                    $summary .= "🏠 *{$house['label']}* {$house['icon']}\n";
                    $summary .= "👤 {$info['customer_name']}\n";
                    $hasUnpaid = true;
                }
                
                $amount = (float)$bill['payable'];
                $totalUnpaid += $amount;
                $unpaidCount++;
                
                $summary .= "❌ *{$bill['period']}* – Rs. " . number_format($amount, 2) . "\n";
                $summary .= "📅 Due: {$bill['bill_date']}\n\n";
            }
        }
        
        if ($hasUnpaid) {
            $summary .= "\n";
        }
    }
    
    if ($unpaidCount === 0) {
        $summary .= "🎉 *Great News!*\n";
        $summary .= "All bills are paid! ✅\n\n";
    } else {
        $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $summary .= "💰 *Total Unpaid:* Rs. " . number_format($totalUnpaid, 2) . "\n";
        $summary .= "📊 *Unpaid Count:* {$unpaidCount} bills\n";
        $summary .= "⚠️ *Action Required:* Please pay pending bills\n";
    }
    
    $summary .= "🕐 *Generated:* " . date('M d, Y H:i');
    
    return $summary;
}

function getBillsSummary() {
    global $houses;
    
    $from = date('m/01/Y', strtotime('-2 months'));
    $to = date('m/d/Y');
    $summary = "📊 *Complete Bill Summary*\n";
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    $totalPaid = 0;
    $totalUnpaid = 0;
    $totalBills = 0;
    
    foreach ($houses as $key => $house) {
        $res = fetchBill($house['region_id'], $house['sc_no'], $house['consumer_id'], $from, $to);
        
        if (isset($res['error'])) {
            $summary .= "🏠 *{$house['label']}*\n";
            $summary .= "❌ Error: {$res['error']}\n\n";
            continue;
        }
        
        $info = $res['info'];
        $bills = $res['bills'];
        
        $summary .= "🏠 *{$house['label']}* {$house['icon']}\n";
        $summary .= "👤 {$info['customer_name']}\n";
        $summary .= "📍 {$info['location']}\n\n";
        
        if (empty($bills)) {
            $summary .= "📭 _No bills found_\n\n";
        } else {
            foreach ($bills as $bill) {
                $totalBills++;
                
                if ($bill['status'] === 'UN-PAID') {
                    $amount = (float)$bill['payable'];
                    $totalUnpaid += $amount;
                    $summary .= "❌ *{$bill['period']}* – Rs. " . number_format($amount, 2) . "\n";
                } else {
                    $amount = (float)$bill['paid_amount'];
                    $totalPaid += $amount;
                    $summary .= "✅ *{$bill['period']}* – Rs. " . number_format($amount, 2) . "\n";
                }
            }
        }
        $summary .= "\n";
    }
    
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $summary .= "📊 *Statistics:*\n";
    $summary .= "• Total Bills: {$totalBills}\n";
    $summary .= "• Total Paid: Rs. " . number_format($totalPaid, 2) . "\n";
    $summary .= "• Total Unpaid: Rs. " . number_format($totalUnpaid, 2) . "\n";
    $summary .= "• Grand Total: Rs. " . number_format($totalPaid + $totalUnpaid, 2) . "\n";
    $summary .= "🕐 *Generated:* " . date('M d, Y H:i');
    
    return $summary;
}

function getPaymentSummary() {
    global $houses;
    
    $from = date('m/01/Y', strtotime('-6 months'));
    $to = date('m/d/Y');
    $summary = "💰 *Payment Summary (6 months)*\n";
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    $monthlyTotals = [];
    $totalPaid = 0;
    
    foreach ($houses as $key => $house) {
        $res = fetchBill($house['region_id'], $house['sc_no'], $house['consumer_id'], $from, $to);
        
        if (isset($res['error'])) continue;
        
        $bills = $res['bills'];
        
        foreach ($bills as $bill) {
            if ($bill['status'] === 'PAID' && !empty($bill['paid_date'])) {
                $amount = (float)$bill['paid_amount'];
                $totalPaid += $amount;
                
                // Extract month from paid date
                $month = date('M Y', strtotime($bill['paid_date']));
                if (!isset($monthlyTotals[$month])) {
                    $monthlyTotals[$month] = 0;
                }
                $monthlyTotals[$month] += $amount;
            }
        }
    }
    
    $summary .= "📈 *Monthly Breakdown:*\n";
    foreach ($monthlyTotals as $month => $amount) {
        $summary .= "• {$month}: Rs. " . number_format($amount, 2) . "\n";
    }
    
    $summary .= "\n💰 *Total Paid:* Rs. " . number_format($totalPaid, 2) . "\n";
    $summary .= "📊 *Average Monthly:* Rs. " . number_format($totalPaid / max(count($monthlyTotals), 1), 2) . "\n";
    $summary .= "🕐 *Generated:* " . date('M d, Y H:i');
    
    return $summary;
}

function handleCustomDateCommand($message, $chatId) {
    global $botToken;
    
    $parts = explode(' ', $message);
    
    if (count($parts) !== 3) {
        sendTelegram($botToken, $chatId, "❌ *Invalid format!*\n\nCorrect usage:\n`/custom YYYY-MM-DD YYYY-MM-DD`\n\n*Example:*\n`/custom 2024-01-01 2024-01-31`", true);
        return;
    }
    
    $fromDate = $parts[1];
    $toDate = $parts[2];
    
    if (!validateDate($fromDate) || !validateDate($toDate)) {
        sendTelegram($botToken, $chatId, "❌ *Invalid date format!*\n\nPlease use: YYYY-MM-DD format", true);
        return;
    }
    
    $response = getCustomDateBills($fromDate, $toDate);
    sendTelegram($botToken, $chatId, $response, true);
}

function handleHouseCommand($message, $chatId) {
    global $botToken;
    
    $parts = explode(' ', $message);
    
    if (count($parts) !== 2 || !is_numeric($parts[1])) {
        sendTelegram($botToken, $chatId, "❌ *Invalid format!*\n\nCorrect usage:\n`/house [number]`\n\n*Example:*\n`/house 1`", true);
        return;
    }
    
    $houseIndex = (int)$parts[1];
    $response = getHouseBills($houseIndex);
    sendTelegram($botToken, $chatId, $response, true);
}

function getCustomDateBills($fromDate, $toDate) {
    global $houses;
    
    $from = date('m/d/Y', strtotime($fromDate));
    $to = date('m/d/Y', strtotime($toDate));
    
    $summary = "📅 *Custom Date Bills*\n";
    $summary .= "🗓️ *Period:* " . date('M d, Y', strtotime($fromDate)) . " to " . date('M d, Y', strtotime($toDate)) . "\n";
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    $totalAmount = 0;
    $totalBills = 0;
    
    foreach ($houses as $key => $house) {
        $res = fetchBill($house['region_id'], $house['sc_no'], $house['consumer_id'], $from, $to);
        
        if (isset($res['error'])) {
            $summary .= "🏠 *{$house['label']}*\n";
            $summary .= "❌ Error: {$res['error']}\n\n";
            continue;
        }
        
        $info = $res['info'];
        $bills = $res['bills'];
        
        $summary .= "🏠 *{$house['label']}* {$house['icon']}\n";
        
        if (empty($bills)) {
            $summary .= "📭 _No bills found for this period_\n\n";
        } else {
            foreach ($bills as $bill) {
                $totalBills++;
                $amount = (float)($bill['status'] === 'PAID' ? $bill['paid_amount'] : $bill['payable']);
                $totalAmount += $amount;
                
                if ($bill['status'] === 'UN-PAID') {
                    $summary .= "❌ *{$bill['period']}* – Rs. " . number_format($amount, 2) . "\n";
                } else {
                    $summary .= "✅ *{$bill['period']}* – Rs. " . number_format($amount, 2) . "\n";
                }
            }
        }
        $summary .= "\n";
    }
    
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $summary .= "📊 *Total Bills:* {$totalBills}\n";
    $summary .= "💰 *Total Amount:* Rs. " . number_format($totalAmount, 2) . "\n";
    $summary .= "🕐 *Generated:* " . date('M d, Y H:i');
    
    return $summary;
}

function getHouseBills($houseIndex) {
    global $houses;
    
    $houseArray = array_values($houses);
    
    if ($houseIndex < 1 || $houseIndex > count($houseArray)) {
        return "❌ *Invalid house number!*\n\nUse `/houses` to see available properties.";
    }
    
    $house = $houseArray[$houseIndex - 1];
    
    $from = date('m/01/Y', strtotime('-2 months'));
    $to = date('m/d/Y');
    
    $res = fetchBill($house['region_id'], $house['sc_no'], $house['consumer_id'], $from, $to);
    
    if (isset($res['error'])) {
        return "❌ *Error for {$house['label']}:*\n{$res['error']}";
    }
    
    $info = $res['info'];
    $bills = $res['bills'];
    
    $summary = "🏠 *{$house['label']}* {$house['icon']}\n";
    $summary .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    $summary .= "👤 *Customer:* {$info['customer_name']}\n";
    $summary .= "📍 *Location:* {$info['location']}\n";
    $summary .= "🆔 *Consumer ID:* {$info['consumer_id']}\n";
    $summary .= "📄 *SC Number:* {$info['sc_no']}\n\n";
    
    if (empty($bills)) {
        $summary .= "📭 _No bills found_\n";
    } else {
        $summary .= "📊 *Recent Bills:*\n";
        foreach ($bills as $bill) {
            $amount = (float)($bill['status'] === 'PAID' ? $bill['paid_amount'] : $bill['payable']);
            
            if ($bill['status'] === 'UN-PAID') {
                $summary .= "❌ *{$bill['period']}* – Rs. " . number_format($amount, 2) . "\n";
                $summary .= "📅 Due: {$bill['bill_date']}\n\n";
            } else {
                $summary .= "✅ *{$bill['period']}* – Rs. " . number_format($amount, 2) . "\n";
                $summary .= "💳 Paid: {$bill['paid_date']}\n\n";
            }
        }
    }
    
    $summary .= "🕐 *Generated:* " . date('M d, Y H:i');
    
    return $summary;
}

function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

function sendTelegram($token, $chatId, $msg, $markdown = false) {
    $url = "https://api.telegram.org/bot$token/sendMessage";
    $data = [
        'chat_id' => $chatId,
        'text' => $msg,
        'parse_mode' => $markdown ? 'Markdown' : null
    ];
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($data)
        ]
    ]);
    
    file_get_contents($url, false, $context);
}

function sendInlineKeyboard($chatId, $message, $keyboard) {
    global $botToken;
    
    $url = "https://api.telegram.org/bot$botToken/sendMessage";
    $data = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'Markdown',
        'reply_markup' => json_encode(['inline_keyboard' => $keyboard])
    ];
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($data)
        ]
    ]);
    
    file_get_contents($url, false, $context);
}
?>
