import{describe,expect,it}from"vitest";import{checkoutReadyStorageKey,readReady}from"./ready";
const storage=(value:string|null)=>({getItem:(key:string)=>key===checkoutReadyStorageKey?value:null});
describe("ready state",()=>{it("ignores malformed and expired states",()=>{expect(readReady(storage("{"))).toBeNull();expect(readReady(storage(JSON.stringify({version:1,url:"https://wa.me/1",createdAt:0})),31*60*1000)).toBeNull()});it("accepts a fresh versioned URL",()=>expect(readReady(storage(JSON.stringify({version:1,url:"https://wa.me/1",createdAt:1000})),1001)).toBe("https://wa.me/1"))});
