#!/bin/zsh

cd "$(dirname "$0")"

open "export-instagram.html"

echo ""
echo "1. No navegador, clique em Preview para iniciar a animacao."
echo "2. Volte para esta janela e pressione Enter."
echo "3. Selecione somente o retangulo vertical da animacao."
echo ""
echo "O arquivo sera salvo na Mesa como carq-instagram.mov."
echo ""
read "?Pressione Enter para iniciar a selecao de gravacao..."

/usr/sbin/screencapture -v -V 8 -i -J video "$HOME/Desktop/carq-instagram.mov"

echo ""
echo "Pronto: $HOME/Desktop/carq-instagram.mov"
echo "Esse formato MOV e compativel com Instagram."
echo ""
read "?Pressione Enter para fechar."
