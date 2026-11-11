#!/bin/bash

# "fail-fast": se qualquer comando der erro, o script para na hora.
set -e

echo "Iniciando MySQL..."
service mysql start

# Espera o MySQL aceitar conexões (máx. 30 tentativas de 1s).
echo "Aguardando MySQL ficar pronto..."
for tentativa in $(seq 1 30); do
    if mysqladmin ping --silent; then
        echo "MySQL pronto."
        break
    fi
    sleep 1
done

if ! mysqladmin ping --silent; then
    echo "Erro: MySQL não respondeu a tempo." >&2
    exit 1
fi

# Cria o banco e o usuário que o back-end (pasta backend/) vai usar.
echo "Configurando banco..."
mysql <<EOF
CREATE DATABASE IF NOT EXISTS conectaevent
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'conecta'@'%' IDENTIFIED BY 'conecta123';

GRANT ALL PRIVILEGES ON conectaevent.* TO 'conecta'@'%';

FLUSH PRIVILEGES;
EOF

echo "MySQL configurado com sucesso!"
