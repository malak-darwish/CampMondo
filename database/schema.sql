UPDATE users SET password_hash = '$2b$12$Iw6E2.fA7bbt8YJoREBbueAahe5fQLE07yFfTK7BEaaZkKrMz9VyG';


ALTER USER 'campmondo'@'localhost' IDENTIFIED BY 'password123';
FLUSH PRIVILEGES;