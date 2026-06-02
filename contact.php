<?php
// POSTリクエスト以外は拒否
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

header('Content-Type: application/json; charset=UTF-8');

mb_language('Japanese');
mb_internal_encoding('UTF-8');

// 入力値の取得
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$course  = trim($_POST['course']  ?? '');
$message = trim($_POST['message'] ?? '');

// バリデーション
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'validation']);
    exit;
}

// 講座名マッピング
$course_map = [
    'basic'      => 'ボディケア基礎コース',
    'startup'    => 'サロン開業トータルコース',
    'headspa'    => 'ドライヘッドスパ実践講座',
    'facial'     => 'フェイシャルクレンジング実践講座',
    'towel'      => 'プロのタオルワーク講座',
    'counseling' => 'リピートにつながるカウンセリング講座',
    'line'       => '予約につながる公式LINE活用講座',
    'unknown'    => 'まだわからない / まず相談したい',
];
$course_label = $course_map[$course] ?? '（未選択）';

// メール本文
$body = implode("\n", [
    '高崎セラピストスクールのお問い合わせフォームからメッセージが届きました。',
    '',
    '━━━━━━━━━━━━━━━━━━━━',
    'お名前　　　：' . $name,
    'メールアドレス：' . $email,
    '興味のある講座：' . $course_label,
    '━━━━━━━━━━━━━━━━━━━━',
    '',
    '【ご質問・ご相談内容】',
    $message,
    '',
    '━━━━━━━━━━━━━━━━━━━━',
    'このメールはお問い合わせフォームから自動送信されました。',
    '返信先：' . $email,
]);

$from    = 'noreply@etsukolab.com';
$to      = 'es.energy.yoshi@gmail.com';
$subject = '高崎セラピストスクール：お問い合わせが届きました';
$headers = implode("\r\n", [
    'From: ' . $from,
    'Reply-To: ' . $email,
]);

$result = mb_send_mail($to, $subject, $body, $headers);

if ($result) {
    echo json_encode(['status' => 'ok']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'mail_failed']);
}
