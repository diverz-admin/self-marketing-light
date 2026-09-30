import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn 규약의 클래스 병합 유틸.
 * 조건부 클래스(clsx)를 합친 뒤 Tailwind 충돌을 뒤쪽 값으로 정리한다(twMerge).
 * 외부에서 받아온 컴포넌트가 `@/lib/utils` 의 `cn` 을 기대하므로 같은 시그니처로 둔다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
