#!/bin/bash

# Antigravity IDE 메모리 모니터
# 20GB 초과 시 Mac 알림 발송

THRESHOLD_GB=20
INTERVAL=30  # 30초마다 체크
NOTIFIED=false

echo "메모리 모니터 시작 (임계값: ${THRESHOLD_GB}GB, 체크 간격: ${INTERVAL}초)"
echo "종료하려면 Ctrl+C"
echo "---"

while true; do
  # Antigravity 프로세스 메모리 합산 (RSS, KB 단위)
  MEM_KB=$(ps aux | grep -i "antigravity" | grep -v grep | awk '{sum += $6} END {print sum}')

  if [ -z "$MEM_KB" ] || [ "$MEM_KB" -eq 0 ]; then
    echo "$(date '+%H:%M:%S') Antigravity IDE 실행 중 아님"
    NOTIFIED=false
  else
    MEM_GB=$(echo "scale=1; $MEM_KB / 1048576" | bc)
    echo "$(date '+%H:%M:%S') Antigravity 메모리: ${MEM_GB}GB"

    # 임계값 초과 시 알림 (한 번만)
    OVER=$(echo "$MEM_GB > $THRESHOLD_GB" | bc)
    if [ "$OVER" -eq 1 ] && [ "$NOTIFIED" = false ]; then
      osascript -e "display notification \"Antigravity IDE가 ${MEM_GB}GB 사용 중입니다. 재시작을 권장합니다.\" with title \"메모리 경고\" sound name \"Sosumi\""
      echo ">>> 경고 알림 발송됨 (${MEM_GB}GB)"
      NOTIFIED=true
    fi

    # 임계값 아래로 내려오면 알림 초기화
    if [ "$OVER" -eq 0 ]; then
      NOTIFIED=false
    fi
  fi

  sleep $INTERVAL
done
