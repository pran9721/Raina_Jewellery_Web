<?php
// Run from terminal only: php create_admin.php admin@example.com "StrongPassword123!" "Store Admin"
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__.'/api/bootstrap.php';
if ($argc < 3) { fwrite(STDERR, "Usage: php create_admin.php email password [name]\n"); exit(1); }
$email=strtolower(trim($argv[1]));$password=$argv[2];$name=$argv[3]??'RAINA Admin';
if($email !== 'pranshubatham0@gmail.com' || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($password)<12){fwrite(STDERR,"Only pranshubatham0@gmail.com can be provisioned as the store admin. Use a password of at least 12 characters.\n");exit(1);}
$pdo=db();$hash=password_hash($password,PASSWORD_DEFAULT);
$q=$pdo->prepare('INSERT INTO users(name,email,password_hash,role,is_active) VALUES(?,?,?,"admin",1) ON DUPLICATE KEY UPDATE name=VALUES(name),password_hash=VALUES(password_hash),role="admin",is_active=1');
$q->execute([$name,$email,$hash]);fwrite(STDOUT,"Admin account created/updated: {$email}\n");
