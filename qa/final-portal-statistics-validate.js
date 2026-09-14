'use strict';
const assert=require('node:assert/strict'),core=require('../supabase/functions/hs-final-population/population-core.js'),portal=require('../supabase/functions/hs-final-portal-statistics/portal-service.js');
const baseline={schemaVersion:1,exam:'final2',scope:'provided-original-records',approved:true,version:'final2-'+'b'.repeat(64),rows:[{id:'a',ox:'O'.repeat(30),score:100},{id:'b',ox:'X'.repeat(30),score:0}]};
const result={student:'학생',round:'final2',ox:'O'.repeat(30),score:100,wrong:0,source:'admin'};
const service={from(table){assert.equal(table,'mock_results');const filters=[];const q={select(){return q;},eq(key,value){filters.push([key,value]);return q;},maybeSingle(){return Promise.resolve({data:filters.every(([key,value])=>result[key]===value)?structuredClone(result):null,error:null});}};return q;}};
(async()=>{
 const response=await portal.handle(service,{exam:'final2',student:'학생',resultOx:'O'.repeat(30)},core,{final2:baseline});
 assert.deepEqual(Object.keys(response),['snapshot']);assert.equal(response.snapshot.percentiles['1000'],50);
 assert.doesNotMatch(JSON.stringify(response),/"(?:student|resultOx|n|count|denominator|dist|rows|owner_id)"/);
 await assert.rejects(portal.handle(service,{exam:'final2',student:'학생',resultOx:'X'.repeat(30)},core,{final2:baseline}),error=>error.status===404);
 await assert.rejects(portal.handle(service,{exam:'final2',student:'학생',resultOx:'O'.repeat(30),extra:true},core,{final2:baseline}),error=>error.status===400);
 console.log('PASS isolated portal statistics: exact saved result only, no identity/count/raw distribution, no writes');
})().catch(error=>{console.error(error);process.exitCode=1;});
