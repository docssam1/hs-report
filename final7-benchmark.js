/* 최종 실전 7회 호환 진입점. 최종 1~4회 분포/등급 컷은 합치거나 수정하지 않는다.
 * final8-benchmark.js의 공용 어댑터가 시그니처 1·2회 공식을 재사용한다. */
(function(root){
  'use strict';
  if(root.GFIELD_FINAL_STANDALONE_BENCHMARK)
    root.GFIELD_FINAL7_BENCHMARK=root.GFIELD_FINAL_STANDALONE_BENCHMARK;
})(typeof window==='object'?window:globalThis);
