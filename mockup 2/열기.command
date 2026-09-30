#!/bin/bash
cd "$(dirname "$0")"
PORT=8123
echo "BLUE EGG 목업 — http://localhost:$PORT/marketing/ 로 엽니다."
echo "다 보시면 이 창에서 Control+C 를 누르거나 창을 닫으세요."
(sleep 1; open "http://localhost:$PORT/marketing/") &
python3 -m http.server $PORT
